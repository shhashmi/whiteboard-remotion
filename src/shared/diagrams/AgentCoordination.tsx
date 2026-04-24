import React from 'react';
import {
  GraphNode,
  GraphEdge,
  fitFontSizeToNode,
  FIT_FONT_NOT_POSSIBLE,
} from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export type CoordinationPattern = 'supervisor' | 'hierarchical' | 'peer';

export interface AgentCoordinationProps {
  startFrame: number;
  drawDuration?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  pattern?: CoordinationPattern;
  agents?: string[];
  supervisor?: string;
  title?: string;
}

const TITLE_H = 56;
const PREF_NODE_W = 220;
const PREF_NODE_H = 96;
const MIN_NODE_W = 120;
const NODE_ASPECT = PREF_NODE_W / PREF_NODE_H; // ≈ 2.29
const MIN_NODE_H = MIN_NODE_W / NODE_ASPECT;   // ≈ 52
const MIN_EDGE_GAP = 40; // min clearance between adjacent node edges

interface NodePos {
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  role: 'supervisor' | 'lead' | 'agent' | 'peer';
}

interface EdgeSpec {
  from: NodePos;
  to: NodePos;
  directed: boolean;
  color: string;
}

interface AgentCoordinationGeometry {
  outer: Box;
  title?: string;
  titleBbox?: Box;
  nodes: NodePos[];
  edges: EdgeSpec[];
  pattern: CoordinationPattern;
  error?: string;
}

function nodeBox(n: NodePos): Box {
  return {
    x1: n.cx - n.w / 2,
    y1: n.cy - n.h / 2,
    x2: n.cx + n.w / 2,
    y2: n.cy + n.h / 2,
  };
}

function edgeBoxBetween(a: NodePos, b: NodePos): Box {
  return {
    x1: Math.min(a.cx, b.cx),
    y1: Math.min(a.cy, b.cy),
    x2: Math.max(a.cx, b.cx),
    y2: Math.max(a.cy, b.cy),
  };
}

/**
 * Largest node (nw × nh) fitting in the cell (cellW × cellH) that also renders
 * every label at fontSize ≥ 18. Keeps the preferred 220×96 aspect.
 * Returns null if labels cannot fit at the largest cell-bounded size.
 */
function fitNodeSize(
  cellW: number,
  cellH: number,
  labels: string[],
): { w: number; h: number } | null {
  let w = Math.min(PREF_NODE_W, cellW);
  let h = Math.min(PREF_NODE_H, cellH);
  if (w / h > NODE_ASPECT) w = h * NODE_ASPECT;
  else h = w / NODE_ASPECT;
  if (w < MIN_NODE_W || h < MIN_NODE_H) return null;
  for (const lbl of labels) {
    if (fitFontSizeToNode(lbl, w, h) === FIT_FONT_NOT_POSSIBLE) return null;
  }
  return { w, h };
}

