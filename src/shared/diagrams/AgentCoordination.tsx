import React from 'react';
import { GraphNode, GraphEdge, fitFontSizeToNode, FIT_FONT_NOT_POSSIBLE } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export type CoordinationPattern = 'supervisor' | 'hierarchical' | 'peer';

export interface AgentCoordinationProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  pattern?: CoordinationPattern;
  agents?: string[];
  supervisor?: string;
  title?: string;
}

const DEFAULT_AGENTS = ['Agent A', 'Agent B', 'Agent C', 'Agent D'];

const MIN_NODE_W = 96;
const MIN_NODE_H = 40;
const MIN_FONT_SIZE = 18;
const MIN_EDGE_GAP = 16;
const DEFAULT_NODE_W = 220;
const DEFAULT_NODE_H = 96;
const DEFAULT_FONT_SIZE = 36;
const TITLE_H = 56;

type NodeSpec = { cx: number; cy: number; w: number; h: number; fontSize: number; label: string };

function nodeBox(n: NodeSpec): Box {
  return {
    x1: n.cx - n.w / 2,
    y1: n.cy - n.h / 2,
    x2: n.cx + n.w / 2,
    y2: n.cy + n.h / 2,
  };
}

function fitNodeSize(labels: string[], maxW: number, maxH: number): {
  nodeW: number;
  nodeH: number;
  fontSize: number;
  error?: string;
} {
  const w = Math.min(DEFAULT_NODE_W, maxW);
  const h = Math.min(DEFAULT_NODE_H, maxH);
  if (w < MIN_NODE_W || h < MIN_NODE_H) {
    return {
      nodeW: w,
      nodeH: h,
      fontSize: MIN_FONT_SIZE,
      error: `node min size is ${MIN_NODE_W}×${MIN_NODE_H}; available is ${Math.floor(w)}×${Math.floor(h)}`,
    };
  }
  let fontSize = DEFAULT_FONT_SIZE;
  for (const label of labels) {
    const fs = fitFontSizeToNode(label, w, h, { defaultFontSize: DEFAULT_FONT_SIZE, minFontSize: MIN_FONT_SIZE });
    if (fs === FIT_FONT_NOT_POSSIBLE) {
      return {
        nodeW: w,
        nodeH: h,
        fontSize: MIN_FONT_SIZE,
        error: `label "${label}" does not fit in ${Math.floor(w)}×${Math.floor(h)} node at fontSize ≥ ${MIN_FONT_SIZE}`,
      };
    }
    if (fs < fontSize) fontSize = fs;
  }
  return { nodeW: w, nodeH: h, fontSize };
}

function layoutSupervisor(
  contentRect: Box,
  agents: string[],
  supervisorLabel: string,
): { nodes: NodeSpec[]; edges: Array<{ from: NodeSpec; to: NodeSpec }>; error?: string } {
  const w = contentRect.x2 - contentRect.x1;
  const h = contentRect.y2 - contentRect.y1;
  const cx = (contentRect.x1 + contentRect.x2) / 2;
  const cy = (contentRect.y1 + contentRect.y2) / 2;
  const n = agents.length;

  // Horizontal: 3 nodes (center + 2 satellites) with 2 gaps must fit in w.
  // Vertical: 3 nodes with 2 gaps must fit in h.
  const maxNodeW = (w - 2 * MIN_EDGE_GAP) / 3;
  const maxNodeH = (h - 2 * MIN_EDGE_GAP) / 3;
  const fit = fitNodeSize([supervisorLabel, ...agents], maxNodeW, maxNodeH);
  if (fit.error) return { nodes: [], edges: [], error: `supervisor: ${fit.error}` };

  const { nodeW, nodeH, fontSize } = fit;

  // radius = center-to-center distance for 4 compass points.
  // Chord constraint for n agents on the circle: 2*r*sin(pi/n) ≥ nodeW + MIN_EDGE_GAP/2.
  const chordMin = n > 1 ? (nodeW + MIN_EDGE_GAP / 2) / (2 * Math.sin(Math.PI / n)) : 0;
  const radiusMin = Math.max(nodeW + MIN_EDGE_GAP, chordMin, nodeH + MIN_EDGE_GAP);
  // radiusMax so satellite boxes stay in contentRect.
  const radiusMaxX = (w - nodeW) / 2;
  const radiusMaxY = (h - nodeH) / 2;
  const radiusMax = Math.min(radiusMaxX, radiusMaxY);
  // Epsilon guards against float drift when radiusMin and radiusMax are
  // analytically equal but differ by a few ulps due to different arithmetic
  // paths (e.g. w exactly = 3*nodeW + 32). Sub-pixel tolerance is safe
  // because nothing in the rendered output is sensitive to < 1 px placement.
  if (radiusMin > radiusMax + 0.5) {
    const needW = Math.ceil(2 * radiusMin + nodeW);
    const needH = Math.ceil(2 * radiusMin + nodeH);
    return {
      nodes: [],
      edges: [],
      error:
        `supervisor pattern with ${n} agents requires rect ≥ ` +
        `${needW}×${needH}; got ${Math.floor(w)}×${Math.floor(h)}`,
    };
  }
  const radius = radiusMin;

  const supervisor: NodeSpec = { cx, cy, w: nodeW, h: nodeH, fontSize, label: supervisorLabel };
  const satellites: NodeSpec[] = agents.map((label, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      cx: cx + radius * Math.cos(angle),
      cy: cy + radius * Math.sin(angle),
      w: nodeW,
      h: nodeH,
      fontSize,
      label,
    };
  });

  const nodes = [supervisor, ...satellites];
  const edges = satellites.map((s) => ({ from: supervisor, to: s }));
  return { nodes, edges };
}

