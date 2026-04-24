import React from 'react';
import {
  AnimatedPath,
  SketchCircle,
  HandWrittenText,
  SketchLine,
} from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface AutonomySpectrumProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  levels?: string[];
  labels?: string[];
  marker?: number;
  title?: string;
}

const DEFAULT_LEVELS = ['L1', 'L2', 'L3', 'L4'];
const DEFAULT_LABELS = ['Assistive', 'Supervised', 'Delegated', 'Autonomous'];

const TITLE_H = 64;
const LEVEL_FONT = 40;
const LABEL_FONT = 28;
const TICK_HALF = 24;
const LEVEL_OFFSET = 70;
const LABEL_OFFSET = 130;
const LABEL_BELOW_MARGIN = 40;
const CHAR_WIDTH_FACTOR = 0.55;
const MIN_TICK_GAP = 16;
const MIN_CONTENT_H = TICK_HALF + LABEL_OFFSET + LABEL_BELOW_MARGIN; // space from line up to tick top and down to label bottom
const SIDE_PAD = 24; // horizontal breathing room so the end-tick labels don't hug the rect edge

interface TickSpec {
  cx: number;
  level: string;
  label?: string;
}

interface AutonomySpectrumGeometry {
  outer: Box;
  lineY: number;
  lineX1: number;
  lineX2: number;
  ticks: TickSpec[];
  title?: string;
  titleBbox?: Box;
  marker?: number;
  error?: string;
}

function labelCellWidth(levels: string[], labels: string[]): number {
  let longest = 0;
  for (let i = 0; i < levels.length; i++) {
    const levelW = levels[i].length * LEVEL_FONT * CHAR_WIDTH_FACTOR;
    const labelW = (labels[i] ?? '').length * LABEL_FONT * CHAR_WIDTH_FACTOR;
    longest = Math.max(longest, levelW, labelW);
  }
  return longest;
}

function computeAutonomySpectrumGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  levels?: string[];
  labels?: string[];
  marker?: number;
  title?: string;
}): AutonomySpectrumGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const levels = props.levels ?? DEFAULT_LEVELS;
  const labels = props.labels ?? DEFAULT_LABELS;
  const hasTitle = !!props.title;
  const n = levels.length;

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentH = outer.y2 - contentY1;

  if (contentH < MIN_CONTENT_H) {
    return {
      outer,
      lineY: 0,
      lineX1: 0,
      lineX2: 0,
      ticks: [],
      error: `AutonomySpectrum requires content height ≥ ${MIN_CONTENT_H}px${hasTitle ? ` (plus ${TITLE_H}px for title)` : ''}; got ${Math.floor(contentH)}px`,
    };
  }

  // Horizontal minimum: each tick needs enough room for its widest label.
  const cellW = labelCellWidth(levels, labels) + MIN_TICK_GAP;
  const needW = Math.ceil(n * cellW + 2 * SIDE_PAD);
  if (props.w < needW) {
    return {
      outer,
      lineY: 0,
      lineX1: 0,
      lineX2: 0,
      ticks: [],
      error: `AutonomySpectrum with ${n} levels requires rect width ≥ ${needW}px; got ${Math.floor(props.w)}px`,
    };
  }

  const lineX1 = outer.x1 + SIDE_PAD;
  const lineX2 = outer.x2 - SIDE_PAD;
  // Position the line so its content block (line ± TICK_HALF up, LABEL_OFFSET + margin down) fits inside contentRect.
  const lineY = contentY1 + TICK_HALF + (contentH - MIN_CONTENT_H) / 2;

  const tickW = (lineX2 - lineX1) / Math.max(1, n - 1);
  const ticks: TickSpec[] = levels.map((level, i) => ({
    cx: n === 1 ? (lineX1 + lineX2) / 2 : lineX1 + i * tickW,
    level,
    label: labels[i],
  }));

  return {
    outer,
    lineY,
    lineX1,
    lineX2,
    ticks,
    title: props.title,
    titleBbox,
    marker: props.marker,
  };
}

export function layoutAutonomySpectrum(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  levels?: string[];
  labels?: string[];
  marker?: number;
  title?: string;
}): CompositeLayoutResult {
  const g = computeAutonomySpectrumGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });

  // Spectrum line itself.
  children.push({
    kind: 'edge',
    bbox: { x1: g.lineX1, y1: g.lineY - 2, x2: g.lineX2, y2: g.lineY + 2 },
  });

  const n = g.ticks.length;
  const tickCellW = n > 1 ? (g.lineX2 - g.lineX1) / (n - 1) : g.outer.x2 - g.outer.x1;
  for (const t of g.ticks) {
    // Each tick's text cell spans half the neighbour-gap on each side, clamped to outer.
    const halfCell = tickCellW / 2;
    const x1 = Math.max(g.outer.x1, t.cx - halfCell);
    const x2 = Math.min(g.outer.x2, t.cx + halfCell);
    children.push({
      kind: 'text',
      bbox: {
        x1,
        y1: g.lineY - TICK_HALF,
        x2,
        y2: g.lineY + LABEL_OFFSET + LABEL_BELOW_MARGIN / 2,
      },
      label: t.label ?? t.level,
    });
  }

  return { outer: g.outer, children };
}

export const AutonomySpectrum: React.FC<AutonomySpectrumProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 25,
    levels = DEFAULT_LEVELS,
    labels = DEFAULT_LABELS,
    marker,
    title,
  } = props;

  const g = computeAutonomySpectrumGeometry({ x, y, w, h, levels, labels, marker, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="AutonomySpectrum layout error"
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

  const { lineY, lineX1, lineX2, ticks } = g;

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={(g.outer.x1 + g.outer.x2) / 2}
          y={g.outer.y1 + TITLE_H - 16}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <AnimatedPath
        d={`M ${lineX1} ${lineY} L ${lineX2} ${lineY}`}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={COLORS.outline}
        strokeWidth={4}
      />
      {ticks.map((t, i) => (
        <g key={`tick-${i}`}>
          <SketchLine
            x1={t.cx}
            y1={lineY - TICK_HALF}
            x2={t.cx}
            y2={lineY + TICK_HALF}
            startFrame={startFrame + 10 + i * 6}
            drawDuration={8}
            color={COLORS.outline}
            strokeWidth={3}
          />
          <HandWrittenText
            text={t.level}
            x={t.cx}
            y={lineY + LEVEL_OFFSET}
            startFrame={startFrame + drawDuration + i * 6}
            durationFrames={12}
            fontSize={LEVEL_FONT}
            fill={COLORS.outline}
            textAnchor="middle"
          />
          {t.label && (
            <HandWrittenText
              text={t.label}
              x={t.cx}
              y={lineY + LABEL_OFFSET}
              startFrame={startFrame + drawDuration + 10 + i * 6}
              durationFrames={14}
              fontSize={LABEL_FONT}
              fill={COLORS.gray1}
              textAnchor="middle"
            />
          )}
        </g>
      ))}
      {marker !== undefined && marker >= 0 && marker < ticks.length && (
        <SketchCircle
          cx={ticks[marker].cx}
          cy={lineY}
          r={28}
          startFrame={startFrame + drawDuration + ticks.length * 6 + 10}
          drawDuration={15}
          stroke={COLORS.orange}
          strokeWidth={4}
          fill={COLORS.orange}
          fillOpacity={0.25}
        />
      )}
    </g>
  );
};
