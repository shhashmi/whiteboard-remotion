import { appendFileSync, mkdirSync, readFileSync, existsSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { z } from 'zod';
import { findAsset } from '../../asset-index/tool';
import { defineTool } from './types';
import { isVisualFit } from './runtimeContext';

const GAP_LOG_PATH = process.env.ASSET_GAP_LOG ?? 'out/asset-gaps.jsonl';
const PREVIEW_TOPK_DEFAULT = 3;
const PREVIEW_MAX_BYTES = 2 * 1024 * 1024;
const PROJECT_ROOT = resolve(__dirname, '../../..');

function logGap(query: unknown): void {
  try {
    mkdirSync(dirname(GAP_LOG_PATH), { recursive: true });
    appendFileSync(
      GAP_LOG_PATH,
      JSON.stringify({ timestamp: new Date().toISOString(), query }) + '\n',
    );
  } catch {
    // best-effort — never fail the tool call on logging error
  }
}

function previewTopK(): number {
  const raw = Number(process.env.FIND_ASSET_PREVIEW_TOPK);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : PREVIEW_TOPK_DEFAULT;
}

const schema = z.object({
  concept: z.string().describe("Semantic search term, e.g. 'react loop', 'memory hierarchy'."),
  kind: z
    .enum(['component', 'diagram', 'icon', 'image', 'photo', 'audio'])
    .optional()
    .describe('Restrict to a specific asset kind.'),
  tags: z
    .array(z.string())
    .optional()
    .describe('Require every listed tag to be present on the asset.'),
  limit: z.number().int().min(1).max(20).default(5),
});

export const findAssetTool = defineTool({
  name: 'findAsset',
  description:
    'Search the asset catalog for diagrams, icons, or components matching a concept. ' +
    'Call this before emitting JSX for any diagram or icon. ' +
    'Batch multiple concepts in parallel (emit several findAsset calls in one turn) ' +
    'rather than issuing sequential calls. ' +
    'Each match contains the full entry with importPath and propsSchema — do NOT ' +
    'follow up with getAsset. If the result has gap=true, compose from primitives. ' +
    'When running in visual-fit mode, rendered preview PNGs are attached to the tool ' +
    'result for the top matches — inspect them to pick the visually correct variant.',
  schema,
  handler: (input) => {
    const result = findAsset(input);
    if (result.gap) logGap(input);

    if (!isVisualFit()) return result;

    const topK = previewTopK();
    const images: Array<{ id: string; mediaType: 'image/png'; base64: string }> = [];
    for (const match of result.matches.slice(0, topK)) {
      const relPath = match.entry.previewPath;
      if (!relPath) continue;
      const absPath = resolve(PROJECT_ROOT, relPath);
      if (!existsSync(absPath)) continue;
      try {
        if (statSync(absPath).size > PREVIEW_MAX_BYTES) continue;
        const bytes = readFileSync(absPath);
        images.push({
          id: match.entry.id,
          mediaType: 'image/png',
          base64: bytes.toString('base64'),
        });
      } catch {
        // skip unreadable preview — text metadata still returned
      }
    }

    if (images.length === 0) return result;
    return { __multimodal: true as const, payload: result, images };
  },
});
