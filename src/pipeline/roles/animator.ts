import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import type { Script, VisualDirection } from '../types';
import { log } from '../logger';
import { searchSkills, fetchSkill } from '../tools/skill-registry';
import { searchBits, fetchBit } from '../tools/bits-registry';
import type { CostTracker } from '../cost-tracker';
import { validateVisuals } from './visual-validator';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 16384;

const ANIMATOR_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'search_skills',
    description:
      'Search the animation skills library for reusable animation patterns and techniques.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query for finding animation skills/patterns',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_skill',
    description: 'Fetch full details and content for a specific animation skill by name.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'The name of the skill to fetch',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'search_bits',
    description:
      'Search the remotion-bits component library for reusable, polished animation components.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query for finding component bits',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags (AND logic)',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_bit',
    description: 'Fetch full details and source code for a specific component bit by id.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The id of the bit to fetch',
        },
      },
      required: ['id'],
    },
  },
];

const COMPONENT_API = `
COMPONENT API REFERENCE (all from src/studymaterial/components.tsx):

HandWrittenText — Typewriter character-by-character text reveal in SVG
  Props: text (string), x (number), y (number), startFrame (number), durationFrames (number),
         fontSize? (number, default 32), fill? (string, default COLORS.outline),
         fontWeight? (number|string, default 700), textAnchor? ("start"|"middle"|"end", default "middle")

AnimatedPath — SVG path with stroke-dash draw animation
  Props: d (string), startFrame (number), drawDuration (number),
         stroke? (string), strokeWidth? (number, default 2.5),
         fill? (string, default "none"), fillOpacity? (number, default 1)

SketchBox — Wobbly-cornered rectangle
  Props: x (number), y (number), width (number), height (number),
         startFrame (number), drawDuration (number),
         stroke? (string), strokeWidth? (number, default 2.5),
         fill? (string, default "none"), fillOpacity? (number, default 0.15)

SketchCircle — Imperfect bezier circle
  Props: cx (number), cy (number), r (number), startFrame (number), drawDuration (number),
         stroke? (string), fill? (string, default "none"), fillOpacity? (number)

SketchArrow — Line with arrowhead
  Props: x1 (number), y1 (number), x2 (number), y2 (number),
         startFrame (number), drawDuration (number), color? (string), strokeWidth? (number)

SketchLine — Simple animated line
  Props: x1 (number), y1 (number), x2 (number), y2 (number),
         startFrame (number), drawDuration (number), color? (string), strokeWidth? (number)

SketchTable — Animated table
  Props: headers (string[]), rows (string[][]), x (number), y (number),
         colWidth? (number), rowHeight? (number), startFrame (number),
         framesPerRow? (number), headerColor? (string), fontSize? (number)

Scene — Container with 30-frame fade in/out. Returns null outside frame range.
  Props: startFrame (number), endFrame (number), children

CheckMark — Animated green checkmark
  Props: cx (number), cy (number), scale (number), startFrame (number), drawDuration (number), color? (string)

CrossMark — Animated red X
  Props: cx (number), cy (number), scale (number), startFrame (number), drawDuration (number), color? (string)

ICONS (all share: cx, cy, scale, startFrame, drawDuration):
  RobotHead (+color), PersonIcon (+shirtColor,hairColor), BrainIcon, GearIcon (+color),
  Lightbulb, ToolIcon, TargetIcon, DatabaseIcon, CodeIcon, CloudIcon,
  BookIcon (+color,label), MonitorIcon, BarChart, ClockIcon, DocStack

COLORS: COLORS.outline, COLORS.orange, COLORS.blue, COLORS.purple, COLORS.green,
        COLORS.yellow, COLORS.red, COLORS.gray1, COLORS.gray2, COLORS.gray3, COLORS.white
`;

const TIMING_REFERENCE = `
TIMING CONVENTIONS:
- Scene duration: 300-500 frames (10-17 sec at 30fps)
- Text: durationFrames ≈ ceil(text.length / 1.5)
- SketchBox draw: 18-30 frames
- SketchArrow draw: 10-15 frames
- Icon draw: 40-80 frames
- Stagger between items: 25-35 frames
- First element: sceneStart + 30 (after fade-in)
- CRITICAL: All content animations must COMPLETE by endFrame - 60 (leaves 30 frames hold + 30 frames fade-out)
- The last animation's (startFrame + durationFrames/drawDuration) must be <= endFrame - 60

LAYOUT (1920x1080 canvas):
- Title: x=960, y=68, fontSize=46, textAnchor="middle"
- Title underline: SketchLine y=82
- Content area: y=120 to y=950
- Side margins: 60-120px
- Hero icon: cx=960, cy=300-440, scale=2-4
`;

