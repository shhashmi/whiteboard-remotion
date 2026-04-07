import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { Expression, JSXOpeningElement } from '@babel/types';
// @babel/traverse types

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ExtractedElement {
  component: string;
  line: number;
  props: Record<string, number | null>;
  bounds: { x: number; y: number; w: number; h: number } | null;
  timing: { startFrame: number; endFrame: number } | null;
}

export interface ExtractedScene {
  name: string;
  line: number;
  startFrame: number | null;
  endFrame: number | null;
  elements: ExtractedElement[];
}

export interface TsxAnalysis {
  scenes: ExtractedScene[];
  sceneCount: number;
  durationInFrames: number;
  componentNames: string[];
  unresolvedCount: number;
}

// ─── Numeric props we care about ───────────────────────────────────────────────

const NUMERIC_PROPS = new Set([
  'startFrame', 'endFrame', 'durationFrames', 'drawDuration',
  'x', 'y', 'width', 'height',
  'cx', 'cy', 'r',
  'x1', 'y1', 'x2', 'y2',
  'scale', 'fontSize',
]);

// ─── Static expression evaluator ───────────────────────────────────────────────

type Scope = Map<string, number>;

function tryEvalExpr(node: Expression, scope: Scope): number | null {
  switch (node.type) {
    case 'NumericLiteral':
      return node.value;

    case 'UnaryExpression':
      if (node.operator === '-') {
        const arg = tryEvalExpr(node.argument as Expression, scope);
        return arg !== null ? -arg : null;
      }
      return null;

    case 'BinaryExpression': {
      const left = tryEvalExpr(node.left as Expression, scope);
      const right = tryEvalExpr(node.right as Expression, scope);
      if (left === null || right === null) return null;
      switch (node.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right !== 0 ? left / right : null;
        case '%': return right !== 0 ? left % right : null;
        default: return null;
      }
    }

    case 'Identifier':
      return scope.get(node.name) ?? null;

    case 'MemberExpression':
      // Handle array[index] lookups where we know both the array and index
      return null;

    case 'CallExpression': {
      // Handle Math.ceil, Math.floor, Math.round, Math.max, Math.min
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'Math' &&
        node.callee.property.type === 'Identifier'
      ) {
        const args = node.arguments.map(a => tryEvalExpr(a as Expression, scope));
        if (args.some(a => a === null)) return null;
        const nums = args as number[];
        switch (node.callee.property.name) {
          case 'ceil': return Math.ceil(nums[0]);
          case 'floor': return Math.floor(nums[0]);
          case 'round': return Math.round(nums[0]);
          case 'max': return Math.max(...nums);
          case 'min': return Math.min(...nums);
          default: return null;
        }
      }
      return null;
    }

    case 'ConditionalExpression': {
      // For ternaries, try to eval the condition; if not, try both branches
      // and if they're both the same, return that
      const consequent = tryEvalExpr(node.consequent as Expression, scope);
      const alternate = tryEvalExpr(node.alternate as Expression, scope);
      if (consequent !== null && alternate !== null) {
        // Return the larger value as conservative bound
        return Math.max(consequent, alternate);
      }
      return consequent ?? alternate;
    }

    default:
      return null;
  }
}

// ─── Extract numeric props from a JSX opening element ──────────────────────────

function extractNumericProps(
  opening: JSXOpeningElement,
  scope: Scope,
): { props: Record<string, number | null>; unresolved: number } {
  const props: Record<string, number | null> = {};
  let unresolved = 0;

  for (const attr of opening.attributes) {
    if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') continue;
    const name = attr.name.name;
    if (!NUMERIC_PROPS.has(name)) continue;

    if (!attr.value) continue;

    if (attr.value.type === 'JSXExpressionContainer') {
      const val = tryEvalExpr(attr.value.expression as Expression, scope);
      props[name] = val;
      if (val === null) unresolved++;
    } else if (attr.value.type === 'StringLiteral') {
      const num = Number(attr.value.value);
      if (!isNaN(num)) props[name] = num;
    }
  }

  return { props, unresolved };
}

// ─── Derive bounding box from component-specific props ─────────────────────────

