import React from 'react';
import { GraphNode, GraphEdge, fitFontSizeToNode, FIT_FONT_NOT_POSSIBLE } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface GeneratorCriticLoopProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  generatorLabel?: string;
  criticLabel?: string;
  iterations?: number;
  title?: string;
}

const TITLE_H = 72;
const ITER_LABEL_H = 56;
const DEFAULT_NODE_W = 300;
const DEFAULT_NODE_H = 140;
const MIN_NODE_W = 160;
const MIN_NODE_H = 80;
const MIN_EDGE_GAP = 80; // center-to-center minus node widths should leave this much for labels
const DEFAULT_FONT_SIZE = 40;
const MIN_FONT_SIZE = 18;
const EDGE_Y_OFFSET = 30;

interface NodeSpec {
  cx: number;
  cy: number;
  w: number;
  h: number;
  fontSize: number;
  label: string;
}

interface GeneratorCriticGeometry {
  outer: Box;
  gen: NodeSpec;
  crit: NodeSpec;
  iterY: number;
  iterations: number;
  title?: string;
  titleBbox?: Box;
  iterBbox: Box;
  error?: string;
}

function computeGeneratorCriticGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  generatorLabel?: string;
  criticLabel?: string;
  iterations?: number;
  title?: string;
}): GeneratorCriticGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  const generatorLabel = props.generatorLabel ?? 'Generator';
  const criticLabel = props.criticLabel ?? 'Critic';
  const iterations = props.iterations ?? 3;

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentY2 = outer.y2 - ITER_LABEL_H; // reserve for iterations label
  const contentH = contentY2 - contentY1;

  // Two nodes + gap must fit in w.
  const maxNodeW = Math.min(DEFAULT_NODE_W, (props.w - MIN_EDGE_GAP) / 2);
  const maxNodeH = Math.min(DEFAULT_NODE_H, contentH);

  if (maxNodeW < MIN_NODE_W || maxNodeH < MIN_NODE_H) {
    const needW = Math.ceil(2 * MIN_NODE_W + MIN_EDGE_GAP);
    const needH = Math.ceil(MIN_NODE_H + (hasTitle ? TITLE_H : 0) + ITER_LABEL_H);
    return {
      outer,
      gen: {} as NodeSpec,
      crit: {} as NodeSpec,
      iterY: 0,
      iterations,
      iterBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      error: `GeneratorCriticLoop requires rect ≥ ${needW}×${needH}${hasTitle ? ' (with title)' : ''}; got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  const nodeW = maxNodeW;
  const nodeH = maxNodeH;

  let fontSize = DEFAULT_FONT_SIZE;
  for (const label of [generatorLabel, criticLabel]) {
    const fs = fitFontSizeToNode(label, nodeW, nodeH, {
      defaultFontSize: DEFAULT_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
    });
    if (fs === FIT_FONT_NOT_POSSIBLE) {
      return {
        outer,
        gen: {} as NodeSpec,
        crit: {} as NodeSpec,
        iterY: 0,
        iterations,
        iterBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
        error: `GeneratorCriticLoop label "${label}" does not fit in ${Math.floor(nodeW)}×${Math.floor(nodeH)} at fontSize ≥ ${MIN_FONT_SIZE}`,
      };
    }
    if (fs < fontSize) fontSize = fs;
  }

  // Spread both nodes evenly across w.
  const cy = (contentY1 + contentY2) / 2;
  const genCx = outer.x1 + props.w * 0.28;
  const critCx = outer.x1 + props.w * 0.72;

  const gen: NodeSpec = { cx: genCx, cy, w: nodeW, h: nodeH, fontSize, label: generatorLabel };
  const crit: NodeSpec = { cx: critCx, cy, w: nodeW, h: nodeH, fontSize, label: criticLabel };
  const iterY = outer.y2 - ITER_LABEL_H / 2;

  const iterBbox: Box = {
    x1: outer.x1,
    y1: outer.y2 - ITER_LABEL_H,
    x2: outer.x2,
    y2: outer.y2,
  };

  return {
    outer,
    gen,
    crit,
    iterY,
    iterations,
    title: props.title,
    titleBbox,
    iterBbox,
  };
}

function nodeBox(n: NodeSpec): Box {
  return { x1: n.cx - n.w / 2, y1: n.cy - n.h / 2, x2: n.cx + n.w / 2, y2: n.cy + n.h / 2 };
}

export function layoutGeneratorCriticLoop(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  generatorLabel?: string;
  criticLabel?: string;
  iterations?: number;
  title?: string;
}): CompositeLayoutResult {
  const g = computeGeneratorCriticGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  children.push({ kind: 'node', bbox: nodeBox(g.gen), label: g.gen.label });
  children.push({ kind: 'node', bbox: nodeBox(g.crit), label: g.crit.label });
  // Edges between the two nodes (both directions).
  const edgeBox: Box = {
    x1: g.gen.cx,
    y1: g.gen.cy - EDGE_Y_OFFSET - 20,
    x2: g.crit.cx,
    y2: g.crit.cy + EDGE_Y_OFFSET + 20,
  };
  children.push({ kind: 'edge', bbox: edgeBox });
  children.push({ kind: 'text', bbox: g.iterBbox, label: `× ${g.iterations} iterations` });
  return { outer: g.outer, children };
}

export const GeneratorCriticLoop: React.FC<GeneratorCriticLoopProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 18,
    generatorLabel = 'Generator',
    criticLabel = 'Critic',
    iterations = 3,
    title = 'Generator ↔ Critic',
  } = props;

  const g = computeGeneratorCriticGeometry({ x, y, w, h, generatorLabel, criticLabel, iterations, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="GeneratorCriticLoop layout error"
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

  const nodeSize = { w: g.gen.w, h: g.gen.h };

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={(g.outer.x1 + g.outer.x2) / 2}
          y={g.outer.y1 + TITLE_H - 24}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <GraphNode
        x={g.gen.cx}
        y={g.gen.cy}
        label={g.gen.label}
        width={g.gen.w}
        height={g.gen.h}
        startFrame={startFrame + 10}
        drawDuration={drawDuration}
        stroke={COLORS.orange}
        fill={COLORS.orange}
        fillOpacity={0.15}
        fontSize={g.gen.fontSize}
        labelColor={COLORS.orange}
      />
      <GraphNode
        x={g.crit.cx}
        y={g.crit.cy}
        label={g.crit.label}
        width={g.crit.w}
        height={g.crit.h}
        startFrame={startFrame + 10 + drawDuration}
        drawDuration={drawDuration}
        stroke={COLORS.blue}
        fill={COLORS.blue}
        fillOpacity={0.15}
        fontSize={g.crit.fontSize}
        labelColor={COLORS.blue}
      />
      <GraphEdge
        from={{ x: g.gen.cx, y: g.gen.cy - EDGE_Y_OFFSET }}
        to={{ x: g.crit.cx, y: g.crit.cy - EDGE_Y_OFFSET }}
        fromSize={nodeSize}
        toSize={nodeSize}
        startFrame={startFrame + 10 + 2 * drawDuration}
        drawDuration={drawDuration}
        color={COLORS.orange}
        label="draft"
      />
      <GraphEdge
        from={{ x: g.crit.cx, y: g.crit.cy + EDGE_Y_OFFSET }}
        to={{ x: g.gen.cx, y: g.gen.cy + EDGE_Y_OFFSET }}
        fromSize={nodeSize}
        toSize={nodeSize}
        startFrame={startFrame + 10 + 3 * drawDuration}
        drawDuration={drawDuration}
        color={COLORS.blue}
        label="critique"
      />
      <HandWrittenText
        text={`× ${iterations} iterations`}
        x={(g.outer.x1 + g.outer.x2) / 2}
        y={g.iterY}
        startFrame={startFrame + 10 + 4 * drawDuration}
        durationFrames={20}
        fontSize={36}
        fill={COLORS.gray1}
        textAnchor="middle"
      />
    </g>
  );
};