const REFERENCE_SCENES = `
REFERENCE SCENE A — Three cards with staggered timing (static JSX):
\`\`\`tsx
export const Scene3ThreePillars: React.FC = () => (
  <Scene startFrame={660} endFrame={900}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        <HandWrittenText text="Three Characteristics of Agentic AI" x={960} y={70}
          startFrame={690} durationFrames={35} fontSize={46} fill={COLORS.outline} fontWeight={700} textAnchor="middle" />
        <SketchLine x1={380} y1={82} x2={1540} y2={82} startFrame={725} drawDuration={20} color={COLORS.orange} strokeWidth={3} />

        {/* Card 1: Autonomy (blue) */}
        <SketchBox x={160} y={120} width={450} height={650} startFrame={715} drawDuration={30} stroke={COLORS.blue} strokeWidth={3} fill="#eff6ff" fillOpacity={0.6} />
        <HandWrittenText text="1" x={385} y={205} startFrame={735} durationFrames={15} fontSize={72} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <RobotHead cx={385} cy={350} scale={2.5} startFrame={745} drawDuration={40} color="#dbeafe" />
        <HandWrittenText text="AUTONOMY" x={385} y={490} startFrame={770} durationFrames={20} fontSize={34} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Acting without" x={385} y={535} startFrame={785} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

        {/* Card 2 and 3 follow same pattern — last animation must complete by endFrame-60 (frame 840) */}
      </SVG>
    </AbsoluteFill>
  </Scene>
);
\`\`\`

REFERENCE SCENE B — Hub-and-spoke with .map() loops and computed positions:
\`\`\`tsx
export const Scene7ToolUse: React.FC = () => {
  const leftCards = [
    { text: 'Search the web', bg: '#dbeafe', border: COLORS.blue, dx: -480, dy: -130 },
    { text: 'Query databases', bg: '#fce7f3', border: '#ec4899', dx: -520, dy: 20 },
    { text: 'Call APIs', bg: '#fef9c3', border: COLORS.yellow, dx: -460, dy: 170 },
  ];

  return (
    <Scene startFrame={2160} endFrame={2550}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          <RobotHead cx={960} cy={440} scale={3} startFrame={2190} drawDuration={60} color="#dcfce7" />

          {leftCards.map((card, i) => {
            const cx = 960 + card.dx;
            const cy = 440 + card.dy;
            const sf = 2250 + i * 25;
            return (
              <g key={\\\`l\${i}\\\`}>
                <SketchLine x1={960} y1={440} x2={cx + 80} y2={cy} startFrame={sf} drawDuration={15} color="#86efac" strokeWidth={1.5} />
                <SketchBox x={cx - 80} y={cy - 28} width={200} height={56} startFrame={sf + 10} drawDuration={18} stroke={card.border} strokeWidth={2} fill={card.bg} fillOpacity={0.9} />
                <HandWrittenText text={card.text} x={cx + 20} y={cy + 10} startFrame={sf + 28} durationFrames={18} fontSize={24} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
              </g>
            );
          })}
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};
\`\`\`

REFERENCE SCENE C — Step chain with .map() loop:
\`\`\`tsx
const steps = [
  { text: 'Read error logs', bg: '#dbeafe', border: COLORS.blue },
  { text: 'Search codebase', bg: '#dcfce7', border: COLORS.green },
  { text: 'Write a fix', bg: '#fce7f3', border: '#ec4899' },
];

{steps.map((step, i) => {
  const sy = 420 + i * 78;
  const sf = 1000 + i * 30;
  return (
    <g key={i}>
      <SketchBox x={330} y={sy} width={360} height={50} startFrame={sf} drawDuration={18}
        stroke={step.border} strokeWidth={2} fill={step.bg} fillOpacity={0.9} />
      <HandWrittenText text={step.text} x={510} y={sy + 32} startFrame={sf + 18}
        durationFrames={20} fontSize={22} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
      {i < steps.length - 1 && (
        <SketchArrow x1={510} y1={sy + 50} x2={510} y2={sy + 72}
          startFrame={sf + 30} drawDuration={10} color={step.border} strokeWidth={2} />
      )}
    </g>
  );
})}
\`\`\`
`;