function deriveBounds(
  component: string,
  props: Record<string, number | null>,
): { x: number; y: number; w: number; h: number } | null {
  const get = (name: string): number | null => props[name] ?? null;

  if (component === 'SketchBox' || component === 'LabeledSketchBox') {
    const x = get('x'), y = get('y'), w = get('width'), h = get('height');
    if (x !== null && y !== null && w !== null && h !== null) {
      return { x, y, w, h };
    }
  }

  if (component === 'SketchCircle') {
    const cx = get('cx'), cy = get('cy'), r = get('r');
    if (cx !== null && cy !== null && r !== null) {
      return { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
    }
  }

  if (component === 'SketchArrow' || component === 'SketchLine') {
    const x1 = get('x1'), y1 = get('y1'), x2 = get('x2'), y2 = get('y2');
    if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        w: Math.abs(x2 - x1),
        h: Math.abs(y2 - y1),
      };
    }
  }

  // Icons and other cx/cy/scale components
  if (get('cx') !== null && get('cy') !== null && get('scale') !== null) {
    const cx = get('cx')!, cy = get('cy')!, scale = get('scale')!;
    const r = scale * 30; // approximate base size for icons
    return { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
  }

  return null;
}

// ─── Derive timing window ──────────────────────────────────────────────────────

function deriveTiming(
  props: Record<string, number | null>,
): { startFrame: number; endFrame: number } | null {
  const sf = props.startFrame ?? null;
  if (sf === null) return null;

  const dur = props.durationFrames ?? props.drawDuration ?? props.endFrame;
  if (dur === null) return null;

  // endFrame is absolute, durationFrames/drawDuration are relative
  if (props.endFrame !== undefined && props.endFrame !== null) {
    return { startFrame: sf, endFrame: props.endFrame };
  }
  return { startFrame: sf, endFrame: sf + dur };
}

// ─── Main analyzer ─────────────────────────────────────────────────────────────

