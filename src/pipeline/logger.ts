import type { CostSummary } from './cost-tracker';

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function timestamp(): string {
  return COLORS.dim + new Date().toISOString().substring(11, 23) + COLORS.reset;
}

export const log = {
  // ── Pipeline-level ──────────────────────────────────────────────────────

  pipelineStart(message: string) {
    console.log(
      `\n${COLORS.bold}${COLORS.cyan}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.cyan}  Text-to-Video Pipeline${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.cyan}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.log(`${timestamp()}  Input: "${message}"`);
    console.log();
  },

  pipelineResuming(role: string, inputPath: string) {
    console.log(
      `\n${COLORS.bold}${COLORS.cyan}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.cyan}  Resuming pipeline from: ${role}${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.cyan}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.log(`${timestamp()}  Loaded input: ${inputPath}`);
    console.log();
  },

  pipelineDone(outputPath: string) {
    console.log(
      `\n${COLORS.bold}${COLORS.green}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.green}  Pipeline complete: ${outputPath}${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.green}══════════════════════════════════════════════════${COLORS.reset}\n`
    );
  },

  pipelineDoneNoRender() {
    console.log(
      `\n${COLORS.bold}${COLORS.green}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.green}  Pipeline complete (--no-render)${COLORS.reset}`
    );
    console.log(
      `${COLORS.green}  Preview: npx remotion studio src/generated/index.tsx${COLORS.reset}`
    );
    console.log(
      `${COLORS.bold}${COLORS.green}══════════════════════════════════════════════════${COLORS.reset}\n`
    );
  },

  pipelineFailed(error: string) {
    console.error(
      `\n${COLORS.bold}${COLORS.red}══════════════════════════════════════════════════${COLORS.reset}`
    );
    console.error(
      `${COLORS.bold}${COLORS.red}  Pipeline failed${COLORS.reset}`
    );
    console.error(`${COLORS.red}  ${error}${COLORS.reset}`);
    console.error(
      `${COLORS.bold}${COLORS.red}══════════════════════════════════════════════════${COLORS.reset}\n`
    );
  },

  // ── Role-level ──────────────────────────────────────────────────────────

  roleStart(roleNumber: number, roleName: string) {
    console.log(
      `${COLORS.bold}${COLORS.blue}── [${roleNumber}/7] ${roleName} ─────────────────────────────────────${COLORS.reset}`
    );
  },

  roleCallingLLM(model: string, maxTokens: number) {
    console.log(`${timestamp()}  ${COLORS.dim}Calling ${model} (max ${maxTokens} tokens)...${COLORS.reset}`);
  },

  roleRetrying(reason: string) {
    console.log(`${timestamp()}  ${COLORS.yellow}Validation failed, retrying...${COLORS.reset}`);
    console.log(`${timestamp()}  ${COLORS.yellow}Reason: ${truncate(reason, 150)}${COLORS.reset}`);
  },

  roleRetryCallLLM(model: string) {
    console.log(`${timestamp()}  ${COLORS.dim}Retry: calling ${model}...${COLORS.reset}`);
  },

  roleLLMResponse(inputTokens: number, outputTokens: number, durationMs: number) {
    const secs = (durationMs / 1000).toFixed(1);
    console.log(
      `${timestamp()}  ${COLORS.dim}Response: ${inputTokens} input + ${outputTokens} output tokens in ${secs}s${COLORS.reset}`
    );
  },

  roleValidationPassed(label: string) {
    console.log(`${timestamp()}  ${COLORS.green}Validated: ${label}${COLORS.reset}`);
  },

  roleSavedArtifact(filename: string, sizeBytes: number) {
    const sizeStr = sizeBytes > 1024
      ? `${(sizeBytes / 1024).toFixed(1)}KB`
      : `${sizeBytes}B`;
    console.log(`${timestamp()}  Saved ${COLORS.bold}${filename}${COLORS.reset} (${sizeStr})`);
  },

  roleComplete(roleName: string, summary: string) {
    console.log(`${timestamp()}  ${COLORS.green}${roleName} done:${COLORS.reset} ${summary}`);
    console.log();
  },

  // ── Author-specific ─────────────────────────────────────────────────────

  authorResult(title: string, logline: string, beatCount: number, arcType: string) {
    console.log(`${timestamp()}  Title: "${COLORS.bold}${title}${COLORS.reset}"`);
    console.log(`${timestamp()}  Logline: ${truncate(logline, 80)}`);
    console.log(`${timestamp()}  Arc: ${arcType}`);
    console.log(`${timestamp()}  Beats: ${beatCount}`);
  },

  authorBeats(beats: { id: string; role: string; key_idea: string }[]) {
    for (const beat of beats) {
      console.log(`${timestamp()}    ${COLORS.dim}${beat.id}${COLORS.reset} [${beat.role}] ${truncate(beat.key_idea, 60)}`);
    }
  },

  // ── Scriptwriter-specific ───────────────────────────────────────────────

  scriptwriterResult(sceneCount: number, terminologyCount: number) {
    console.log(`${timestamp()}  Scenes: ${sceneCount}`);
    console.log(`${timestamp()}  Terminology entries: ${terminologyCount}`);
  },

  scriptwriterScenes(scenes: { scene_number: number; scene_type: string; heading: string; pacing: string }[]) {
    for (const scene of scenes) {
      console.log(
        `${timestamp()}    Scene ${scene.scene_number}: ${COLORS.dim}[${scene.scene_type}]${COLORS.reset} "${scene.heading}" ${COLORS.dim}(${scene.pacing})${COLORS.reset}`
      );
    }
  },

  // ── Art Director-specific ───────────────────────────────────────────────

  artDirectorSearching(query: string, turn: number) {
    console.log(`${timestamp()}    ${COLORS.magenta}search_assets${COLORS.reset}("${query}") ${COLORS.dim}[turn ${turn}]${COLORS.reset}`);
  },

  artDirectorSearchResult(query: string, quality: string, topMatch: string | null, score: number) {
    const qualityColor = quality === 'strong' ? COLORS.green : quality === 'weak' ? COLORS.yellow : COLORS.red;
    const matchStr = topMatch ? ` → ${topMatch} (${score.toFixed(2)})` : '';
    console.log(`${timestamp()}    ${qualityColor}[${quality}]${COLORS.reset}${matchStr}`);
  },

  artDirectorAssetGap(query: string) {
    console.log(`${timestamp()}    ${COLORS.red}Asset gap:${COLORS.reset} no match for "${query}" — logged for future creation`);
  },

  artDirectorResult(mood: string, accentColor: string, colorAssignments: Record<string, string>, sceneCount: number) {
    console.log(`${timestamp()}  Mood: ${mood}`);
    console.log(`${timestamp()}  Accent: ${accentColor}`);
    const colorEntries = Object.entries(colorAssignments);
    console.log(`${timestamp()}  Color assignments (${colorEntries.length}):`);
    for (const [concept, color] of colorEntries) {
      console.log(`${timestamp()}    ${concept} → ${color}`);
    }
    console.log(`${timestamp()}  Scenes directed: ${sceneCount}`);
  },

  artDirectorSceneCompositions(scenes: { scene_number: number; composition: string; density: string; imageCount: number }[]) {
    for (const s of scenes) {
      console.log(
        `${timestamp()}    Scene ${s.scene_number}: ${COLORS.dim}[${s.density}]${COLORS.reset} ${truncate(s.composition, 60)} ${COLORS.dim}(${s.imageCount} images)${COLORS.reset}`
      );
    }
  },

  // ── Layout-specific ─────────────────────────────────────────────────────

  layoutGenerating(sceneCount: number) {
    console.log(`${timestamp()}  Generating layout for ${sceneCount} scenes...`);
  },

  layoutResult(sceneCount: number, elementCount: number) {
    console.log(`${timestamp()}  Layout: ${sceneCount} scenes, ${elementCount} elements`);
  },

  layoutBoundsViolation(issues: string) {
    console.log(`${timestamp()}  ${COLORS.red}Layout bounds issues:${COLORS.reset}`);
    const lines = issues.split('\n').slice(0, 8);
    for (const line of lines) {
      console.log(`${timestamp()}    ${COLORS.red}${line}${COLORS.reset}`);
    }
    if (issues.split('\n').length > 8) {
      console.log(`${timestamp()}    ${COLORS.dim}... (${issues.split('\n').length - 8} more lines)${COLORS.reset}`);
    }
  },

  // ── Animate-specific ───────────────────────────────────────────────────

  animateGenerating(sceneCount: number) {
    console.log(`${timestamp()}  Adding timing to ${sceneCount} scenes...`);
  },

  animateResult(totalFrames: number, sceneCount: number) {
    const durationSec = (totalFrames / 30).toFixed(1);
    console.log(`${timestamp()}  Timed layout: ${sceneCount} scenes, ${totalFrames} frames (${durationSec}s)`);
  },

  animateTimingViolation(issues: string) {
    console.log(`${timestamp()}  ${COLORS.red}Timing violations:${COLORS.reset}`);
    const lines = issues.split('\n').slice(0, 10);
    for (const line of lines) {
      console.log(`${timestamp()}    ${COLORS.red}${line}${COLORS.reset}`);
    }
    if (issues.split('\n').length > 10) {
      console.log(`${timestamp()}    ${COLORS.dim}... (${issues.split('\n').length - 10} more lines)${COLORS.reset}`);
    }
  },

  // ── Polish-specific ────────────────────────────────────────────────────

  polishGenerating(sceneCount: number) {
    console.log(`${timestamp()}  Generating polished Remotion code for ${sceneCount} scenes...`);
  },

  polishResult(codeLength: number) {
    const sizeKB = (codeLength / 1024).toFixed(1);
    console.log(`${timestamp()}  Polished code: ${sizeKB}KB`);
  },

  // ── Animator tool usage ─────────────────────────────────────────────────

  animatorToolCall(toolName: string, query: string, turn: number) {
    console.log(`${timestamp()}    ${COLORS.magenta}${toolName}${COLORS.reset}("${query}") ${COLORS.dim}[turn ${turn}]${COLORS.reset}`);
  },

  animatorToolResult(toolName: string, resultCount: number) {
    console.log(`${timestamp()}    ${COLORS.dim}→ ${resultCount} result(s)${COLORS.reset}`);
  },

  // ── Detailed tool logging ──────────────────────────────────────────────

  toolCallDetail(toolName: string, input: Record<string, unknown>, turn: number) {
    const params = Object.entries(input)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(', ');
    console.log(`${timestamp()}    ${COLORS.magenta}▶ ${toolName}${COLORS.reset}(${params}) ${COLORS.dim}[turn ${turn}]${COLORS.reset}`);
  },

  toolResultDetail(toolName: string, response: unknown) {
    const json = typeof response === 'string' ? response : JSON.stringify(response);
    const preview = truncate(json.replace(/\n/g, ' '), 200);
    console.log(`${timestamp()}    ${COLORS.dim}◀ ${toolName} response: ${preview}${COLORS.reset}`);
  },

  // ── Animator-specific ───────────────────────────────────────────────────

  animatorGenerating(scriptScenes: number) {
    console.log(`${timestamp()}  Generating Remotion code for ${scriptScenes} scenes...`);
  },

  animatorCodeStats(codeLength: number, sceneCount: number, durationInFrames: number) {
    const sizeKB = (codeLength / 1024).toFixed(1);
    const durationSec = (durationInFrames / 30).toFixed(1);
    console.log(`${timestamp()}  Code: ${sizeKB}KB, ${sceneCount} scene components`);
    console.log(`${timestamp()}  Duration: ${durationInFrames} frames (${durationSec}s at 30fps)`);
  },

  animatorCompiling() {
    console.log(`${timestamp()}  ${COLORS.dim}Compiling generated code with tsc...${COLORS.reset}`);
  },

  animatorCompileSuccess() {
    console.log(`${timestamp()}  ${COLORS.green}TypeScript compilation passed${COLORS.reset}`);
  },

  animatorCompileError(error: string) {
    console.log(`${timestamp()}  ${COLORS.red}TypeScript compilation failed:${COLORS.reset}`);
    const lines = error.split('\n').slice(0, 8);
    for (const line of lines) {
      console.log(`${timestamp()}    ${COLORS.red}${line}${COLORS.reset}`);
    }
    if (error.split('\n').length > 8) {
      console.log(`${timestamp()}    ${COLORS.dim}... (${error.split('\n').length - 8} more lines)${COLORS.reset}`);
    }
  },

  animatorComponentsUsed(components: string[]) {
    console.log(`${timestamp()}  Components used: ${components.join(', ')}`);
  },

  animatorTimingViolations(error: string) {
    console.log(`${timestamp()}  ${COLORS.red}Timing violations detected:${COLORS.reset}`);
    const lines = error.split('\n').slice(0, 10);
    for (const line of lines) {
      console.log(`${timestamp()}    ${COLORS.red}${line}${COLORS.reset}`);
    }
    if (error.split('\n').length > 10) {
      console.log(`${timestamp()}    ${COLORS.dim}... (${error.split('\n').length - 10} more lines)${COLORS.reset}`);
    }
  },

  // ── Visual Validator ────────────────────────────────────────────────────

  visualValidatorRendering(frames: number[]) {
    console.log(`${timestamp()}  ${COLORS.dim}Rendering ${frames.length} keyframes for visual validation: [${frames.join(', ')}]${COLORS.reset}`);
  },

  visualValidatorFrameFailed(frame: number, error: string) {
    console.log(`${timestamp()}  ${COLORS.yellow}Keyframe ${frame} render failed: ${truncate(error, 100)}${COLORS.reset}`);
  },

  visualValidatorSkipped(reason: string) {
    console.log(`${timestamp()}  ${COLORS.yellow}Visual validation skipped: ${reason}${COLORS.reset}`);
  },

  visualValidatorCritiquing(frameCount: number) {
    console.log(`${timestamp()}  ${COLORS.dim}Sending ${frameCount} keyframes to vision model for critique...${COLORS.reset}`);
  },

  visualValidatorPassed() {
    console.log(`${timestamp()}  ${COLORS.green}Visual validation passed${COLORS.reset}`);
  },

  visualValidatorFailed(critique: string) {
    console.log(`${timestamp()}  ${COLORS.red}Visual validation found issues:${COLORS.reset}`);
    const lines = critique.split('\n').slice(0, 8);
    for (const line of lines) {
      console.log(`${timestamp()}    ${COLORS.red}${line}${COLORS.reset}`);
    }
    if (critique.split('\n').length > 8) {
      console.log(`${timestamp()}    ${COLORS.dim}... (${critique.split('\n').length - 8} more lines)${COLORS.reset}`);
    }
  },

  // ── Renderer-specific ───────────────────────────────────────────────────

  rendererWriting(dir: string) {
    console.log(`${timestamp()}  Writing to ${dir}/`);
  },

  rendererFileWritten(filename: string, sizeBytes: number) {
    const sizeStr = sizeBytes > 1024
      ? `${(sizeBytes / 1024).toFixed(1)}KB`
      : `${sizeBytes}B`;
    console.log(`${timestamp()}    ${filename} (${sizeStr})`);
  },

  rendererStartingRemotionRender() {
    console.log(`${timestamp()}  ${COLORS.dim}Running: npx remotion render ...${COLORS.reset}`);
  },

  rendererRenderSuccess(outputPath: string) {
    console.log(`${timestamp()}  ${COLORS.green}Rendered: ${outputPath}${COLORS.reset}`);
  },

  rendererRenderFailed() {
    console.log(`${timestamp()}  ${COLORS.red}Remotion render failed${COLORS.reset}`);
    console.log(`${timestamp()}  ${COLORS.yellow}Preview manually: npx remotion studio src/generated/index.tsx${COLORS.reset}`);
  },

  // ── Cost summary ───────────────────────────────────────────────────────

  pipelineCostSummary(summary: CostSummary, totalElapsedSecs: number) {
    console.log(
      `\n${COLORS.bold}${COLORS.yellow}── Cost Summary ────────────────────────────────────────${COLORS.reset}`
    );
    console.log(`${timestamp()}  LLM calls: ${summary.callCount}`);
    console.log(`${timestamp()}  Total tokens: ${fmtNum(summary.totalInputTokens)} input + ${fmtNum(summary.totalOutputTokens)} output`);
    console.log(`${timestamp()}  ${COLORS.bold}Estimated cost: $${summary.totalCostUsd.toFixed(4)}${COLORS.reset}`);
    console.log(`${timestamp()}  Pipeline wall time: ${totalElapsedSecs.toFixed(1)}s`);

    console.log(`${timestamp()}  ${COLORS.dim}Breakdown by role:${COLORS.reset}`);
    for (const [role, data] of Object.entries(summary.byRole)) {
      console.log(
        `${timestamp()}    ${role}: ${data.calls} call(s), ${fmtNum(data.inputTokens)} in + ${fmtNum(data.outputTokens)} out = $${data.costUsd.toFixed(4)}`
      );
    }
    console.log(
      `${COLORS.bold}${COLORS.yellow}────────────────────────────────────────────────────────${COLORS.reset}\n`
    );
  },
};

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}
