import React from 'react';
import {
  SketchBox,
  SketchArrow,
  SketchCircle,
  HandWrittenText,
} from '../components';
import { COLORS } from '../theme';

export interface ReActLoopProps {
  startFrame: number;
  drawDuration?: number;
  stepDelay?: number;
  steps?: [string, string, string];
  showMemory?: boolean;
  showTools?: boolean;
  highlightStep?: 0 | 1 | 2;
  cx?: number;
  cy?: number;
  radius?: number;
}

interface NodeSpec {
  label: string;
  cx: number;
  cy: number;
}

const NODE_W = 340;
const NODE_H = 120;
const NODE_DRAW_FRAMES = 20;

function trianglePositions(
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number }[] {
  return [0, 1, 2].map((i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
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

export const ReActLoop: React.FC<ReActLoopProps> = ({
  startFrame,
  drawDuration = NODE_DRAW_FRAMES,
  stepDelay = 15,
  steps = ['Observe', 'Think', 'Act'],
  showMemory = false,
  showTools = false,
  highlightStep,
  cx = 960,
  cy = 540,
  radius = 320,
}) => {
  const centers = trianglePositions(cx, cy, radius);
  const nodes: NodeSpec[] = centers.map((c, i) => ({
    label: steps[i],
    cx: c.x,
    cy: c.y,
  }));

  const nodeElements = nodes.map((n, i) => {
    const isHighlight = highlightStep === i;
    return (
      <SketchBox
        key={`node-${i}`}
        x={n.cx - NODE_W / 2}
        y={n.cy - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
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
            fontSize: 44,
            startFrame: startFrame + i * stepDelay + 5,
            durationFrames: 20,
          },
        ]}
      />
    );
  });

  const arrows = nodes.map((_, i) => {
    const a = nodes[i];
    const b = nodes[(i + 1) % nodes.length];
    const endpoints = edgeEndpoints(
      { x: a.cx, y: a.cy },
      { x: b.cx, y: b.cy },
      NODE_W,
      NODE_H,
      24,
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

  const memoryR = Math.max(60, radius * 0.28);
  const memoryElement = showMemory ? (
    <g key="memory">
      <SketchCircle
        cx={cx}
        cy={cy}
        r={memoryR}
        startFrame={startFrame + nodes.length * stepDelay}
        drawDuration={drawDuration}
        stroke={COLORS.blue}
        strokeWidth={2.5}
        fill={COLORS.blue}
        fillOpacity={0.1}
      />
      <HandWrittenText
        text="Memory"
        x={cx}
        y={cy - 12}
        startFrame={startFrame + nodes.length * stepDelay + drawDuration - 10}
        durationFrames={15}
        fontSize={32}
        textAnchor="middle"
        fill={COLORS.blue}
      />
    </g>
  ) : null;

  const toolsElement = showTools ? (
    <g key="tools">
      <SketchBox
        x={cx + radius + 120}
        y={cy - 60}
        width={220}
        height={120}
        startFrame={startFrame + nodes.length * stepDelay}
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
            startFrame: startFrame + nodes.length * stepDelay + 5,
            durationFrames: 20,
          },
        ]}
      />
      <SketchArrow
        x1={nodes[2].cx + NODE_W / 2 + 20}
        y1={nodes[2].cy}
        x2={cx + radius + 120 - 10}
        y2={cy}
        startFrame={startFrame + nodes.length * stepDelay + drawDuration}
        drawDuration={15}
        color={COLORS.purple}
        strokeWidth={2.5}
      />
    </g>
  ) : null;

  return (
    <g>
      {arrows}
      {nodeElements}
      {memoryElement}
      {toolsElement}
    </g>
  );
};
