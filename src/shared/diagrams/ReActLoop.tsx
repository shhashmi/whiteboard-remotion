import React from 'react';
import {
  SketchBox,
  SketchArrow,
  SketchCircle,
  HandWrittenText,
} from '../components';
import { COLORS } from '../theme';
import { fitFontSizeToNode, FIT_FONT_NOT_POSSIBLE } from './GraphNodeEdge';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface ReActLoopProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  stepDelay?: number;
  steps?: [string, string, string];
  showMemory?: boolean;
  showTools?: boolean;
  highlightStep?: 0 | 1 | 2;
  title?: string;
}

const TITLE_H = 56;
const DEFAULT_NODE_W = 340;
const DEFAULT_NODE_H = 120;
const MIN_NODE_W = 140;
const MIN_NODE_H = 64;
const DEFAULT_FONT_SIZE = 44;
const MIN_FONT_SIZE = 18;
const EDGE_GAP = 24;
const TOOLS_BOX_W = 220;
const TOOLS_BOX_H = 120;
const TOOLS_MARGIN = 60;
const MEMORY_MIN_R = 60;
// Equilateral triangle vertex positions: top, bottom-right, bottom-left.
// Horizontal span (center-to-center) = r * sqrt(3); vertical span = 1.5 r.
const SQRT3 = Math.sqrt(3);

interface NodeSpec {
  cx: number;
  cy: number;
  w: number;
  h: number;
  fontSize: number;
  label: string;
}

interface ReActGeometry {
  outer: Box;
  contentRect: Box;
  nodes: NodeSpec[];
  radius: number;
  cx: number;
  cy: number;
  title?: string;
  titleBbox?: Box;
  memory?: { cx: number; cy: number; r: number };
  tools?: { x: number; y: number; w: number; h: number };
  highlightStep?: 0 | 1 | 2;
  error?: string;
}

function computeReActGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  steps?: [string, string, string];
  showMemory?: boolean;
  showTools?: boolean;
  highlightStep?: 0 | 1 | 2;
  title?: string;
}): ReActGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  const steps = props.steps ?? ['Observe', 'Think', 'Act'];

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const contentRect: Box = {
    x1: outer.x1,
    y1: outer.y1 + (hasTitle ? TITLE_H : 0),
    x2: outer.x2,
    y2: outer.y2,
  };
  const contentW = contentRect.x2 - contentRect.x1;
  const contentH = contentRect.y2 - contentRect.y1;

  // If `showTools`, carve TOOLS_BOX_W + TOOLS_MARGIN off the right for the tools rail.
  // Tools box only renders if doing so leaves enough room for the triangle.
  const triangleW = props.showTools
    ? contentW - (TOOLS_BOX_W + TOOLS_MARGIN)
    : contentW;

  // Solve for the largest radius fitting the triangle in triangleW × contentH,
  // assuming nodeW × nodeH nodes centered at each vertex.
  // Horizontal: r * sqrt(3) + nodeW ≤ triangleW  =>  r ≤ (triangleW - nodeW) / sqrt(3)
  // Vertical:   1.5 r + nodeH ≤ contentH       =>  r ≤ (contentH - nodeH) * 2/3
  // Use default node size first, then shrink nodes if radius would be too small.
  let nodeW = DEFAULT_NODE_W;
  let nodeH = DEFAULT_NODE_H;
  let r = Math.min((triangleW - nodeW) / SQRT3, (contentH - nodeH) * 2 / 3);

  if (r < 40) {
    // Not enough room with default-size nodes. Shrink to allow triangle to fit.
    // Pick the largest nodeW that still admits r ≥ nodeW (so nodes have
    // breathing room). Equivalent to: (triangleW - nodeW) / sqrt(3) ≥ nodeW
    //                                 => nodeW ≤ triangleW / (1 + sqrt(3))
    const maxNodeWByWidth = triangleW / (1 + SQRT3);
    // And vertically: (contentH - nodeH) * 2/3 ≥ nodeH  =>  nodeH ≤ contentH * 2/5
    const maxNodeHByHeight = contentH * 2 / 5;
    nodeW = Math.min(DEFAULT_NODE_W, Math.floor(maxNodeWByWidth));
    nodeH = Math.min(DEFAULT_NODE_H, Math.floor(maxNodeHByHeight));
    r = Math.min((triangleW - nodeW) / SQRT3, (contentH - nodeH) * 2 / 3);
  }

  if (nodeW < MIN_NODE_W || nodeH < MIN_NODE_H || r < EDGE_GAP) {
    const needW = Math.ceil(MIN_NODE_W * (1 + SQRT3) + (props.showTools ? TOOLS_BOX_W + TOOLS_MARGIN : 0));
    const needH = Math.ceil(MIN_NODE_H * 2.5 + (hasTitle ? TITLE_H : 0));
    return {
      outer,
      contentRect,
      nodes: [],
      radius: 0,
      cx: 0,
      cy: 0,
      error: `ReActLoop requires rect ≥ ${needW}×${needH}${props.showTools ? ' (with tools rail)' : ''}${hasTitle ? ' (with title)' : ''}; got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  // Verify each step label fits at ≥ MIN_FONT_SIZE in the chosen node size.
  let fontSize = DEFAULT_FONT_SIZE;
  for (const label of steps) {
    const fs = fitFontSizeToNode(label, nodeW, nodeH, {
      defaultFontSize: DEFAULT_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
    });
    if (fs === FIT_FONT_NOT_POSSIBLE) {
      return {
        outer,
        contentRect,
        nodes: [],
        radius: 0,
        cx: 0,
        cy: 0,
        error: `ReActLoop step label "${label}" does not fit in ${Math.floor(nodeW)}×${Math.floor(nodeH)} node at fontSize ≥ ${MIN_FONT_SIZE}`,
      };
    }
    if (fs < fontSize) fontSize = fs;
  }

  // Center the triangle in the triangle-region of the content rect.
  // The equilateral triangle is asymmetric about the circumcircle center:
  // top vertex is at cy-r, bottom vertices at cy+r/2. To center the visual
  // extent (top-of-top-node → bottom-of-bottom-nodes = 1.5r + nodeH) inside
  // contentRect, shift cy down by r/4. Without the shift, the top node
  // protrudes above contentRect.y1 and its bbox falsely overlaps whatever
  // sits above the rect.
  const triangleRegionX1 = contentRect.x1;
  const triangleRegionX2 = contentRect.x1 + triangleW;
  const cx = (triangleRegionX1 + triangleRegionX2) / 2;
  const cy = (contentRect.y1 + contentRect.y2) / 2 + r / 4;

  const vertices: Array<{ cx: number; cy: number }> = [0, 1, 2].map((i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return { cx: cx + r * Math.cos(angle), cy: cy + r * Math.sin(angle) };
  });

  const nodes: NodeSpec[] = vertices.map((v, i) => ({
    cx: v.cx,
    cy: v.cy,
    w: nodeW,
    h: nodeH,
    fontSize,
    label: steps[i],
  }));

  // Memory circle at center (inscribed so it doesn't collide with vertices).
  const memoryR = props.showMemory
    ? Math.max(MEMORY_MIN_R, Math.min(r - Math.max(nodeW, nodeH) / 2 - EDGE_GAP, r * 0.32))
    : 0;
  const memory = props.showMemory && memoryR >= MEMORY_MIN_R
    ? { cx, cy, r: memoryR }
    : undefined;

  const tools = props.showTools
    ? {
        x: contentRect.x2 - TOOLS_BOX_W,
        y: cy - TOOLS_BOX_H / 2,
        w: TOOLS_BOX_W,
        h: TOOLS_BOX_H,
      }
    : undefined;

  return {
    outer,
    contentRect,
    nodes,
    radius: r,
    cx,
    cy,
    title: props.title,
    titleBbox,
    memory,
    tools,
    highlightStep: props.highlightStep,
  };
}

function nodeBox(n: NodeSpec): Box {
  return {
    x1: n.cx - n.w / 2,
    y1: n.cy - n.h / 2,
    x2: n.cx + n.w / 2,
    y2: n.cy + n.h / 2,
  };
}

export function layoutReActLoop(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  steps?: [string, string, string];
  showMemory?: boolean;
  showTools?: boolean;
  highlightStep?: 0 | 1 | 2;
  title?: string;
}): CompositeLayoutResult {
  const g = computeReActGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const n of g.nodes) children.push({ kind: 'node', bbox: nodeBox(n), label: n.label });
  if (g.memory) {
    children.push({
      kind: 'node',
      bbox: {
        x1: g.memory.cx - g.memory.r,
        y1: g.memory.cy - g.memory.r,
        x2: g.memory.cx + g.memory.r,
        y2: g.memory.cy + g.memory.r,
      },
      label: 'Memory',
    });
  }
  if (g.tools) {
    children.push({
      kind: 'node',
      bbox: { x1: g.tools.x, y1: g.tools.y, x2: g.tools.x + g.tools.w, y2: g.tools.y + g.tools.h },
      label: 'Tools',
    });
  }
  return { outer: g.outer, children };
}

function edgeEndpoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
  boxW: number,
  boxH: number,
  gap = 20,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const hw = boxW / 2;
  const hh = boxH / 2;
  const t = Math.min(
    hw / Math.max(Math.abs(ux), 1e-6),
    hh / Math.max(Math.abs(uy), 1e-6),
  );
  return {
    x1: a.x + ux * (t + gap),
    y1: a.y + uy * (t + gap),
    x2: b.x - ux * (t + gap),
    y2: b.y - uy * (t + gap),
  };
}

export const ReActLoop: React.FC<ReActLoopProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 20,
    stepDelay = 15,
    steps = ['Observe', 'Think', 'Act'] as [string, string, string],
    showMemory = false,
    showTools = false,
    highlightStep,
    title,
  } = props;

  const g = computeReActGeometry({ x, y, w, h, steps, showMemory, showTools, highlightStep, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="ReActLoop layout error"
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

  const nodeElements = g.nodes.map((n, i) => {
    const isHighlight = highlightStep === i;
    return (
      <SketchBox
        key={`node-${i}`}
        x={n.cx - n.w / 2}
        y={n.cy - n.h / 2}
        width={n.w}
        height={n.h}
        startFrame={startFrame + i * stepDelay}
        drawDuration={drawDuration}
        fill={isHighlight ? COLORS.yellow : COLORS.white}
        fillOpacity={isHighlight ? 0.3 : 0}
        stroke={isHighlight ? COLORS.orange : COLORS.outline}
        strokeWidth={isHighlight ? 3.5 : 2.5}
        rx={14}
        rows={[
          {
            text: n.label,
            fontSize: n.fontSize,
            startFrame: startFrame + i * stepDelay + 5,
            durationFrames: 20,
          },
        ]}
      />
    );
  });

  const arrows = g.nodes.map((_, i) => {
    const a = g.nodes[i];
    const b = g.nodes[(i + 1) % g.nodes.length];
    const endpoints = edgeEndpoints(
      { x: a.cx, y: a.cy },
      { x: b.cx, y: b.cy },
      a.w,
      a.h,
      EDGE_GAP,
    );
    return (
      <SketchArrow
        key={`arrow-${i}`}
        {...endpoints}
        startFrame={startFrame + i * stepDelay + drawDuration}
        drawDuration={15}
        color={COLORS.orange}
        strokeWidth={3}
      />
    );
  });

  const titleEl = title && g.titleBbox ? (
    <HandWrittenText
      text={title}
      x={(g.outer.x1 + g.outer.x2) / 2}
      y={g.outer.y1 + TITLE_H - 16}
      startFrame={startFrame}
      durationFrames={18}
      fontSize={42}
      fill={COLORS.outline}
      textAnchor="middle"
    />
  ) : null;

  const memoryEl = g.memory ? (
    <g key="memory">
      <SketchCircle
        cx={g.memory.cx}
        cy={g.memory.cy}
        r={g.memory.r}
        startFrame={startFrame + g.nodes.length * stepDelay}
        drawDuration={drawDuration}
        stroke={COLORS.blue}
        strokeWidth={2.5}
        fill={COLORS.blue}
        fillOpacity={0.1}
      />
      <HandWrittenText
        text="Memory"
        x={g.memory.cx}
        y={g.memory.cy - 12}
        startFrame={startFrame + g.nodes.length * stepDelay + drawDuration - 10}
        durationFrames={15}
        fontSize={Math.min(32, Math.floor(g.memory.r * 0.5))}
        textAnchor="middle"
        fill={COLORS.blue}
      />
    </g>
  ) : null;

  const toolsEl = g.tools ? (
    <g key="tools">
      <SketchBox
        x={g.tools.x}
        y={g.tools.y}
        width={g.tools.w}
        height={g.tools.h}
        startFrame={startFrame + g.nodes.length * stepDelay}
        drawDuration={drawDuration}
        stroke={COLORS.purple}
        strokeWidth={2.5}
        fill={COLORS.purple}
        fillOpacity={0.1}
        rx={12}
        rows={[
          {
            text: 'Tools',
            fontSize: 36,
            startFrame: startFrame + g.nodes.length * stepDelay + 5,
            durationFrames: 20,
          },
        ]}
      />
    </g>
  ) : null;

  return (
    <g>
      {titleEl}
      {arrows}
      {nodeElements}
      {memoryEl}
      {toolsEl}
    </g>
  );
};
