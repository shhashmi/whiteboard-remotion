import React from 'react';
import { SketchBox, SketchLine, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface TradeoffMatrixProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  xAxis: { label: string; low: string; high: string };
  yAxis: { label: string; low: string; high: string };
  quadrants: [string, string, string, string];
  quadrantDetails?: [string?, string?, string?, string?];
  title?: string;
}

const TITLE_H = 56;
const X_AXIS_H = 56;
const Y_AXIS_W = 48;
const MIN_CELL_SIDE = 120;
const MIN_FONT_SIZE = 18;
const DEFAULT_FONT_SIZE = 36;

interface CellSpec {
  x: number;          // top-left corner
  y: number;          // top-left corner
  side: number;
  label: string;
  detail?: string;
  color: string;
  fontSize: number;
}

interface TradeoffMatrixGeometry {
  outer: Box;
  matrixRect: Box;    // inscribed square
  cells: CellSpec[];
  title?: string;
  titleBbox?: Box;
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisBbox: Box;
  yAxisBbox: Box;
  error?: string;
}

function computeTradeoffMatrixGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  xAxis: { label: string };
  yAxis: { label: string };
  quadrants: [string, string, string, string];
  quadrantDetails?: [string?, string?, string?, string?];
  title?: string;
}): TradeoffMatrixGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  // Reserve space: title on top (if present), y-axis label on left, x-axis label on bottom.
  const availW = props.w - Y_AXIS_W;
  const availH = props.h - X_AXIS_H - (hasTitle ? TITLE_H : 0);
  // Inscribe square.
  const side = Math.min(availW, availH);
  if (side < 2 * MIN_CELL_SIDE) {
    return {
      outer,
      matrixRect: { x1: 0, y1: 0, x2: 0, y2: 0 },
      cells: [],
      xAxisLabel: props.xAxis.label,
      yAxisLabel: props.yAxis.label,
      xAxisBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      yAxisBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      error: `TradeoffMatrix requires rect fitting a ${2 * MIN_CELL_SIDE}×${2 * MIN_CELL_SIDE} inscribed square (plus ${Y_AXIS_W}px for y-axis and ${X_AXIS_H}px for x-axis${hasTitle ? ` plus ${TITLE_H}px for title` : ''}); got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }
  // Center the inscribed square in the available area (after reserving title).
  const contentX1 = outer.x1 + Y_AXIS_W;
  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentW = outer.x2 - contentX1;
  const contentH = outer.y2 - contentY1 - X_AXIS_H;
  const matrixX = contentX1 + (contentW - side) / 2;
  const matrixY = contentY1 + (contentH - side) / 2;
  const matrixRect: Box = { x1: matrixX, y1: matrixY, x2: matrixX + side, y2: matrixY + side };

  const cellSide = side / 2;
  // Font size scales with cell.
  const padding = cellSide * 0.1;
  const availLabelW = cellSide - 2 * padding;
  const cellFontSize = Math.max(
    MIN_FONT_SIZE,
    Math.min(DEFAULT_FONT_SIZE, Math.floor(availLabelW / (10 * 0.55))),
  );

  const cellColors = [COLORS.blue, COLORS.green, COLORS.yellow, COLORS.red];
  const cells: CellSpec[] = [0, 1, 2, 3].map((i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    return {
      x: matrixX + col * cellSide,
      y: matrixY + row * cellSide,
      side: cellSide,
      label: props.quadrants[i],
      detail: props.quadrantDetails?.[i],
      color: cellColors[i],
      fontSize: cellFontSize,
    };
  });

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;
  const xAxisBbox: Box = {
    x1: matrixRect.x1,
    y1: matrixRect.y2,
    x2: matrixRect.x2,
    y2: matrixRect.y2 + X_AXIS_H,
  };
  const yAxisBbox: Box = {
    x1: matrixRect.x1 - Y_AXIS_W,
    y1: matrixRect.y1,
    x2: matrixRect.x1,
    y2: matrixRect.y2,
  };

  return {
    outer,
    matrixRect,
    cells,
    title: props.title,
    titleBbox,
    xAxisLabel: props.xAxis.label,
    yAxisLabel: props.yAxis.label,
    xAxisBbox,
    yAxisBbox,
  };
}

export function layoutTradeoffMatrix(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  xAxis: { label: string };
  yAxis: { label: string };
  quadrants: [string, string, string, string];
  quadrantDetails?: [string?, string?, string?, string?];
  title?: string;
}): CompositeLayoutResult {
  const g = computeTradeoffMatrixGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const c of g.cells) {
    children.push({
      kind: 'node',
      bbox: { x1: c.x, y1: c.y, x2: c.x + c.side, y2: c.y + c.side },
      label: c.label,
    });
  }
  children.push({ kind: 'text', bbox: g.xAxisBbox, label: g.xAxisLabel });
  children.push({ kind: 'text', bbox: g.yAxisBbox, label: g.yAxisLabel });
  return { outer: g.outer, children };
}

export const TradeoffMatrix: React.FC<TradeoffMatrixProps> = ({
  x,
  y,
  w,
  h,
  startFrame,
  drawDuration = 25,
  xAxis,
  yAxis,
  quadrants,
  quadrantDetails,
  title,
}) => {
  const g = computeTradeoffMatrixGeometry({ x, y, w, h, xAxis, yAxis, quadrants, quadrantDetails, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="TradeoffMatrix layout error"
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

  const { matrixRect, cells } = g;
  const matrixSide = matrixRect.x2 - matrixRect.x1;
  const cellSide = matrixSide / 2;

  return (
    <g>
      {title && (
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
      )}
      <SketchBox
        x={matrixRect.x1}
        y={matrixRect.y1}
        width={matrixSide}
        height={matrixSide}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={COLORS.outline}
        strokeWidth={2.5}
        rx={6}
      />
      <SketchLine
        x1={matrixRect.x1}
        y1={matrixRect.y1 + cellSide}
        x2={matrixRect.x2}
        y2={matrixRect.y1 + cellSide}
        startFrame={startFrame + drawDuration}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={2}
      />
      <SketchLine
        x1={matrixRect.x1 + cellSide}
        y1={matrixRect.y1}
        x2={matrixRect.x1 + cellSide}
        y2={matrixRect.y2}
        startFrame={startFrame + drawDuration}
        drawDuration={15}
        color={COLORS.outline}
        strokeWidth={2}
      />
      {cells.map((cell, i) => {
        const appear = startFrame + drawDuration + 20 + i * 8;
        const inset = cellSide * 0.03;
        return (
          <g key={`cell-${i}`}>
            <SketchBox
              x={cell.x + inset}
              y={cell.y + inset}
              width={cell.side - 2 * inset}
              height={cell.side - 2 * inset}
              startFrame={appear}
              drawDuration={15}
              stroke={cell.color}
              fill={cell.color}
              fillOpacity={0.12}
              rx={10}
            />
            <HandWrittenText
              text={cell.label}
              x={cell.x + cell.side / 2}
              y={cell.y + cell.side / 2 - (cell.detail ? cell.fontSize * 0.7 : 0)}
              startFrame={appear + 10}
              durationFrames={18}
              fontSize={cell.fontSize}
              fill={cell.color}
              fontWeight={700}
              textAnchor="middle"
            />
            {cell.detail && (
              <HandWrittenText
                text={cell.detail}
                x={cell.x + cell.side / 2}
                y={cell.y + cell.side / 2 + cell.fontSize * 0.9}
                startFrame={appear + 16}
                durationFrames={18}
                fontSize={Math.max(MIN_FONT_SIZE, cell.fontSize * 0.7)}
                fill={COLORS.gray1}
                textAnchor="middle"
                maxWidth={cell.side - 60}
              />
            )}
          </g>
        );
      })}
      <HandWrittenText
        text={`↑ ${yAxis.label}`}
        x={matrixRect.x1 - 8}
        y={(matrixRect.y1 + matrixRect.y2) / 2}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={28}
        fill={COLORS.outline}
        textAnchor="end"
      />
      <HandWrittenText
        text={yAxis.high}
        x={matrixRect.x1 - 8}
        y={matrixRect.y1 + 20}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={20}
        fill={COLORS.gray1}
        textAnchor="end"
      />
      <HandWrittenText
        text={yAxis.low}
        x={matrixRect.x1 - 8}
        y={matrixRect.y2 - 8}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={20}
        fill={COLORS.gray1}
        textAnchor="end"
      />
      <HandWrittenText
        text={xAxis.label}
        x={(matrixRect.x1 + matrixRect.x2) / 2}
        y={matrixRect.y2 + X_AXIS_H - 16}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={28}
        fill={COLORS.outline}
        textAnchor="middle"
      />
      <HandWrittenText
        text={xAxis.low}
        x={matrixRect.x1 + 12}
        y={matrixRect.y2 + 20}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={20}
        fill={COLORS.gray1}
        textAnchor="start"
      />
      <HandWrittenText
        text={xAxis.high}
        x={matrixRect.x2 - 12}
        y={matrixRect.y2 + 20}
        startFrame={startFrame + drawDuration + 10}
        durationFrames={18}
        fontSize={20}
        fill={COLORS.gray1}
        textAnchor="end"
      />
    </g>
  );
};