function computeSupervisorGeometry(
  outer: Box,
  contentY1: number,
  agents: string[],
  supervisor: string,
  title: string | undefined,
): { nodes: NodePos[]; edges: EdgeSpec[]; error?: string } {
  const contentW = outer.x2 - outer.x1;
  const contentH = outer.y2 - contentY1;
  const labels = [supervisor, ...agents];
  const n = agents.length;
  // Satellites sit on a circle of radius R around the center. Constraints:
  //   (a) ring fits in rect:     R ≤ halfSide - nodeW/2
  //   (b) satellites clear hub:  R ≥ nodeW + gap
  //   (c) satellites clear each other:  2R sin(π/n) ≥ nodeW + gap   (for n ≥ 2)
  // Combine (a) + (b): halfSide ≥ 1.5·nodeW + gap  →  nodeW ≤ (halfSide - gap)/1.5
  const halfSide = Math.min(contentW / 2, contentH / 2);
  const gap = MIN_EDGE_GAP;
  let nodeW = Math.min(PREF_NODE_W, (halfSide - gap) / 1.5);
  if (n >= 2) {
    // From (c): 2R sin(π/n) ≥ nodeW + gap, using R = halfSide - nodeW/2.
    // Solve for nodeW:  nodeW ≤ (2·halfSide·s − gap) / (1 + s)  where s=sin(π/n).
    const s = Math.sin(Math.PI / n);
    const capByRing = (2 * halfSide * s - gap) / (1 + s);
    nodeW = Math.min(nodeW, capByRing);
  }
  const size = fitNodeSize(nodeW, nodeW / NODE_ASPECT, labels);
  if (!size) {
    // Compute the side length required at MIN_NODE_W so the LLM gets an
    // actionable error.
    const minHalf = 1.5 * MIN_NODE_W + gap;
    const neededSide = Math.ceil(2 * minHalf);
    return {
      nodes: [],
      edges: [],
      error:
        `supervisor pattern: content area ${Math.floor(contentW)}×${Math.floor(contentH)} too small; ` +
        `need ≥ ${neededSide}×${neededSide}${title ? ` (+${TITLE_H} title)` : ''}`,
    };
  }
  const cx = (outer.x1 + outer.x2) / 2;
  const cy = contentY1 + contentH / 2;
  const R = halfSide - size.w / 2;
  const supervisorNode: NodePos = {
    cx,
    cy,
    w: size.w,
    h: size.h,
    label: supervisor,
    role: 'supervisor',
  };
  const satellites: NodePos[] = agents.map((label, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      cx: cx + R * Math.cos(angle),
      cy: cy + R * Math.sin(angle),
      w: size.w,
      h: size.h,
      label,
      role: 'agent',
    };
  });
  const nodes = [supervisorNode, ...satellites];
  const edges: EdgeSpec[] = satellites.map((sat) => ({
    from: supervisorNode,
    to: sat,
    directed: true,
    color: COLORS.orange,
  }));
  return { nodes, edges };
}

function computeHierarchicalGeometry(
  outer: Box,
  contentY1: number,
  agents: string[],
  supervisor: string,
  title: string | undefined,
): { nodes: NodePos[]; edges: EdgeSpec[]; error?: string } {
  const contentW = outer.x2 - outer.x1;
  const contentH = outer.y2 - contentY1;
  const nLeaves = agents.length;
  const leadsCount = nLeaves <= 1 ? 1 : 2;
  const leafPerLead = Math.ceil(nLeaves / leadsCount);
  // 3 rows (root / leads / leaves). Each row is one node tall; gaps between
  // rows carry the connecting edges.
  const rowGap = 60;
  const neededH = 3 * MIN_NODE_H + 2 * rowGap;
  if (contentH < neededH) {
    return {
      nodes: [],
      edges: [],
      error:
        `hierarchical pattern: content height ${Math.floor(contentH)} < ${neededH}` +
        `${title ? ` (+${TITLE_H} title)` : ''}`,
    };
  }
  // Pick row height so 3 rows + 2 gaps fit; derive node h from that.
  const maxRowH = (contentH - 2 * rowGap) / 3;
  const cellH = Math.min(PREF_NODE_H, maxRowH);
  // Fit nLeaves nodes in one row with MIN_EDGE_GAP between them.
  const cellW = (contentW - (nLeaves - 1) * MIN_EDGE_GAP) / nLeaves;
  if (cellW < MIN_NODE_W) {
    const needed = Math.ceil(nLeaves * MIN_NODE_W + (nLeaves - 1) * MIN_EDGE_GAP);
    return {
      nodes: [],
      edges: [],
      error:
        `hierarchical pattern with ${nLeaves} leaves: width ${Math.floor(contentW)} < ${needed}`,
    };
  }
  const labels = [supervisor, ...agents, ...Array.from({ length: leadsCount }, (_, i) => `Lead ${i + 1}`)];
  const size = fitNodeSize(cellW, cellH, labels);
  if (!size) {
    return {
      nodes: [],
      edges: [],
      error: `hierarchical pattern: labels don't fit at cell size ${Math.floor(cellW)}×${Math.floor(cellH)}`,
    };
  }
  const cx = (outer.x1 + outer.x2) / 2;
  const rowY0 = contentY1 + size.h / 2;
  const rowY2 = outer.y2 - size.h / 2;
  const rowY1 = (rowY0 + rowY2) / 2;
  const leafPitch = nLeaves > 1
    ? Math.min(size.w + MIN_EDGE_GAP + 20, (contentW - size.w) / (nLeaves - 1))
    : 0;
  const leafSpan = (nLeaves - 1) * leafPitch;
  const leafX = (i: number) => cx - leafSpan / 2 + i * leafPitch;
  const root: NodePos = {
    cx,
    cy: rowY0,
    w: size.w,
    h: size.h,
    label: supervisor,
    role: 'supervisor',
  };
  const leads: NodePos[] = Array.from({ length: leadsCount }, (_, i) => {
    const members: number[] = [];
    for (let j = 0; j < nLeaves; j++) if (Math.floor(j / leafPerLead) === i) members.push(j);
    const midX = members.length
      ? members.reduce((s, j) => s + leafX(j), 0) / members.length
      : cx + (i - (leadsCount - 1) / 2) * Math.max(size.w + MIN_EDGE_GAP, contentW / 3);
    return {
      cx: midX,
      cy: rowY1,
      w: size.w,
      h: size.h,
      label: `Lead ${i + 1}`,
      role: 'lead',
    };
  });
  const leaves: NodePos[] = agents.map((label, i) => ({
    cx: leafX(i),
    cy: rowY2,
    w: size.w,
    h: size.h,
    label,
    role: 'agent',
  }));
  const edges: EdgeSpec[] = [];
  for (const lead of leads) {
    edges.push({ from: root, to: lead, directed: true, color: COLORS.orange });
  }
  leaves.forEach((leaf, i) => {
    const parent = leads[Math.floor(i / leafPerLead)] ?? leads[0];
    edges.push({ from: parent, to: leaf, directed: true, color: COLORS.orange });
  });
  return { nodes: [root, ...leads, ...leaves], edges };
}

