import { findAssetTool } from './findAsset.tool';
import { getAssetTool } from './getAsset.tool';
import { listAssetsTool } from './listAssets.tool';
import { submitPlanTool } from './submitPlan.tool';
import type { AgentTool } from './types';

export const AGENT_TOOLS: AgentTool[] = [findAssetTool, getAssetTool, listAssetsTool, submitPlanTool];
export const AGENT_TOOLS_LC = AGENT_TOOLS.map((t) => t.toLangChainTool());

export { defineTool } from './types';
export type { AgentTool } from './types';
