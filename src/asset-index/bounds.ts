/**
 * Bounding-box helpers for layout validation.
 *
 * Used by validateLayout in src/generate.ts to detect overlaps between icons,
 * texts, SketchBoxes, and diagrams in generated TSX. All coordinates are in
 * the 1920×1080 SVG canvas space.
 */

import { ASSET_REGISTRY } from './registry';

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const ICON_BOX_BY_NAME = new Map<string, { width: number; height: number }>();
for (const e of ASSET_REGISTRY) {
  if (e.kind === 'icon' && e.defaultBox) ICON_BOX_BY_NAME.set(e.name, e.defaultBox);
}

const DIAGRAM_NAMES = new Set(
  ASSET_REGISTRY.filter((e) => e.kind === 'diagram').map((e) => e.name),
);

export function getIconBox(name: string): { width: number; height: number } | undefined {
  return ICON_BOX_BY_NAME.get(name);
}

export function isDiagram(name: string): boolean {
  return DIAGRAM_NAMES.has(name);
}

const ICON_NAMES = new Set(
  ASSET_REGISTRY.filter((e) => e.kind === 'icon').map((e) => e.name),
);

export function isIcon(name: string): boolean {
  return ICON_NAMES.has(name);
}

export function intersects(a: Box, b: Box): boolean {
  return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
}

/**
 * Bbox of an icon centered at (cx, cy) and rendered at the given scale.
 * Returns null if the icon has no defaultBox (parametric icon — caller should
 * read width/height from the call-site props directly).
 */
export function iconBox(name: string, cx: number, cy: number, scale = 1): Box | null {
  const box = ICON_BOX_BY_NAME.get(name);
  if (!box) return null;
  const w = box.width * scale;
  const h = box.height * scale;
  return { x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2 };
}

/**
 * Bbox of a HandWrittenText element. Mirrors the wrapping logic in
 * components.tsx::wrapText (charWidth = fontSize * 0.55).
 */
export function textBox(opts: {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  textAnchor: 'start' | 'middle' | 'end';
  maxWidth?: number;
}): Box {
  const { text, x, y, fontSize, textAnchor, maxWidth } = opts;
  const charWidth = fontSize * 0.55;
  const fullW = text.length * charWidth;
  const lineH = fontSize * 1.35;
  const w = maxWidth ? Math.min(fullW, maxWidth) : fullW;
  const lineCount = maxWidth ? Math.max(1, Math.ceil(fullW / maxWidth)) : 1;
  const h = lineCount === 1 ? fontSize * 1.2 : (lineCount - 1) * lineH + fontSize * 1.2;
  // y is the baseline (or top when baseline=hanging, but we treat conservatively
  // as baseline since most generated text uses default baseline).
  let x1: number;
  switch (textAnchor) {
    case 'start': x1 = x; break;
    case 'end': x1 = x - w; break;
    case 'middle':
    default: x1 = x - w / 2;
  }
  return { x1, y1: y - fontSize, x2: x1 + w, y2: y - fontSize + h };
}

/**
 * Bbox of a SketchBox. If `rows` text content is provided, height auto-grows
 * to fit (mirrors components.tsx::SketchBox effectiveHeight computation).
 */
export function sketchBoxBox(opts: {
  x: number;
  y: number;
  width: number;
  height?: number;
  rows?: Array<{ text: string; fontSize: number }>;
  padding?: number;
  gap?: number;
}): Box {
  const { x, y, width, rows } = opts;
  const padding = opts.padding ?? 24;
  const gap = opts.gap ?? 12;
  let effectiveHeight = opts.height ?? 0;
  if (rows && rows.length > 0) {
    const maxWidthForRow = width - 2 * padding;
    const charW = (fs: number) => fs * 0.55;
    const slot = (text: string, fs: number) => {
      const lines = Math.max(1, Math.ceil((text.length * charW(fs)) / Math.max(1, maxWidthForRow)));
      return lines * fs * 1.35;
    };
    const contentH = rows.reduce((sum, r) => sum + slot(r.text, r.fontSize), 0) + (rows.length - 1) * gap;
    effectiveHeight = Math.max(effectiveHeight, contentH + 2 * padding);
  }
  if (effectiveHeight <= 0) effectiveHeight = 100; // last-resort floor
  return { x1: x, y1: y, x2: x + width, y2: y + effectiveHeight };
}

const NODE_W = 220;
const NODE_H = 96;

/**
 * Bbox of an AgentCoordination diagram. Mirrors the layout math in
 * src/shared/diagrams/AgentCoordination.tsx so the validator's prediction
 * tracks what actually renders on canvas. Includes the 140px title space above.
 */
export function agentCoordinationBox(props: {
  cx?: number;
  cy?: number;
  radius?: number;
  agents?: string[] | number; // pass count if array elements aren't parsed
  pattern?: 'supervisor' | 'hierarchical' | 'peer';
  maxWidth?: number;
}): Box {
  const cx = props.cx ?? 960;
  const cy = props.cy ?? 560;
  const radius = props.radius ?? 300;
  const agentCount = typeof props.agents === 'number'
    ? props.agents
    : (props.agents?.length ?? 4);
  const pattern = props.pattern ?? 'supervisor';

  let w: number;
  if (pattern === 'hierarchical') {
    const desiredLeafSpan = Math.max(2 * radius, agentCount * (NODE_W + 40));
    const desiredFullExtent = desiredLeafSpan + NODE_W;
    const scale = props.maxWidth && desiredFullExtent > props.maxWidth
      ? props.maxWidth / desiredFullExtent
      : 1;
    const leafSpan = desiredLeafSpan * scale;
    const nodeW = Math.max(120, NODE_W * scale);
    w = leafSpan + nodeW;
  } else {
    // supervisor / peer — nodes arranged on a circle of `radius` around (cx, cy)
    w = 2 * radius + NODE_W;
  }
  return {
    x1: cx - w / 2,
    y1: cy - radius - 140 - 30,
    x2: cx + w / 2,
    y2: cy + radius + NODE_H / 2,
  };
}

/**
 * Generic fallback bbox for diagrams whose layout isn't modelled explicitly.
 * Approximates the diagram as a square of side `2 * radius + NODE_W` centered
 * at (cx, cy). Coarse but better than no check at all.
 */
export function genericDiagramBox(props: {
  cx?: number;
  cy?: number;
  radius?: number;
  width?: number;
}): Box {
  const cx = props.cx ?? 960;
  const cy = props.cy ?? 540;
  if (props.width) {
    return { x1: cx - props.width / 2, y1: cy - 200, x2: cx + props.width / 2, y2: cy + 200 };
  }
  const radius = props.radius ?? 300;
  const w = 2 * radius + NODE_W;
  const h = 2 * radius + NODE_H;
  return { x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2 };
}

/** Safe canvas zone: x ∈ [120, 1800], y ∈ [120, 960]. */
export const SAFE_ZONE: Box = { x1: 120, y1: 120, x2: 1800, y2: 960 };

export function inSafeZone(b: Box): boolean {
  return b.x1 >= SAFE_ZONE.x1 && b.y1 >= SAFE_ZONE.y1 && b.x2 <= SAFE_ZONE.x2 && b.y2 <= SAFE_ZONE.y2;
}

export function fmtBox(b: Box): string {
  return `(${Math.round(b.x1)},${Math.round(b.y1)})→(${Math.round(b.x2)},${Math.round(b.y2)})`;
}
