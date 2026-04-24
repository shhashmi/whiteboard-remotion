import React from 'react';
import { GraphNode, GraphEdge, GraphNodeShape, fitFontSizeToNode, FIT_FONT_NOT_POSSIBLE } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export type FlowNodeKind = 'box' | 'diamond' | 'terminal';

/**
 * Flowchart nodes carry an explicit {row, col} — the component computes pixel
 * positions from the rect so every layout is deterministic and easy to
 * validate. Pass `colSpan`/`rowSpan` to straddle cells (e.g. a diamond that
 * anchors a decision point). Absolute {x, y} is no longer accepted.
 */
export interface FlowNode {
  id: string;
  label: string;
  kind?: FlowNodeKind;
  row: number;
  col: number;
  color?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  color?: string;
}

export interface FlowchartBuilderProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  nodeDelay?: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  title?: string;
}

const KIND_TO_SHAPE: Record<FlowNodeKind, GraphNodeShape> = {
  box: 'box',
  diamond: 'diamond',
  terminal: 'box',
};

const TITLE_H = 72;
const MARGIN = 40;
const MIN_NODE_W = 160;
const MIN_NODE_H = 80;
const MIN_FONT_SIZE = 18;
const DEFAULT_FONT_SIZE = 32;
const DIAMOND_H_RATIO = 1.35;

interface NodeSpec {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  kind: FlowNodeKind;
  shape: GraphNodeShape;
  fontSize: number;
  color?: string;
}

interface FlowchartGeometry {
  outer: Box;
  nodes: NodeSpec[];
  title?: string;
  titleBbox?: Box;
  rows: number;
  cols: number;
  error?: string;
}

function nodeBox(n: NodeSpec): Box {
  return { x1: n.cx - n.w / 2, y1: n.cy - n.h / 2, x2: n.cx + n.w / 2, y2: n.cy + n.h / 2 };
}

function computeFlowchartGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  nodes: FlowNode[];
  title?: string;
}): FlowchartGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  if (props.nodes.length === 0) {
    return {
      outer,
      nodes: [],
      rows: 0,
      cols: 0,
      error: 'FlowchartBuilder requires at least one node',
    };
  }

  let maxRow = 0;
  let maxCol = 0;
  for (const n of props.nodes) {
    if (n.row < 0 || n.col < 0 || !Number.isFinite(n.row) || !Number.isFinite(n.col)) {
      return {
        outer,
        nodes: [],
        rows: 0,
        cols: 0,
        error: `FlowchartBuilder node "${n.id}" has invalid row/col (${n.row}, ${n.col}); must be non-negative integers`,
      };
    }
    if (n.row > maxRow) maxRow = n.row;
    if (n.col > maxCol) maxCol = n.col;
  }
  const rows = maxRow + 1;
  const cols = maxCol + 1;

  const gridX1 = outer.x1 + MARGIN;
  const gridX2 = outer.x2 - MARGIN;
  const gridY1 = outer.y1 + (hasTitle ? TITLE_H : 0) + MARGIN;
  const gridY2 = outer.y2 - MARGIN;
  const gridW = gridX2 - gridX1;
  const gridH = gridY2 - gridY1;

  // Pick node size from grid cell budget. Nodes inset half-size from each grid
  // edge so row=0 / row=rows-1 stay strictly inside the rect. Per-row budget
  // must also leave room for the DIAMOND_H_RATIO scaling of diamond nodes.
  const MIN_EDGE_GAP = 32;
  const hasDiamond = props.nodes.some((n) => (n.kind ?? 'box') === 'diamond');
  const cellBudgetW = Math.floor(gridW / cols - MIN_EDGE_GAP);
  const rawCellBudgetH = gridH / rows - MIN_EDGE_GAP;
  // If any node is a diamond, the row's vertical budget has to accommodate
  // DIAMOND_H_RATIO × boxH. Divide the raw budget so boxH × DIAMOND_H_RATIO
  // still fits.
  const cellBudgetH = Math.floor(hasDiamond ? rawCellBudgetH / DIAMOND_H_RATIO : rawCellBudgetH);

  if (cellBudgetW < MIN_NODE_W || cellBudgetH < MIN_NODE_H) {
    const diamondFactor = hasDiamond ? DIAMOND_H_RATIO : 1;
    const needW = Math.ceil(cols * (MIN_NODE_W + MIN_EDGE_GAP) + 2 * MARGIN);
    const needH = Math.ceil(rows * (MIN_NODE_H * diamondFactor + MIN_EDGE_GAP) + 2 * MARGIN + (hasTitle ? TITLE_H : 0));
    return {
      outer,
      nodes: [],
      rows,
      cols,
      error: `FlowchartBuilder with ${rows}×${cols} grid${hasDiamond ? ' (with diamond nodes)' : ''} requires rect ≥ ${needW}×${needH}; got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  const defaultBoxW = Math.min(260, cellBudgetW);
  const defaultBoxH = Math.min(120, cellBudgetH);
  const diamondH = Math.floor(defaultBoxH * DIAMOND_H_RATIO);
  const tallestH = Math.max(defaultBoxH, diamondH);

  // Fit smallest font that renders every label at ≥ MIN_FONT_SIZE in its box.
  let fontSize = DEFAULT_FONT_SIZE;
  for (const n of props.nodes) {
    const kind = n.kind ?? 'box';
    const nW = defaultBoxW;
    const nH = kind === 'diamond' ? diamondH : defaultBoxH;
    const fs = fitFontSizeToNode(n.label, nW, nH, {
      defaultFontSize: DEFAULT_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
    });
    if (fs === FIT_FONT_NOT_POSSIBLE) {
      return {
        outer,
        nodes: [],
        rows,
        cols,
        error: `FlowchartBuilder node "${n.label}" does not fit in ${Math.floor(nW)}×${Math.floor(nH)} at fontSize ≥ ${MIN_FONT_SIZE}`,
      };
    }
    if (fs < fontSize) fontSize = fs;
  }

  // Node centers are inset by half-node size so both row=0 and row=rows-1 sit
  // entirely inside [gridY1, gridY2]. When rows=1 or cols=1, center within the
  // grid area. Otherwise pitch = (available span) / (rows-1).
  const vSlack = gridH - tallestH;
  const hSlack = gridW - defaultBoxW;
  const rowPitch = rows > 1 ? vSlack / (rows - 1) : 0;
  const colPitch = cols > 1 ? hSlack / (cols - 1) : 0;
  const originX = cols > 1 ? gridX1 + defaultBoxW / 2 : gridX1 + gridW / 2;
  const originY = rows > 1 ? gridY1 + tallestH / 2 : gridY1 + gridH / 2;

  const specs: NodeSpec[] = props.nodes.map((n) => {
    const kind = n.kind ?? 'box';
    const shape = KIND_TO_SHAPE[kind];
    const w = defaultBoxW;
    const h = kind === 'diamond' ? diamondH : defaultBoxH;
    const cx = originX + n.col * colPitch;
    const cy = originY + n.row * rowPitch;
    return {
      id: n.id,
      cx,
      cy,
      w,
      h,
      label: n.label,
      kind,
      shape,
      fontSize,
      color: n.color,
    };
  });

  return {
    outer,
    nodes: specs,
    title: props.title,
    titleBbox,
    rows,
    cols,
  };
}

export function layoutFlowchartBuilder(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  nodes: FlowNode[];
  title?: string;
}): CompositeLayoutResult {
  const g = computeFlowchartGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const n of g.nodes) children.push({ kind: 'node', bbox: nodeBox(n), label: n.label });
  return { outer: g.outer, children };
}

export const FlowchartBuilder: React.FC<FlowchartBuilderProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 20,
    nodeDelay = 10,
    nodes,
    edges,
    title,
  } = props;

  const g = computeFlowchartGeometry({ x, y, w, h, nodes, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="FlowchartBuilder layout error"
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

  const byId = new Map(g.nodes.map((n) => [n.id, n]));
  const timeById = new Map(g.nodes.map((n, i) => [n.id, startFrame + i * nodeDelay]));

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={(g.outer.x1 + g.outer.x2) / 2}
          y={g.outer.y1 + TITLE_H - 24}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {g.nodes.map((n) => {
        const stroke = n.color ?? (n.kind === 'terminal' ? COLORS.green : COLORS.outline);
        return (
          <GraphNode
            key={`fn-${n.id}`}
            x={n.cx}
            y={n.cy}
            label={n.label}
            shape={n.shape}
            width={n.w}
            height={n.h}
            startFrame={timeById.get(n.id)!}
            drawDuration={drawDuration}
            stroke={stroke}
            fontSize={n.fontSize}
            rx={n.kind === 'terminal' ? 50 : 12}
          />
        );
      })}
      {edges.map((e, i) => {
        const from = byId.get(e.from);
        const to = byId.get(e.to);
        if (!from || !to) return null;
        const latestNodeTime = Math.max(timeById.get(e.from)!, timeById.get(e.to)!);
        return (
          <GraphEdge
            key={`fe-${i}`}
            from={{ x: from.cx, y: from.cy }}
            to={{ x: to.cx, y: to.cy }}
            fromShape={from.shape}
            toShape={to.shape}
            fromSize={{ w: from.w, h: from.h }}
            toSize={{ w: to.w, h: to.h }}
            startFrame={latestNodeTime + drawDuration}
            drawDuration={12}
            color={e.color ?? COLORS.orange}
            label={e.label}
          />
        );
      })}
    </g>
  );
};
