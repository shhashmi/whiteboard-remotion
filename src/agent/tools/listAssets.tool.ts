import { z } from 'zod';
import { listAssets } from '../../asset-index/tool';
import { defineTool } from './types';

const schema = z.object({
  kind: z
    .enum(['component', 'diagram', 'icon', 'image', 'photo', 'audio'])
    .optional()
    .describe('Restrict to a specific asset kind.'),
  tags: z
    .array(z.string())
    .optional()
    .describe('Require every listed tag.'),
  limit: z.number().int().min(1).max(100).default(50),
});

export const listAssetsTool = defineTool({
  name: 'listAssets',
  description:
    'Browse assets by kind or tags. Use only when findAsset returned gap=true and you ' +
    'want to scan alternatives in a category — not for concept search.',
  schema,
  handler: ({ kind, tags, limit }) => {
    const all = listAssets({ kind, tags });
    return { count: all.length, entries: all.slice(0, limit) };
  },
});