const SYSTEM_PROMPT = `You are a Remotion developer writing React/TSX code for whiteboard-style animated explainer videos.

Given a script and visual direction, write the COMPLETE GeneratedVideo.tsx file — real React code with loops, computed positions, data arrays, conditional rendering, and helper variables.

${COMPONENT_API}

${TIMING_REFERENCE}

${REFERENCE_SCENES}

You have access to tools for discovering animation techniques and reusable components:
- search_skills / fetch_skill: Find and read animation patterns and best practices
- search_bits / fetch_bit: Find and read polished, reusable remotion-bits components

Use these tools to research relevant skills and components before writing your code. After researching, produce the final .tsx file.

YOUR OUTPUT MUST BE A COMPLETE, VALID .tsx FILE. Follow this exact structure:

\`\`\`tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  SVG, Scene, HandWrittenText, SketchBox, SketchCircle, SketchArrow, SketchLine,
  SketchTable, AnimatedPath, CheckMark, CrossMark, COLORS,
  // ... only import icons you actually use
} from '../shared/components';

const Scene1Title: React.FC = () => ( ... );
const Scene2Whatever: React.FC = () => { ... };

export const GeneratedVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#fefefe', fontFamily: '"Architects Daughter", "Caveat", cursive' }}>
    <style>{\`@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');\`}</style>
    <AbsoluteFill style={{
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.006) 39px, rgba(0,0,0,0.006) 40px),repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.006) 39px, rgba(0,0,0,0.006) 40px)',
      pointerEvents: 'none',
    }} />
    <AbsoluteFill style={{
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
    }} />
    <Scene1Title />
    <Scene2Whatever />
    ...
  </AbsoluteFill>
);
\`\`\`

IMPORTANT RULES:
- Write REAL CODE — use .map() for repeated items, const arrays for data, computed positions
- Each scene is a separate React component (const SceneN: React.FC = ...)
- Scene frame ranges must be contiguous: Scene1 0-300, Scene2 300-600, etc.
- Use the <Scene> wrapper for each scene (provides 30-frame fade in/out)
- Inside each Scene, wrap content in <AbsoluteFill><SVG>...</SVG></AbsoluteFill>
- First animated element in a scene must start at sceneStart + 30 (after fade-in completes)
- All content animations must COMPLETE by endFrame - 60: every element's (startFrame + durationFrames or drawDuration) <= endFrame - 60. This leaves a 30-frame hold where content is fully visible, then a 30-frame fade-out.
- Before finalizing scene endFrame, add up: last animation start + its duration + 60 frame buffer = minimum endFrame
- Every element needs startFrame/drawDuration or startFrame/durationFrames
- Use COLORS.xxx directly (they're imported variables, not strings)
- For hex colors in fills, use string literals: "#eff6ff"
- Text must be under 40 chars per line, fontSize >= 20
- Canvas is 1920x1080, keep all elements within bounds

Output ONLY the .tsx file content. No explanation, no markdown wrapping.`;

export interface AnimatorOutput {
  code: string;
  durationInFrames: number;
  sceneCount: number;
}

