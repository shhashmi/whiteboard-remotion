import React from 'react';
import { AnimatedPath, SketchArrow, COLORS } from '../components';

// ─── BarChart ─────────────────────────────────────────────────────────────────
interface BarChartProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const w = 120 * scale, h = 90 * scale;
  const x = cx - w / 2, y = cy - h / 2;
  const bars = [
    { height: 40 * scale, color: COLORS.blue },
    { height: 55 * scale, color: COLORS.green },
    { height: 48 * scale, color: COLORS.red },
    { height: 70 * scale, color: COLORS.orange },
  ];
  const barW = 20 * scale;
  const gap = 8 * scale;
  const axisD = `M ${x} ${y + h} L ${x + w} ${y + h} M ${x} ${y} L ${x} ${y + h}`;
  const trendD = `M ${x + barW / 2} ${y + h - bars[0].height} Q ${cx} ${y + h - bars[1].height - 10 * scale}, ${x + w - barW / 2} ${y + h - bars[3].height}`;

  const perBar = Math.floor(drawDuration / (bars.length + 2));

  return (
    <g>
      <AnimatedPath d={axisD} startFrame={startFrame} drawDuration={perBar} stroke={COLORS.outline} strokeWidth={2} />
      {bars.map((bar, i) => {
        const bx = x + i * (barW + gap) + gap;
        const bD = `M ${bx} ${y + h} L ${bx} ${y + h - bar.height} L ${bx + barW} ${y + h - bar.height} L ${bx + barW} ${y + h}`;
        return (
          <AnimatedPath
            key={i}
            d={bD}
            startFrame={startFrame + perBar + i * perBar}
            drawDuration={perBar}
            stroke={bar.color}
            strokeWidth={2}
            fill={bar.color}
            fillOpacity={0.5}
          />
        );
      })}
      <AnimatedPath
        d={trendD}
        startFrame={startFrame + perBar * 5}
        drawDuration={perBar}
        stroke={COLORS.red}
        strokeWidth={2.5}
        fill="none"
      />
      <SketchArrow
        x1={x + w - barW / 2 - 5 * scale}
        y1={y + h - bars[3].height + 5 * scale}
        x2={x + w + 5 * scale}
        y2={y + h - bars[3].height - 12 * scale}
        startFrame={startFrame + perBar * 5 + 5}
        drawDuration={perBar}
        color={COLORS.red}
        strokeWidth={2}
        headSize={8 * scale}
      />
    </g>
  );
};

// ─── DocStack ─────────────────────────────────────────────────────────────────
interface DocStackProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
}