export function analyzeTsx(code: string): TsxAnalysis {
  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch {
    return {
      scenes: [],
      sceneCount: 0,
      durationInFrames: 900,
      componentNames: [],
      unresolvedCount: 0,
    };
  }

  const scenes: ExtractedScene[] = [];
  const componentNameSet = new Set<string>();
  let totalUnresolved = 0;

  // Collect top-level const declarations for scope resolution
  const globalScope: Scope = new Map();

  traverse(ast, {
    VariableDeclarator(path) {
      if (
        path.node.id.type === 'Identifier' &&
        path.node.init?.type === 'NumericLiteral'
      ) {
        globalScope.set(path.node.id.name, path.node.init.value);
      }
    },
  });

  // Find all <Scene> JSX elements and their children
  traverse(ast, {
    JSXOpeningElement(path) {
      const name = path.node.name;
      if (name.type === 'JSXIdentifier') {
        const cName = name.name;
        if (/^[A-Z]/.test(cName) && cName !== 'React' && cName !== 'AbsoluteFill') {
          componentNameSet.add(cName);
        }
      }
    },
  });

  // Find scene component declarations (const Scene1: React.FC = () => ...)
  // and collect <Scene> JSX elements within them
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.id.type !== 'Identifier') return;
      const varName = path.node.id.name;
      if (!/^Scene\d+/.test(varName)) return;

      // Build a local scope from const declarations inside this component
      const localScope: Scope = new Map(globalScope);

      // Collect array literal data for .map() loop resolution
      const arrayData = new Map<string, Array<Record<string, unknown>>>();

      path.traverse({
        VariableDeclarator(innerPath) {
          const id = innerPath.node.id;
          const init = innerPath.node.init;
          if (!init) return;

          if (id.type === 'Identifier' && init.type === 'NumericLiteral') {
            localScope.set(id.name, init.value);
          }

          // Collect array literals for .map() resolution
          if (id.type === 'Identifier' && init.type === 'ArrayExpression') {
            const items: Array<Record<string, unknown>> = [];
            for (const elem of init.elements) {
              if (elem?.type === 'ObjectExpression') {
                const obj: Record<string, unknown> = {};
                for (const prop of elem.properties) {
                  if (
                    prop.type === 'ObjectProperty' &&
                    prop.key.type === 'Identifier' &&
                    prop.value.type === 'NumericLiteral'
                  ) {
                    obj[prop.key.name] = prop.value.value;
                  }
                }
                items.push(obj);
              }
            }
            if (items.length > 0) arrayData.set(id.name, items);
          }
        },
      });

      let currentScene: ExtractedScene | null = null;

      path.traverse({
        JSXOpeningElement(jsxPath) {
          const elName = jsxPath.node.name;
          if (elName.type !== 'JSXIdentifier') return;
          const component = elName.name;

          if (component === 'Scene') {
            // Extract scene-level startFrame/endFrame
            const { props } = extractNumericProps(jsxPath.node, localScope);
            currentScene = {
              name: varName,
              line: jsxPath.node.loc?.start.line ?? 0,
              startFrame: props.startFrame ?? null,
              endFrame: props.endFrame ?? null,
              elements: [],
            };
            scenes.push(currentScene);
            return;
          }

          if (!currentScene) return;
          if (!/^[A-Z]/.test(component)) return;
          if (['AbsoluteFill', 'SVG', 'React', 'AnimatedText', 'StaggeredMotion'].includes(component)) return;

          // Check if we're inside a .map() callback
          const mapScope: Scope = new Map(localScope);

          // Walk up to find enclosing .map() and resolve loop variables
          let ancestor = jsxPath.parentPath as typeof jsxPath.parentPath | null;
          while (ancestor) {
            if (
              ancestor.node.type === 'CallExpression' &&
              ancestor.node.callee.type === 'MemberExpression' &&
              ancestor.node.callee.property.type === 'Identifier' &&
              ancestor.node.callee.property.name === 'map'
            ) {
              const callback = ancestor.node.arguments[0];
              if (
                callback &&
                (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression')
              ) {
                // Set index param to 0 for first-iteration evaluation
                const params = callback.params;
                if (params.length >= 2 && params[1].type === 'Identifier') {
                  mapScope.set(params[1].name, 0);
                }

                // Try to resolve the array being mapped and get first item's numeric props
                const callee = ancestor.node.callee;
                if (callee.object.type === 'Identifier') {
                  const arrName = callee.object.name;
                  const arr = arrayData.get(arrName);
                  if (arr && arr.length > 0) {
                    // If first param is destructured or an identifier, populate scope from first array item
                    const firstParam = params[0];
                    if (firstParam.type === 'Identifier') {
                      // e.g. (example, i) => ... example.x
                      // We handle MemberExpression on this identifier
                      const firstItem = arr[0];
                      for (const [key, val] of Object.entries(firstItem)) {
                        if (typeof val === 'number') {
                          mapScope.set(`${firstParam.name}.${key}`, val);
                        }
                      }
                    }
                  }
                }
              }
              break;
            }
            ancestor = ancestor.parentPath;
          }

          // Build effective scope: for member expressions in props, we need
          // to resolve them from the map scope
          const effectiveScope = new Map(mapScope);

          // Extract props with member expression awareness
          const { props, unresolved } = extractNumericPropsWithMemberScope(
            jsxPath.node,
            effectiveScope,
          );
          totalUnresolved += unresolved;

          const element: ExtractedElement = {
            component,
            line: jsxPath.node.loc?.start.line ?? 0,
            props,
            bounds: deriveBounds(component, props),
            timing: deriveTiming(props),
          };

          currentScene.elements.push(element);
        },
      });
    },
  });

  const maxEndFrame = scenes.reduce((max, s) => {
    const ef = s.endFrame;
    return ef !== null && ef > max ? ef : max;
  }, 0);

  return {
    scenes,
    sceneCount: scenes.length,
    durationInFrames: maxEndFrame > 0 ? maxEndFrame : 900,
    componentNames: [...componentNameSet].filter(
      c => c !== 'Scene' && c !== 'SVG' && c !== 'AbsoluteFill'
    ),
    unresolvedCount: totalUnresolved,
  };
}

// ─── Extract numeric props with member expression scope ────────────────────────