function layoutHierarchical(
  contentRect: Box,
  agents: string[],
  rootLabel: string,
): { nodes: NodeSpec[]; edges: Array<{ from: NodeSpec; to: NodeSpec }>; error?: string } {
  const w = contentRect.x2 - contentRect.x1;
  const h = contentRect.y2 - contentRect.y1;
  const cx = (contentRect.x1 + contentRect.x2) / 2;
  const n = agents.length;

  // 3 rows, 2 row-gaps.
  const maxNodeH = (h - 2 * MIN_EDGE_GAP) / 3;
  // Leaf row dominates width: n leaves + (n-1) gaps.
  const maxLeafNodeW = (w - (n - 1) * MIN_EDGE_GAP) / n;
  const fit = fitNodeSize([rootLabel, 'Lead 1', 'Lead 2', ...agents], maxLeafNodeW, maxNodeH);
  if (fit.error) return { nodes: [], edges: [], error: `hierarchical: ${fit.error}` };

  const { nodeW, nodeH, fontSize } = fit;

  // Distribute 3 rows across the full rect height.
  const rowGap = (h - 3 * nodeH) / 2;
  const y0 = contentRect.y1 + nodeH / 2;
  const y1 = y0 + nodeH + rowGap;
  const y2 = y1 + nodeH + rowGap;

  const leafSpan = (n - 1) * (nodeW + MIN_EDGE_GAP);
  const leafStartX = cx - leafSpan / 2;
  const leaves: NodeSpec[] = agents.map((label, i) => ({
    cx: leafStartX + i * (nodeW + MIN_EDGE_GAP),
    cy: y2,
    w: nodeW,
    h: nodeH,
    fontSize,
    label,
  }));

  const leafPerMid = Math.ceil(n / 2);
  const mid: NodeSpec[] = [0, 1].map((i) => {
    const members = leaves.filter((_, idx) => Math.floor(idx / leafPerMid) === i);
    const midX = members.length
      ? members.reduce((sum, m) => sum + m.cx, 0) / members.length
      : cx + (i - 0.5) * (nodeW + MIN_EDGE_GAP);
    return { cx: midX, cy: y1, w: nodeW, h: nodeH, fontSize, label: `Lead ${i + 1}` };
  });

  const root: NodeSpec = { cx, cy: y0, w: nodeW, h: nodeH, fontSize, label: rootLabel };

  const nodes = [root, ...mid, ...leaves];
  const edges: Array<{ from: NodeSpec; to: NodeSpec }> = [];
  mid.forEach((m) => edges.push({ from: root, to: m }));
  leaves.forEach((leaf, i) => {
    const parent = mid[Math.floor(i / leafPerMid)];
    edges.push({ from: parent, to: leaf });
  });

  return { nodes, edges };
}

