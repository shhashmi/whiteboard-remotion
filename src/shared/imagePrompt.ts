export const MASTER_STYLE_PROMPT =
  'editorial muted-palette 2D illustration, soft film grain, hand-inked outlines with visible pencil strokes, off-white paper background with subtle texture, navy (#1e293b) line-work with ochre (#d4a017) and sage (#22c55e) accent fills, flat shading, no gradients, no lettering';

export const NEGATIVE_PROMPT =
  'photorealism, 3d render, glossy, neon, text, watermark, logo, signature, saturated colors, gradient backgrounds, lens flare, bokeh';

export const IMAGE_SPEC = {
  width: 1920,
  height: 1080,
  aspectRatio: '16:9',
} as const;

export function buildImagePrompt(subject: string): string {
  return `${subject}. ${MASTER_STYLE_PROMPT}`;
}
