import { z } from 'zod';
import { getAsset } from '../../asset-index/tool';
import { defineTool } from './types';

const schema = z.object({
  id: z.string().describe('Asset ID, e.g. "A1", "B3".'),
});

export const getAssetTool = defineTool({
  name: 'getAsset',
  description:
    'Fetch a single asset entry by ID. Only needed for direct ID lookup; ' +
    'findAsset already returns full entries with propsSchema, so prefer findAsset for discovery.',
  schema,
  handler: ({ id }) => {
    const entry = getAsset(id);
    return entry ?? { error: `No asset with id "${id}".` };
  },
});