function extractNumericPropsWithMemberScope(
  opening: JSXOpeningElement,
  scope: Scope,
): { props: Record<string, number | null>; unresolved: number } {
  const props: Record<string, number | null> = {};
  let unresolved = 0;

  for (const attr of opening.attributes) {
    if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') continue;
    const name = attr.name.name;
    if (!NUMERIC_PROPS.has(name)) continue;

    if (!attr.value) continue;

    if (attr.value.type === 'JSXExpressionContainer') {
      const val = tryEvalExprWithMembers(attr.value.expression as Expression, scope);
      props[name] = val;
      if (val === null) unresolved++;
    } else if (attr.value.type === 'StringLiteral') {
      const num = Number(attr.value.value);
      if (!isNaN(num)) props[name] = num;
    }
  }

  return { props, unresolved };
}

function tryEvalExprWithMembers(node: Expression, scope: Scope): number | null {
  if (node.type === 'MemberExpression') {
    if (
      node.object.type === 'Identifier' &&
      node.property.type === 'Identifier'
    ) {
      const key = `${node.object.name}.${node.property.name}`;
      return scope.get(key) ?? null;
    }
    return null;
  }
  return tryEvalExpr(node, scope);
}

// ─── Validation: timing ────────────────────────────────────────────────────────

export function validateTsxTiming(analysis: TsxAnalysis): string | null {
  const issues: string[] = [];

  for (let i = 0; i < analysis.scenes.length; i++) {
    const scene = analysis.scenes[i];
    if (scene.startFrame === null || scene.endFrame === null) continue;

    // First scene starts at 0
    if (i === 0 && scene.startFrame !== 0) {
      issues.push(`${scene.name}: first scene must start at frame 0, got ${scene.startFrame}`);
    }

    // Scene contiguity
    if (i > 0) {
      const prev = analysis.scenes[i - 1];
      if (prev.endFrame !== null && scene.startFrame !== prev.endFrame) {
        issues.push(
          `${scene.name}: startFrame (${scene.startFrame}) != previous scene endFrame (${prev.endFrame})`
        );
      }
    }

    const deadline = scene.endFrame - 60;
    const fadeInEnd = scene.startFrame + 30;

    for (const el of scene.elements) {
      if (!el.timing) continue;

      if (el.timing.endFrame > deadline) {
        issues.push(
          `${scene.name} line ${el.line}: ${el.component} ends@${el.timing.endFrame} but must finish by ${deadline} (endFrame-60)`
        );
      }

      if (el.timing.startFrame < fadeInEnd) {
        issues.push(
          `${scene.name} line ${el.line}: ${el.component} starts@${el.timing.startFrame} but scene fade-in ends at ${fadeInEnd}`
        );
      }
    }
  }

  return issues.length > 0 ? `TSX TIMING ISSUES:\n${issues.join('\n')}` : null;
}

// ─── Validation: bounds ────────────────────────────────────────────────────────

export function validateTsxBounds(analysis: TsxAnalysis): string | null {
  const issues: string[] = [];

  for (const scene of analysis.scenes) {
    const resolved = scene.elements.filter(e => e.bounds !== null);

    for (const el of resolved) {
      const b = el.bounds!;
      if (b.x < 0 || b.y < 0 || b.x + b.w > 1920 || b.y + b.h > 1080) {
        issues.push(
          `${scene.name} line ${el.line}: ${el.component} out of bounds (${b.x},${b.y},${b.w}x${b.h}) — canvas is 1920x1080`
        );
      }
    }

    // Overlap detection
    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const a = resolved[i].bounds!;
        const b = resolved[j].bounds!;

        const overlapX = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        const overlapArea = overlapX * overlapY;

        const areaA = a.w * a.h;
        const areaB = b.w * b.h;
        const smallerArea = Math.min(areaA, areaB);

        if (smallerArea > 0 && overlapArea / smallerArea > 0.3) {
          // Only flag if both elements are visible at the same time
          const tA = resolved[i].timing;
          const tB = resolved[j].timing;
          if (tA && tB) {
            const overlapsInTime = tA.startFrame < tB.endFrame && tB.startFrame < tA.endFrame;
            if (!overlapsInTime) continue;
          }

          issues.push(
            `${scene.name}: ${resolved[i].component}@line${resolved[i].line} and ${resolved[j].component}@line${resolved[j].line} overlap >${Math.round(overlapArea / smallerArea * 100)}%`
          );
        }
      }
    }
  }

  return issues.length > 0 ? `TSX BOUNDS ISSUES:\n${issues.join('\n')}` : null;
}