export const DocStack: React.FC<DocStackProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
}) => {
  const w = 60 * scale, h = 78 * scale;
  const fold = 12 * scale;
  const perDoc = Math.floor(drawDuration / 3);

  const docs = [
    { dx: 10 * scale, dy: -10 * scale, color: '#e8e0d0' },
    { dx: 5 * scale, dy: -5 * scale, color: '#f0e8d8' },
    { dx: 0, dy: 0, color: '#fff8ee' },
  ];

  return (
    <g>
      {docs.map(({ dx, dy, color }, i) => {
        const x = cx - w / 2 + dx, y = cy - h / 2 + dy;
        const docD = `M ${x} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + fold} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
        const foldD = `M ${x + w - fold} ${y} L ${x + w - fold} ${y + fold} L ${x + w} ${y + fold}`;
        const l1 = `M ${x + 8 * scale} ${y + 22 * scale} L ${x + w - 8 * scale} ${y + 22 * scale}`;
        const l2 = `M ${x + 8 * scale} ${y + 32 * scale} L ${x + w - 8 * scale} ${y + 32 * scale}`;
        const l3 = `M ${x + 8 * scale} ${y + 42 * scale} L ${x + w - 14 * scale} ${y + 42 * scale}`;
        const sf = startFrame + i * perDoc;
        return (
          <g key={i}>
            <AnimatedPath d={docD} startFrame={sf} drawDuration={perDoc * 0.6} stroke={COLORS.outline} fill={color} fillOpacity={0.9} />
            <AnimatedPath d={foldD} startFrame={sf + perDoc * 0.3} drawDuration={perDoc * 0.3} stroke={COLORS.outline} />
            <AnimatedPath d={l1} startFrame={sf + perDoc * 0.5} drawDuration={perDoc * 0.2} stroke={COLORS.outline} strokeWidth={1.5} />
            <AnimatedPath d={l2} startFrame={sf + perDoc * 0.6} drawDuration={perDoc * 0.2} stroke={COLORS.outline} strokeWidth={1.5} />
            <AnimatedPath d={l3} startFrame={sf + perDoc * 0.7} drawDuration={perDoc * 0.2} stroke={COLORS.outline} strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
};

// ─── PieChart ─────────────────────────────────────────────────────────────────
interface PieChartProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  slices?: number[];
  colors?: string[];
}

export const PieChart: React.FC<PieChartProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration,
  slices = [35, 25, 20, 20],
  colors = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple],
}) => {
  const s = scale;
  const r = 32 * s;
  const total = slices.reduce((a, b) => a + b, 0);
  const perSlice = Math.floor(drawDuration / slices.length);

  let currentAngle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  for (let i = 0; i < slices.length; i++) {
    const sweepAngle = (slices[i] / total) * Math.PI * 2;
    const endAngle = currentAngle + sweepAngle;
    const largeArc = sweepAngle > Math.PI ? 1 : 0;

    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    paths.push({ d, color: colors[i % colors.length] });
    currentAngle = endAngle;
  }

  return (
    <g>
      {paths.map((p, i) => (
        <AnimatedPath key={i} d={p.d} startFrame={startFrame + i * perSlice} drawDuration={perSlice} stroke={COLORS.outline} strokeWidth={2} fill={p.color} fillOpacity={0.5} />
      ))}
    </g>
  );
};

// ─── LineGraph ────────────────────────────────────────────────────────────────
interface LineGraphProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const LineGraph: React.FC<LineGraphProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const w = 100 * s, h = 70 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const dur3 = Math.floor(drawDuration / 3);

  const axisD = `M ${x} ${y + h} L ${x + w} ${y + h} M ${x} ${y} L ${x} ${y + h}`;

  const points = [
    { px: 0, py: 0.7 },
    { px: 0.2, py: 0.5 },
    { px: 0.4, py: 0.6 },
    { px: 0.6, py: 0.3 },
    { px: 0.8, py: 0.15 },
    { px: 1, py: 0.2 },
  ];

  let lineD = '';
  const dotPaths: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const px = x + points[i].px * w;
    const py = y + h - points[i].py * h;
    lineD += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    const dr = 3 * s, dk = dr * 0.56;
    dotPaths.push(`M ${px} ${py - dr} C ${px + dk} ${py - dr}, ${px + dr} ${py - dk}, ${px + dr} ${py} C ${px + dr} ${py + dk}, ${px + dk} ${py + dr}, ${px} ${py + dr} C ${px - dk} ${py + dr}, ${px - dr} ${py + dk}, ${px - dr} ${py} C ${px - dr} ${py - dk}, ${px - dk} ${py - dr}, ${px} ${py - dr} Z`);
  }

  return (
    <g>
      <AnimatedPath d={axisD} startFrame={startFrame} drawDuration={dur3} stroke={COLORS.outline} strokeWidth={2} />
      <AnimatedPath d={lineD} startFrame={startFrame + dur3} drawDuration={dur3} stroke={color} strokeWidth={2.5 * s} />
      {dotPaths.map((dd, i) => (
        <AnimatedPath key={i} d={dd} startFrame={startFrame + dur3 + Math.floor(i * dur3 / dotPaths.length)} drawDuration={Math.max(4, dur3 / dotPaths.length)} stroke={color} fill={color} fillOpacity={0.8} />
      ))}
    </g>
  );
};

// ─── ProgressBar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  percent?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, percent = 65, color = COLORS.green,
}) => {
  const s = scale;
  const w = 120 * s, h = 18 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const dur2 = Math.floor(drawDuration / 2);

  const bgD =
    `M ${x + 2} ${y + 1} L ${x + w - 1} ${y - 1} ` +
    `L ${x + w + 1} ${y + h + 1} L ${x - 1} ${y + h - 1} Z`;

  const fillW = (w - 4) * (percent / 100);
  const fillD =
    `M ${x + 2} ${y + 2} L ${x + 2 + fillW} ${y + 2} ` +
    `L ${x + 2 + fillW} ${y + h - 2} L ${x + 2} ${y + h - 2} Z`;

  return (
    <g>
      <AnimatedPath d={bgD} startFrame={startFrame} drawDuration={dur2} stroke={COLORS.outline} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
      <AnimatedPath d={fillD} startFrame={startFrame + dur2} drawDuration={dur2} stroke="none" strokeWidth={0} fill={color} fillOpacity={0.6} />
    </g>
  );
};

// ─── ProjectPlannerIcon ──────────────────────────────────────────────────────
interface ProjectPlannerIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ProjectPlannerIcon: React.FC<ProjectPlannerIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  // Main clipboard/board background
  const boardD =
    `M ${cx - 28 * s} ${cy - 35 * s} ` +
    `L ${cx + 28 * s} ${cy - 35 * s} ` +
    `Q ${cx + 30 * s} ${cy - 35 * s}, ${cx + 30 * s} ${cy - 33 * s} ` +
    `L ${cx + 30 * s} ${cy + 32 * s} ` +
    `Q ${cx + 30 * s} ${cy + 34 * s}, ${cx + 28 * s} ${cy + 34 * s} ` +
    `L ${cx - 28 * s} ${cy + 34 * s} ` +
    `Q ${cx - 30 * s} ${cy + 34 * s}, ${cx - 30 * s} ${cy + 32 * s} ` +
    `L ${cx - 30 * s} ${cy - 33 * s} ` +
    `Q ${cx - 30 * s} ${cy - 35 * s}, ${cx - 28 * s} ${cy - 35 * s} Z`;

  // Timeline/Gantt chart horizontal bars
  const timelineD =
    `M ${cx - 22 * s} ${cy - 22 * s} L ${cx + 8 * s} ${cy - 22 * s} ` +
    `M ${cx - 22 * s} ${cy - 12 * s} L ${cx + 18 * s} ${cy - 12 * s} ` +
    `M ${cx - 22 * s} ${cy - 2 * s} L ${cx + 2 * s} ${cy - 2 * s} ` +
    `M ${cx - 22 * s} ${cy + 8 * s} L ${cx + 22 * s} ${cy + 8 * s} ` +
    `M ${cx - 22 * s} ${cy + 18 * s} L ${cx + 12 * s} ${cy + 18 * s}`;

  // Connecting network arrows/lines
  const connectionsD =
    `M ${cx + 8 * s} ${cy - 20 * s} L ${cx + 14 * s} ${cy - 16 * s} L ${cx + 18 * s} ${cy - 14 * s} ` +
    `M ${cx + 2 * s} ${cy + 0 * s} L ${cx + 8 * s} ${cy + 4 * s} L ${cx + 22 * s} ${cy + 6 * s} ` +
    `M ${cx + 12 * s} ${cy + 20 * s} L ${cx + 18 * s} ${cy + 24 * s} ` +
    // Small arrowheads
    `M ${cx + 16 * s} ${cy - 17 * s} L ${cx + 18 * s} ${cy - 14 * s} L ${cx + 15 * s} ${cy - 15 * s} ` +
    `M ${cx + 20 * s} ${cy + 5 * s} L ${cx + 22 * s} ${cy + 6 * s} L ${cx + 20 * s} ${cy + 7 * s}`;

  // Task checkboxes and checkmarks
  const tasksD =
    // Checkboxes
    `M ${cx - 26 * s} ${cy - 26 * s} L ${cx - 22 * s} ${cy - 26 * s} L ${cx - 22 * s} ${cy - 18 * s} L ${cx - 26 * s} ${cy - 18 * s} Z ` +
    `M ${cx - 26 * s} ${cy - 16 * s} L ${cx - 22 * s} ${cy - 16 * s} L ${cx - 22 * s} ${cy - 8 * s} L ${cx - 26 * s} ${cy - 8 * s} Z ` +
    `M ${cx - 26 * s} ${cy - 6 * s} L ${cx - 22 * s} ${cy - 6 * s} L ${cx - 22 * s} ${cy + 2 * s} L ${cx - 26 * s} ${cy + 2 * s} Z ` +
    // Checkmarks
    `M ${cx - 25 * s} ${cy - 22 * s} L ${cx - 24 * s} ${cy - 20 * s} L ${cx - 23 * s} ${cy - 24 * s} ` +
    `M ${cx - 25 * s} ${cy + 0 * s} L ${cx - 24 * s} ${cy + 2 * s} L ${cx - 23 * s} ${cy - 2 * s}`;

  return (
    <g>
      <AnimatedPath
        d={boardD}
        startFrame={startFrame}
        drawDuration={dur4}
        stroke={COLORS.outline}
        strokeWidth={2.5}
        fill={COLORS.white}
        fillOpacity={0.9}
      />
      <AnimatedPath
        d={timelineD}
        startFrame={startFrame + dur4}
        drawDuration={dur4}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <AnimatedPath
        d={connectionsD}
        startFrame={startFrame + dur4 * 2}
        drawDuration={dur4}
        stroke={COLORS.orange}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <AnimatedPath
        d={tasksD}
        startFrame={startFrame + dur4 * 3}
        drawDuration={dur4}
        stroke={COLORS.green}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
};