function computePeerGeometry(
  outer: Box,
  contentY1: number,
  agents: string[],
  title: string | undefined,
): { nodes: NodePos[]; edges: EdgeSpec[]; error?: string } {
  const contentW = outer.x2 - outer.x1;
  const contentH = outer.y2 - contentY1;
  const n = agents.length;
  if (n < 2) {
    return { nodes: [], edges: [], error: 'peer pattern needs ≥ 2 agents' };
  }
  const halfSide = Math.min(contentW / 2, contentH / 2);
  const gap = MIN_EDGE_GAP;
  // Solve for nodeW s.t. the ring of n nodes fits: R = halfSide - nodeW/2,
  // adjacent-node chord 2R·sin(π/n) ≥ nodeW + gap.
  const s = Math.sin(Math.PI / n);
  const capByRing = (2 * halfSide * s - gap) / (1 + s);
  const nodeW = Math.min(PREF_NODE_W, capByRing);
  const size = fitNodeSize(nodeW, nodeW / NODE_ASPECT, agents);
  if (!size) {
    // Minimum side at MIN_NODE_W: from nodeW(1+s) + gap = 2·halfSide·s
    const minHalf = ((MIN_NODE_W * (1 + s)) + gap) / (2 * s);
    const neededSide = Math.ceil(2 * minHalf);
    return {
      nodes: [],
      edges: [],
      error:
        `peer pattern with ${n} agents: rect too small; ` +
        `need ≥ ${neededSide}×${neededSide}${title ? ` (+${TITLE_H} title)` : ''}`,
    };
  }
  const cx = (outer.x1 + outer.x2) / 2;
  const cy = contentY1 + contentH / 2;
  const R = halfSide - size.w / 2;
  const nodes: NodePos[] = agents.map((label, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      cx: cx + R * Math.cos(angle),
      cy: cy + R * Math.sin(angle),
      w: size.w,
      h: size.h,
      label,
      role: 'peer',
    };
  });
  const edges: EdgeSpec[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      edges.push({ from: nodes[i], to: nodes[j], directed: false, color: COLORS.purple });
    }
  }
  return { nodes, edges };
}

function computeAgentCoordinationGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  pattern?: CoordinationPattern;
  agents?: string[];
  supervisor?: string;
  title?: string;
}): AgentCoordinationGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const pattern: CoordinationPattern = props.pattern ?? 'supervisor';
  const agents = props.agents ?? ['Agent A', 'Agent B', 'Agent C', 'Agent D'];
  const supervisor = props.supervisor ?? 'Supervisor';
  const hasTitle = !!props.title;
  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  let result: { nodes: NodePos[]; edges: EdgeSpec[]; error?: string };
  if (pattern === 'supervisor') {
    result = computeSupervisorGeometry(outer, contentY1, agents, supervisor, props.title);
  } else if (pattern === 'hierarchical') {
    result = computeHierarchicalGeometry(outer, contentY1, agents, supervisor, props.title);
  } else {
    result = computePeerGeometry(outer, contentY1, agents, props.title);
  }

  return {
    outer,
    title: props.title,
    titleBbox,
    nodes: result.nodes,
    edges: result.edges,
    pattern,
    error: result.error,
  };
}

export function layoutAgentCoordination(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  pattern?: CoordinationPattern;
  agents?: string[];
  supervisor?: string;
  title?: string;
}): CompositeLayoutResult {
  const g = computeAgentCoordinationGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };
  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const n of g.nodes) children.push({ kind: 'node', bbox: nodeBox(n), label: n.label });
  for (const e of g.edges) {
    children.push({ kind: 'edge', bbox: edgeBoxBetween(e.from, e.to) });
  }
  return { outer: g.outer, children };
}

export const AgentCoordination: React.FC<AgentCoordinationProps> = (props) => {
  const {
    startFrame,
    drawDuration = 20,
    x,
    y,
    w,
    h,
    pattern = 'supervisor',
    agents = ['Agent A', 'Agent B', 'Agent C', 'Agent D'],
    supervisor = 'Supervisor',
    title,
  } = props;
  const g = computeAgentCoordinationGeometry({ x, y, w, h, pattern, agents, supervisor, title });

  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="AgentCoordination layout error"
          x={x + w / 2}
          y={y + h / 2 - 16}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={28}
          fill={COLORS.red}
          textAnchor="middle"
        />
        <HandWrittenText
          text={g.error.slice(0, 80)}
          x={x + w / 2}
          y={y + h / 2 + 24}
          startFrame={startFrame + 2}
          durationFrames={18}
          fontSize={18}
          fill={COLORS.red}
          textAnchor="middle"
        />
      </g>
    );
  }

  const titleEl = g.title && g.titleBbox ? (
    <HandWrittenText
      text={g.title}
      x={(g.titleBbox.x1 + g.titleBbox.x2) / 2}
      y={g.titleBbox.y2 - 16}
      startFrame={startFrame}
      durationFrames={18}
      fontSize={40}
      fill={COLORS.outline}
      textAnchor="middle"
    />
  ) : null;

  const nodeFill = (role: NodePos['role']): { fill: string; fillOpacity: number; stroke: string } => {
    if (role === 'supervisor') return { fill: COLORS.orange, fillOpacity: 0.15, stroke: COLORS.orange };
    if (role === 'lead') return { fill: COLORS.blue, fillOpacity: 0.12, stroke: COLORS.blue };
    return { fill: COLORS.white, fillOpacity: 0, stroke: COLORS.outline };
  };

  return (
    <g>
      {titleEl}
      {g.nodes.map((n, i) => {
        const style = nodeFill(n.role);
        return (
          <GraphNode
            key={`node-${i}`}
            x={n.cx}
            y={n.cy}
            label={n.label}
            startFrame={startFrame + i * 8}
            drawDuration={drawDuration}
            width={n.w}
            height={n.h}
            fill={style.fill}
            fillOpacity={style.fillOpacity}
            stroke={style.stroke}
          />
        );
      })}
      {g.edges.map((e, i) => (
        <GraphEdge
          key={`edge-${i}`}
          from={{ x: e.from.cx, y: e.from.cy }}
          to={{ x: e.to.cx, y: e.to.cy }}
          fromSize={{ w: e.from.w, h: e.from.h }}
          toSize={{ w: e.to.w, h: e.to.h }}
          directed={e.directed}
          startFrame={startFrame + drawDuration + 10 + i * 5}
          drawDuration={14}
          color={e.color}
        />
      ))}
    </g>
  );
};
