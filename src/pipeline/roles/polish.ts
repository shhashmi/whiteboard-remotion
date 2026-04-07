import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import type { VisualDirection, TimedLayoutSpec } from '../types';
import { log } from '../logger';
import { searchSkills, fetchSkill } from '../tools/skill-registry';
import { searchBits, fetchBit } from '../tools/bits-registry';
import type { CostTracker } from '../cost-tracker';
import { validateVisuals } from './visual-validator';
import { COMPONENT_API, REFERENCE_SCENES } from './shared-prompts';
import { analyzeTsx, validateTsxTiming, validateTsxBounds } from '../tsx-analyzer';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 16384;

const POLISH_TOOLS: Anthropic.Messages.Tool[] = [
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

const SYSTEM_PROMPT = `You are a Remotion developer translating a fully-specified timed layout into production-ready React/TSX code for whiteboard-style animated explainer videos.

The layout (what goes where) and timing (when things animate) are ALREADY DECIDED in the timed layout spec. Your job is to faithfully translate this spec into clean, polished Remotion code. Add visual micro-details: background fills with subtle opacity, drop shadows where appropriate, easing refinements, and clean code structure.

${COMPONENT_API}

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
import {
  FlowPulse, StaggerMap, SpringReveal, CountUp, CameraPan,
} from '../shared/motions';

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

TRANSLATION RULES:
- Each scene in the spec becomes a separate React component (const SceneN: React.FC = ...)
- Use the spec's startFrame/endFrame for the <Scene> wrapper
- Use each element's startFrame and durationFrames for the component's timing props
- Map durationFrames to "durationFrames" for text components and "drawDuration" for drawing components (SketchBox, SketchCircle, SketchArrow, SketchLine, icons, marks)
- Resolve "COLORS.xxx" string references in props to actual COLORS.xxx variable references
- Write REAL CODE — use .map() for repeated items, const arrays for data, computed positions
- For grouped elements, use data arrays with .map() loops
- Every element needs startFrame + durationFrames or drawDuration
- Use COLORS.xxx directly (imported variables, not strings)
- For hex colors in fills, use string literals: "#eff6ff"
- Canvas is 1920x1080, all elements within bounds

Output ONLY the .tsx file content. No explanation, no markdown wrapping.`;

export interface AnimatorOutput {
  code: string;
  durationInFrames: number;
  sceneCount: number;
}

export async function runPolishWithRetry(
  client: Anthropic,
  timedLayout: TimedLayoutSpec,
  visualDirection: VisualDirection,
  costTracker?: CostTracker
): Promise<AnimatorOutput> {
  log.polishGenerating(timedLayout.scenes.length);

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: 'user',
      content: `Here is the timed layout spec:\n\n${JSON.stringify(timedLayout, null, 2)}\n\nHere is the visual direction (for mood and style context):\n\n${JSON.stringify(visualDirection, null, 2)}\n\nUse the search_skills and search_bits tools to find relevant patterns and components, then write the complete GeneratedVideo.tsx file. Output ONLY the .tsx code as your final response.`,
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
      tools: POLISH_TOOLS,
      messages,
    });

    log.roleLLMResponse(
      response.usage.input_tokens,
      response.usage.output_tokens,
      Date.now() - start
    );
    costTracker?.record('Polish', MODEL, response.usage.input_tokens, response.usage.output_tokens, Date.now() - start);

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
  const tsxAnalysis = analyzeTsx(code);

  log.animatorCodeStats(code.length, tsxAnalysis.sceneCount, tsxAnalysis.durationInFrames);

  if (tsxAnalysis.componentNames.length > 0) {
    log.animatorComponentsUsed(tsxAnalysis.componentNames);
  }

  // ── Validation chain (compile → AST → visual) ───────────────────────
  let currentCode = code;
  let currentTsxAnalysis = tsxAnalysis;

  // Compile check
  log.animatorCompiling();
  const compileError = tryCompile(currentCode);
  if (compileError) {
    log.animatorCompileError(compileError);
    const fixed = await retryWithFeedback(
      client, timedLayout, visualDirection, currentCode,
      `The code above has TypeScript compile errors:\n\n${compileError}\n\nPlease fix the errors and output the corrected COMPLETE .tsx file. Output ONLY the code, nothing else.`,
      costTracker
    );
    if (fixed) {
      currentCode = fixed.code;
      currentTsxAnalysis = analyzeTsx(currentCode);
    } else {
      return { code: currentCode, durationInFrames: currentTsxAnalysis.durationInFrames, sceneCount: currentTsxAnalysis.sceneCount };
    }
  }
  log.animatorCompileSuccess();

  // AST validation — check timing and bounds from parsed code
  const timingIssues = validateTsxTiming(currentTsxAnalysis);
  const boundsIssues = validateTsxBounds(currentTsxAnalysis);
  const astIssues = [timingIssues, boundsIssues].filter(Boolean).join('\n\n');
  if (astIssues) {
    const fixed = await retryWithFeedback(
      client, timedLayout, visualDirection, currentCode,
      `The code was parsed and the following structural issues were found:\n\n${astIssues}\n\nPlease fix these issues and output the corrected COMPLETE .tsx file. Output ONLY the code, nothing else.`,
      costTracker
    );
    if (fixed) {
      currentCode = fixed.code;
      currentTsxAnalysis = analyzeTsx(currentCode);
    }
  }

  // Visual validation — render keyframes and critique with vision
  const currentOutput: AnimatorOutput = { code: currentCode, durationInFrames: currentTsxAnalysis.durationInFrames, sceneCount: currentTsxAnalysis.sceneCount };
  const visualCritique = await validateVisuals(client, currentOutput, costTracker);
  if (visualCritique) {
    const fixed = await retryWithFeedback(
      client, timedLayout, visualDirection, currentCode,
      `The code was rendered to keyframe images and a visual review found these issues:\n\n${visualCritique}\n\nPlease fix the visual issues and output the corrected COMPLETE .tsx file. Output ONLY the code, nothing else.`,
      costTracker
    );
    if (fixed) return fixed;
  }

  log.polishResult(currentCode.length);
  return currentOutput;
}

async function retryWithFeedback(
  client: Anthropic,
  timedLayout: TimedLayoutSpec,
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
        content: `Here is the timed layout spec:\n\n${JSON.stringify(timedLayout, null, 2)}\n\nHere is the visual direction:\n\n${JSON.stringify(visualDirection, null, 2)}\n\nWrite the complete GeneratedVideo.tsx file.`,
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
  costTracker?.record('Polish', MODEL, retryResponse.usage.input_tokens, retryResponse.usage.output_tokens, retryDurationMs);

  const retryText = retryResponse.content[0].type === 'text' ? retryResponse.content[0].text : '';
  const retryCode = extractCode(retryText);
  const retryTsxAnalysis = analyzeTsx(retryCode);

  log.animatorCodeStats(retryCode.length, retryTsxAnalysis.sceneCount, retryTsxAnalysis.durationInFrames);

  const retryCompileError = tryCompile(retryCode);
  if (retryCompileError) {
    log.animatorCompileError(retryCompileError);
    return null;
  }
  log.animatorCompileSuccess();

  return { code: retryCode, durationInFrames: retryTsxAnalysis.durationInFrames, sceneCount: retryTsxAnalysis.sceneCount };
}

function extractCode(text: string): string {
  const codeMatch = text.match(/```(?:tsx?)?\s*([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();
  return text.trim();
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