export async function runAnimatorWithRetry(
  client: Anthropic,
  script: Script,
  visualDirection: VisualDirection,
  costTracker?: CostTracker
): Promise<AnimatorOutput> {
  log.animatorGenerating(script.scenes.length);

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Here is the script:\n\n${JSON.stringify(script, null, 2)}\n\nHere is the visual direction:\n\n${JSON.stringify(visualDirection, null, 2)}\n\nUse the search_skills and search_bits tools to find relevant animation patterns and components, then write the complete GeneratedVideo.tsx file. Output ONLY the .tsx code as your final response.`,
    },
  ];

  let finalText = '';
  const maxTurns = 15;

  for (let turn = 0; turn < maxTurns; turn++) {
    log.roleCallingLLM(MODEL, MAX_TOKENS);
    const start = Date.now();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: ANIMATOR_TOOLS,
      messages,
    });

    log.roleLLMResponse(
      response.usage.input_tokens,
      response.usage.output_tokens,
      Date.now() - start
    );
    costTracker?.record('Animator', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

    const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = [];
    for (const block of response.content) {
      if (block.type === 'text') {
        finalText = block.text;
      } else if (block.type === 'tool_use') {
        toolUseBlocks.push(block);
      }
    }

    if (toolUseBlocks.length === 0) break;

    messages.push({ role: 'assistant', content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      let result: unknown;

      switch (toolUse.name) {
        case 'search_skills': {
          const input = toolUse.input as { query: string; limit?: number };
          log.animatorToolCall('search_skills', input.query, turn + 1);
          result = searchSkills(input.query, input.limit);
          log.animatorToolResult('search_skills', Array.isArray(result) ? result.length : 0);
          break;
        }
        case 'fetch_skill': {
          const input = toolUse.input as { name: string };
          log.animatorToolCall('fetch_skill', input.name, turn + 1);
          result = fetchSkill(input.name);
          log.animatorToolResult('fetch_skill', result ? 1 : 0);
          break;
        }
        case 'search_bits': {
          const input = toolUse.input as { query: string; tags?: string[]; limit?: number };
          log.animatorToolCall('search_bits', input.query, turn + 1);
          result = searchBits(input.query, input.tags, input.limit);
          log.animatorToolResult('search_bits', Array.isArray(result) ? result.length : 0);
          break;
        }
        case 'fetch_bit': {
          const input = toolUse.input as { id: string };
          log.animatorToolCall('fetch_bit', input.id, turn + 1);
          result = fetchBit(input.id);
          log.animatorToolResult('fetch_bit', result ? 1 : 0);
          break;
        }
        default:
          result = { error: `Unknown tool: ${toolUse.name}` };
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  const text = finalText;
  const code = extractCode(text);
  const analysis = analyzeCode(code);

  log.animatorCodeStats(code.length, analysis.sceneCount, analysis.durationInFrames);

  // Extract components used for logging
  const componentMatches = code.match(/<(\w+)[\s/]/g);
  if (componentMatches) {
    const unique = [...new Set(componentMatches.map((m) => m.replace(/[<\s/]/g, '')))].filter(
      (c) => /^[A-Z]/.test(c) && c !== 'React' && c !== 'AbsoluteFill'
    );
    log.animatorComponentsUsed(unique);
  }

  // ── Validation chain (compile → timing → visual) ──────────────────────
  let currentCode = code;
  let currentAnalysis = analysis;

  // Compile check
  log.animatorCompiling();
  const compileError = tryCompile(currentCode);
  if (compileError) {
    log.animatorCompileError(compileError);
    const fixed = await retryWithFeedback(
      client, script, visualDirection, currentCode,
      `The code above has TypeScript compile errors:\n\n${compileError}\n\nPlease fix the errors and output the corrected COMPLETE .tsx file. Output ONLY the code, nothing else.`,
      costTracker
    );
    if (fixed) {
      currentCode = fixed.code;
      currentAnalysis = { durationInFrames: fixed.durationInFrames, sceneCount: fixed.sceneCount };
    } else {
      return { code: currentCode, ...currentAnalysis };
    }
  }
  log.animatorCompileSuccess();

  // Timing violation check
  const timingError = checkTimingViolations(currentCode);
  if (timingError) {
    log.animatorTimingViolations(timingError);
    const fixed = await retryWithFeedback(
      client, script, visualDirection, currentCode,
      `The code above has TIMING VIOLATIONS — animations extend into or past the scene fade-out zone:\n\n${timingError}\n\nFor each violation, either move the animation earlier, shorten its duration, or increase the scene's endFrame so that ALL animations complete by endFrame - 60. Output the corrected COMPLETE .tsx file. Output ONLY the code, nothing else.`,
      costTracker
    );
    if (fixed) {
      currentCode = fixed.code;
      currentAnalysis = { durationInFrames: fixed.durationInFrames, sceneCount: fixed.sceneCount };
    }
  }

  // Visual validation — render keyframes and critique with vision
  const currentOutput: AnimatorOutput = { code: currentCode, ...currentAnalysis };
  const visualCritique = await validateVisuals(client, currentOutput, costTracker);
  if (visualCritique) {
    const fixed = await retryWithFeedback(
      client, script, visualDirection, currentCode,
      `The code was rendered to keyframe images and a visual review found these issues:\n\n${visualCritique}\n\nPlease fix the visual issues and output the corrected COMPLETE .tsx file. Output ONLY the code, nothing else.`,
      costTracker
    );
    if (fixed) return fixed;
  }

  return currentOutput;
}