function layoutPeer(
  contentRect: Box,
  agents: string[],
): { nodes: NodeSpec[]; edges: Array<{ from: NodeSpec; to: NodeSpec }>; error?: string } {
  const w = contentRect.x2 - contentRect.x1;
  const h = contentRect.y2 - contentRect.y1;
  const cx = (contentRect.x1 + contentRect.x2) / 2;
  const cy = (contentRect.y1 + contentRect.y2) / 2;
  const n = agents.length;

  // Solve for largest nodeW s.t. chord ≥ nodeW + MIN_EDGE_GAP/2 AND boxes fit in rect.
  // chord = 2 * r * sin(pi/n); r ≤ (min(w,h) - nodeH) / 2.
  // Simpler: pick r as large as rect allows (so chord is maximal), then verify nodeW fits.
  const rMin = Math.min(w, h) / 2;
  const nodeHGuess = Math.min(DEFAULT_NODE_H, rMin * 0.4);
  const r = rMin - nodeHGuess / 2;
  const chord = n > 1 ? 2 * r * Math.sin(Math.PI / n) : Number.POSITIVE_INFINITY;
  const maxNodeW = Math.min(DEFAULT_NODE_W, chord - MIN_EDGE_GAP / 2, w - 2 * r);
  const maxNodeH = Math.min(DEFAULT_NODE_H, h - 2 * r + nodeHGuess);

  const fit = fitNodeSize(agents, maxNodeW, Math.max(maxNodeH, nodeHGuess));
  if (fit.error) return { nodes: [], edges: [], error: `peer: ${fit.error}` };

  const { nodeW, nodeH, fontSize } = fit;
  // Recompute r for the chosen nodeH (stay inside rect).
  const rFinal = Math.min((w - nodeW) / 2, (h - nodeH) / 2);
  // Epsilon: see supervisor path above.
  if (n > 1 && 2 * rFinal * Math.sin(Math.PI / n) + 0.5 < nodeW + MIN_EDGE_GAP / 2) {
    return {
      nodes: [],
      edges: [],
      error:
        `peer pattern with ${n} agents requires rect ≥ ` +
        `${Math.ceil((nodeW + MIN_EDGE_GAP / 2) / Math.sin(Math.PI / n) + nodeW)}` +
        ` on its shorter side; got ${Math.floor(Math.min(w, h))}`,
    };
  }

  const nodes: NodeSpec[] = agents.map((label, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      cx: cx + rFinal * Math.cos(angle),
      cy: cy + rFinal * Math.sin(angle),
      w: nodeW,
      h: nodeH,
      fontSize,
      label,
    };
  });
  const edges: Array<{ from: NodeSpec; to: NodeSpec }> = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      edges.push({ from: nodes[i], to: nodes[j] });
    }
  }
  return { nodes, edges };
}

interface AgentCoordinationGeometry {
  outer: Box;
  contentRect: Box;
  nodes: NodeSpec[];
  edges: Array<{ from: NodeSpec; to: NodeSpec }>;
  pattern: CoordinationPattern;
  title?: string;
  supervisorLabel: string;
  hasTitle: boolean;
  error?: string;
}

