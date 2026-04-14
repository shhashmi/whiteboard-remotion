import { z } from 'zod';
import { findAsset } from '../../asset-index/tool';
import { defineTool } from './types';

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
    'follow up with getAsset. If the result has gap=true, compose from primitives.',
  schema,
  handler: (input) => findAsset(input),
});