async function retryWithFeedback(
  client: Anthropic,
  script: Script,
  visualDirection: VisualDirection,
  originalCode: string,
  feedback: string,
  costTracker?: CostTracker
): Promise<AnimatorOutput | null> {
  log.roleRetrying(feedback.split('\n')[0]);
  log.roleRetryCallLLM(MODEL);
  const retryStart = Date.now();

  const retryResponse = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is the script:\n\n${JSON.stringify(script, null, 2)}\n\nHere is the visual direction:\n\n${JSON.stringify(visualDirection, null, 2)}\n\nWrite the complete GeneratedVideo.tsx file.`,
      },
      { role: 'assistant', content: originalCode },
      { role: 'user', content: feedback },
    ],
  });

  const retryDurationMs = Date.now() - retryStart;
  log.roleLLMResponse(
    retryResponse.usage.input_tokens,
    retryResponse.usage.output_tokens,
    retryDurationMs
  );
  costTracker?.record('Animator', MODEL, retryResponse.usage.input_tokens, retryResponse.usage.output_tokens, retryDurationMs);

  const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
  const retryCode = extractCode(retryText);
  const retryAnalysis = analyzeCode(retryCode);

  log.animatorCodeStats(retryCode.length, retryAnalysis.sceneCount, retryAnalysis.durationInFrames);

  const retryCompileError = tryCompile(retryCode);
  if (retryCompileError) {
    log.animatorCompileError(retryCompileError);
    return null;
  }
  log.animatorCompileSuccess();

  const retryTimingError = checkTimingViolations(retryCode);
  if (retryTimingError) {
    log.animatorTimingViolations(retryTimingError);
    // Accept with warnings on second pass — don't infinite loop
  }

  return { code: retryCode, ...retryAnalysis };
}

function extractCode(text: string): string {
  const codeMatch = text.match(/```(?:tsx?)?\s*([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();
  return text.trim();
}

function analyzeCode(code: string): { durationInFrames: number; sceneCount: number } {
  const sceneMatches = code.match(/const Scene\d+/g);
  const sceneCount = sceneMatches ? sceneMatches.length : 0;

  const endFrameMatches = [...code.matchAll(/endFrame=\{(\d+)\}/g)];
  const lastEndFrame = endFrameMatches.length > 0
    ? Math.max(...endFrameMatches.map((m) => parseInt(m[1])))
    : 900;

  return { durationInFrames: lastEndFrame, sceneCount };
}

function checkTimingViolations(code: string): string | null {
  // Parse all Scene components with their frame ranges
  const sceneRegex = /<Scene\s+startFrame=\{(\d+)\}\s+endFrame=\{(\d+)\}/g;
  const scenes: { startFrame: number; endFrame: number; startIdx: number; endIdx: number }[] = [];

  let match;
  while ((match = sceneRegex.exec(code)) !== null) {
    // Find the closing </Scene> to scope our search
    const sceneStart = match.index;
    const closeIdx = code.indexOf('</Scene>', sceneStart);
    scenes.push({
      startFrame: parseInt(match[1]),
      endFrame: parseInt(match[2]),
      startIdx: sceneStart,
      endIdx: closeIdx > -1 ? closeIdx : code.length,
    });
  }

  if (scenes.length === 0) return null;

  const violations: string[] = [];

  for (const scene of scenes) {
    const sceneCode = code.slice(scene.startIdx, scene.endIdx);
    const deadline = scene.endFrame - 60;

    // Find all startFrame + duration pairs in this scene's code
    // Pattern: startFrame={N} ... durationFrames={M} or drawDuration={M}
    const elementRegex = /startFrame=\{([^}]+)\}\s+(?:[^>]*?\s+)?(?:durationFrames|drawDuration)=\{(\d+)\}/g;
    let elMatch;
    while ((elMatch = elementRegex.exec(sceneCode)) !== null) {
      const startExpr = elMatch[1];
      const duration = parseInt(elMatch[2]);
      // Try to evaluate simple expressions like "sf + 70" or plain numbers
      const startVal = evalSimpleExpr(startExpr, sceneCode);
      if (startVal !== null) {
        const endAt = startVal + duration;
        if (endAt > deadline) {
          violations.push(
            `Scene(${scene.startFrame}-${scene.endFrame}): animation starts@${startVal} + duration ${duration} = ends@${endAt}, but must complete by ${deadline} (endFrame-60)`
          );
        }
      }
    }

    // Also check: startFrame={N} with duration on the same element but in reverse order
    const reverseRegex = /(?:durationFrames|drawDuration)=\{(\d+)\}\s+(?:[^>]*?\s+)?startFrame=\{([^}]+)\}/g;
    while ((elMatch = reverseRegex.exec(sceneCode)) !== null) {
      const duration = parseInt(elMatch[1]);
      const startExpr = elMatch[2];
      const startVal = evalSimpleExpr(startExpr, sceneCode);
      if (startVal !== null) {
        const endAt = startVal + duration;
        if (endAt > deadline) {
          violations.push(
            `Scene(${scene.startFrame}-${scene.endFrame}): animation starts@${startVal} + duration ${duration} = ends@${endAt}, but must complete by ${deadline} (endFrame-60)`
          );
        }
      }
    }
  }

  if (violations.length === 0) return null;

  return `TIMING VIOLATIONS — content extends into fade-out zone:\n${violations.join('\n')}\n\nFix: either move animations earlier, shorten durations, or increase the scene's endFrame. All animations must complete by endFrame - 60.`;
}