/**
 * Single source of truth for layout geometry — invoked by both the pure
 * layout function (for the validator) and the React component (for render).
 * Returning the raw nodes/edges lets the component render without recomputing.
 */
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
  const pattern = props.pattern ?? 'supervisor';
  const agents = props.agents ?? DEFAULT_AGENTS;
  const supervisorLabel = props.supervisor ?? 'Supervisor';
  const hasTitle = !!props.title;
  const contentRect: Box = {
    x1: outer.x1,
    y1: outer.y1 + (hasTitle ? TITLE_H : 0),
    x2: outer.x2,
    y2: outer.y2,
  };

  let result: { nodes: NodeSpec[]; edges: Array<{ from: NodeSpec; to: NodeSpec }>; error?: string };
  if (pattern === 'hierarchical') {
    result = layoutHierarchical(contentRect, agents, supervisorLabel);
  } else if (pattern === 'peer') {
    result = layoutPeer(contentRect, agents);
  } else {
    result = layoutSupervisor(contentRect, agents, supervisorLabel);
  }

  return {
    outer,
    contentRect,
    nodes: result.nodes,
    edges: result.edges,
    pattern,
    title: props.title,
    supervisorLabel,
    hasTitle,
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

  if (g.error) {
    return { outer: g.outer, children: [], error: `AgentCoordination ${g.error}` };
  }

  const children: CompositeChild[] = [];
  if (g.hasTitle && g.title) {
    children.push({
      kind: 'text',
      bbox: {
        x1: g.outer.x1,
        y1: g.outer.y1,
        x2: g.outer.x2,
        y2: g.outer.y1 + TITLE_H,
      },
      label: g.title,
    });
  }
  for (const n of g.nodes) {
    children.push({ kind: 'node', bbox: nodeBox(n), label: n.label });
  }
  // Edges are visual but don't contribute to collision checks (arrows between nodes);
  // still expose them for completeness.
  for (const e of g.edges) {
    children.push({
      kind: 'edge',
      bbox: {
        x1: Math.min(e.from.cx, e.to.cx),
        y1: Math.min(e.from.cy, e.to.cy),
        x2: Math.max(e.from.cx, e.to.cx),
        y2: Math.max(e.from.cy, e.to.cy),
      },
    });
  }

  return { outer: g.outer, children };
}

export const AgentCoordination: React.FC<AgentCoordinationProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 20,
    pattern = 'supervisor',
    agents = DEFAULT_AGENTS,
    supervisor = 'Supervisor',
    title,
  } = props;

  const g = computeAgentCoordinationGeometry({ x, y, w, h, pattern, agents, supervisor, title });
  if (g.error) {
    // Renderer surfaces the error in red so it's obvious when the validator
    // was bypassed. Prod paths reject at plan time before this renders.
    return (
      <g>
        <HandWrittenText
          text={`AgentCoordination layout error`}
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

  const rendered = { nodes: g.nodes, edges: g.edges };

  const titleEl = g.hasTitle && title ? (
    <HandWrittenText
      text={title}
      x={x + w / 2}
      y={y + TITLE_H - 16}
      startFrame={startFrame}
      durationFrames={18}
      fontSize={40}
      fill={COLORS.outline}
      textAnchor="middle"
    />
  ) : null;

  // Root node is at index 0 for both supervisor and hierarchical patterns.
  const rootNode = rendered.nodes[0];
  const isSupervisorNode = (n: NodeSpec) =>
    (pattern === 'supervisor' || pattern === 'hierarchical') && n === rootNode;
  const isLead = (n: NodeSpec) => pattern === 'hierarchical' && (n.label === 'Lead 1' || n.label === 'Lead 2');

  return (
    <g>
      {titleEl}
      {rendered.nodes.map((n, i) => {
        const fill = isSupervisorNode(n)
          ? COLORS.orange
          : isLead(n)
            ? COLORS.blue
            : COLORS.white;
        const stroke = isSupervisorNode(n)
          ? COLORS.orange
          : isLead(n)
            ? COLORS.blue
            : COLORS.outline;
        const fillOpacity = isSupervisorNode(n) ? 0.15 : isLead(n) ? 0.12 : 0;
        return (
          <GraphNode
            key={`node-${i}`}
            x={n.cx}
            y={n.cy}
            label={n.label}
            width={n.w}
            height={n.h}
            fontSize={n.fontSize}
            startFrame={startFrame + i * 8}
            drawDuration={drawDuration}
            fill={fill}
            stroke={stroke}
            fillOpacity={fillOpacity}
          />
        );
      })}
      {rendered.edges.map((e, i) => {
        const fromSize = { w: e.from.w, h: e.from.h };
        const toSize = { w: e.to.w, h: e.to.h };
        const color = pattern === 'peer' ? COLORS.purple : COLORS.orange;
        return (
          <GraphEdge
            key={`edge-${i}`}
            from={{ x: e.from.cx, y: e.from.cy }}
            to={{ x: e.to.cx, y: e.to.cy }}
            fromSize={fromSize}
            toSize={toSize}
            startFrame={startFrame + rendered.nodes.length * 8 + i * 4}
            drawDuration={14}
            color={color}
            directed={pattern !== 'peer'}
          />
        );
      })}
    </g>
  );
};