/**
 * Evaluate simple numeric expressions found in JSX like "1948", "sf + 70", "sf + 25 + 18".
 * For variable references like "sf", attempt to resolve from surrounding code context
 * by finding the last assignment like "const sf = <number>" or "sf = <base> + i * <step>"
 * and computing the worst case (highest i).
 */
function evalSimpleExpr(expr: string, context: string): number | null {
  const trimmed = expr.trim();

  // Pure number
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed);

  // Expression like "sf + 70" — resolve sf from context
  const varMatch = trimmed.match(/^(\w+)\s*\+\s*(\d+)$/);
  if (varMatch) {
    const varVal = resolveVariable(varMatch[1], context);
    if (varVal !== null) return varVal + parseInt(varMatch[2]);
  }

  // Just a variable
  if (/^\w+$/.test(trimmed)) {
    return resolveVariable(trimmed, context);
  }

  return null;
}

/**
 * Resolve a loop variable like "sf" by finding its assignment pattern.
 * For "const sf = BASE + i * STEP", compute the max value using the loop's array length.
 */
function resolveVariable(name: string, context: string): number | null {
  // Pattern: const <name> = <number>
  const constMatch = context.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\d+)`));
  if (constMatch) return parseInt(constMatch[1]);

  // Pattern: const <name> = <base> + i * <step>  (loop variable)
  const loopMatch = context.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\d+)\\s*\\+\\s*(\\w+)\\s*\\*\\s*(\\d+)`));
  if (loopMatch) {
    const base = parseInt(loopMatch[1]);
    const iterVar = loopMatch[2];
    const step = parseInt(loopMatch[3]);
    // Find the array that drives the loop — look for .map((<iterVar>, <indexVar>) or similar
    // and find the array length
    const arrayLen = findLoopArrayLength(iterVar, context);
    if (arrayLen !== null) {
      // Return the max value (last iteration)
      return base + (arrayLen - 1) * step;
    }
    // Fallback: assume max 10 iterations
    return base + 9 * step;
  }

  return null;
}

/**
 * Find the length of the array driving a .map() loop where the index variable is used.
 */
function findLoopArrayLength(indexVar: string, context: string): number | null {
  // Look for patterns like: .map((item, <indexVar>) => or .map((<anything>, <indexVar>) =>
  const mapRegex = new RegExp(`(\\w+)\\.map\\(\\(\\w+,\\s*${indexVar}\\)`);
  const mapMatch = context.match(mapRegex);
  if (mapMatch) {
    const arrayName = mapMatch[1];
    // Find the array definition and count elements
    // Pattern: const <arrayName> = [ ... ]
    const arrayDefRegex = new RegExp(`const\\s+${arrayName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
    const arrayDef = context.match(arrayDefRegex);
    if (arrayDef) {
      // Count top-level objects by counting opening braces at depth 0
      const content = arrayDef[1];
      let depth = 0;
      let count = 0;
      for (const ch of content) {
        if (ch === '{') { if (depth === 0) count++; depth++; }
        else if (ch === '}') depth--;
      }
      if (count > 0) return count;
    }
  }
  return null;
}

function tryCompile(code: string): string | null {
  const generatedDir = path.resolve(process.cwd(), 'src', 'generated');
  if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

  const filePath = path.join(generatedDir, 'GeneratedVideo.tsx');
  fs.writeFileSync(filePath, code);

  try {
    const { execSync } = require('child_process');
    execSync(
      `npx tsc --noEmit --jsx react --esModuleInterop --moduleResolution node --skipLibCheck "${filePath}" 2>&1`,
      { cwd: process.cwd(), timeout: 15000 }
    );
    return null;
  } catch (error: any) {
    return error.stdout?.toString() || error.message || 'Unknown compile error';
  }
}
