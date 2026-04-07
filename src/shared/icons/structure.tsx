import React from 'react';
import { AnimatedPath, SketchLine, COLORS } from '../components';

// ─── ScaleIcon ────────────────────────────────────────────────────────────────
interface ScaleIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const ScaleIcon: React.FC<ScaleIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.purple,
}) => {
  const s = scale;
  const dur4 = Math.floor(drawDuration / 4);

  const beamD = `M ${cx - 38 * s} ${cy - 8 * s} L ${cx + 38 * s} ${cy - 8 * s}`;
  const postD = `M ${cx} ${cy - 8 * s} L ${cx} ${cy + 30 * s}`;
  const baseD = `M ${cx - 18 * s} ${cy + 30 * s} L ${cx + 18 * s} ${cy + 30 * s}`;

  const makePanel = (px: number) => {
    const pw = 22 * s, ph = 16 * s;
    return `M ${px - pw / 2} ${cy - 8 * s} L ${px - pw / 2 - 4 * s} ${cy - 8 * s + ph} L ${px + pw / 2 + 4 * s} ${cy - 8 * s + ph} L ${px + pw / 2} ${cy - 8 * s}`;
  };

  const leftPanelD = makePanel(cx - 38 * s);
  const rightPanelD = makePanel(cx + 38 * s);

  const fulcrumD =
    `M ${cx} ${cy - 8 * s} ` +
    `L ${cx - 8 * s} ${cy - 22 * s} ` +
    `L ${cx + 8 * s} ${cy - 22 * s} Z`;

  return (
    <g>
      <AnimatedPath d={fulcrumD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.2} />
      <AnimatedPath d={beamD} startFrame={startFrame + dur4} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={leftPanelD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={rightPanelD} startFrame={startFrame + dur4 * 2} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.15} />
      <AnimatedPath d={postD} startFrame={startFrame + dur4 * 3} drawDuration={dur4 / 2} stroke={COLORS.outline} strokeWidth={2.5} />
      <AnimatedPath d={baseD} startFrame={startFrame + dur4 * 3 + dur4 / 2} drawDuration={dur4 / 2} stroke={COLORS.outline} strokeWidth={3} />
    </g>
  );
};

// ─── TreeDiagram ──────────────────────────────────────────────────────────────
interface TreeDiagramProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  levels?: number[];
  color?: string;
}

export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, levels = [1, 3], color = COLORS.blue,
}) => {
  const s = scale;
  const nodeR = 10 * s;
  const levelGap = 50 * s;
  const totalLevels = levels.length;
  const perLevel = Math.floor(drawDuration / totalLevels);
  const topY = cy - ((totalLevels - 1) * levelGap) / 2;

  const nodePositions: { x: number; y: number }[][] = [];

  for (let l = 0; l < totalLevels; l++) {
    const count = levels[l];
    const yPos = topY + l * levelGap;
    const totalWidth = (count - 1) * 55 * s;
    const startX = cx - totalWidth / 2;
    const row: { x: number; y: number }[] = [];
    for (let n = 0; n < count; n++) {
      row.push({ x: startX + n * 55 * s, y: yPos });
    }
    nodePositions.push(row);
  }

  const k = nodeR * 0.56;
  const makeCircle = (px: number, py: number) =>
    `M ${px} ${py - nodeR} C ${px + k} ${py - nodeR}, ${px + nodeR} ${py - k}, ${px + nodeR} ${py} C ${px + nodeR} ${py + k}, ${px + k} ${py + nodeR}, ${px} ${py + nodeR} C ${px - k} ${py + nodeR}, ${px - nodeR} ${py + k}, ${px - nodeR} ${py} C ${px - nodeR} ${py - k}, ${px - k} ${py - nodeR}, ${px} ${py - nodeR} Z`;

  return (
    <g>
      {nodePositions.map((row, l) => (
        <g key={`level-${l}`}>
          {row.map((node, n) => (
            <g key={`node-${l}-${n}`}>
              <AnimatedPath d={makeCircle(node.x, node.y)} startFrame={startFrame + l * perLevel} drawDuration={Math.floor(perLevel * 0.5)} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.2} />
              {l > 0 && nodePositions[l - 1].map((parent, pi) => {
                const parentIdx = Math.floor(pi * row.length / nodePositions[l - 1].length);
                if (Math.abs(parentIdx - n) > Math.ceil(row.length / nodePositions[l - 1].length)) return null;
                return (
                  <SketchLine key={`edge-${l}-${n}-${pi}`} x1={parent.x} y1={parent.y + nodeR} x2={node.x} y2={node.y - nodeR} startFrame={startFrame + l * perLevel - Math.floor(perLevel * 0.2)} drawDuration={Math.floor(perLevel * 0.3)} color={COLORS.outline} strokeWidth={1.5} />
                );
              })}
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

// ─── StackedLayers ────────────────────────────────────────────────────────────
interface StackedLayersProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  layerCount?: number;
  color?: string;
}

export const StackedLayers: React.FC<StackedLayersProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, layerCount = 3, color = COLORS.blue,
}) => {
  const s = scale;
  const w = 80 * s, h = 18 * s, gap = 6 * s;
  const totalH = layerCount * h + (layerCount - 1) * gap;
  const perLayer = Math.floor(drawDuration / layerCount);
  const colors = [COLORS.blue, COLORS.green, COLORS.purple, COLORS.orange, COLORS.red];

  return (
    <g>
      {Array.from({ length: layerCount }, (_, i) => {
        const lx = cx - w / 2;
        const ly = cy + totalH / 2 - (i + 1) * (h + gap) + gap;
        const offset = i * 3 * s;
        const layerColor = colors[i % colors.length];
        const d =
          `M ${lx + 2 + offset} ${ly + 1} L ${lx + w - 1 - offset} ${ly - 1} ` +
          `L ${lx + w + 1 - offset} ${ly + h + 1} L ${lx - 1 + offset} ${ly + h - 1} Z`;

        return (
          <AnimatedPath key={i} d={d} startFrame={startFrame + (layerCount - 1 - i) * perLayer} drawDuration={perLayer} stroke={COLORS.outline} strokeWidth={2} fill={color || layerColor} fillOpacity={0.2 + i * 0.1} />
        );
      })}
    </g>
  );
};

// ─── NetworkGraph ─────────────────────────────────────────────────────────────
interface NetworkGraphProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  nodeCount?: number;
  color?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, nodeCount = 5, color = COLORS.blue,
}) => {
  const s = scale;
  const r = 35 * s;
  const nodeR = 8 * s;
  const k = nodeR * 0.56;
  const dur3 = Math.floor(drawDuration / 3);

  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i * Math.PI * 2) / nodeCount - Math.PI / 2;
    nodes.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  const makeCircle = (px: number, py: number) =>
    `M ${px} ${py - nodeR} C ${px + k} ${py - nodeR}, ${px + nodeR} ${py - k}, ${px + nodeR} ${py} C ${px + nodeR} ${py + k}, ${px + k} ${py + nodeR}, ${px} ${py + nodeR} C ${px - k} ${py + nodeR}, ${px - nodeR} ${py + k}, ${px - nodeR} ${py} C ${px - nodeR} ${py - k}, ${px - k} ${py - nodeR}, ${px} ${py - nodeR} Z`;

  const edges: string[] = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (j - i <= 2 || j - i >= nodeCount - 1) {
        edges.push(`M ${nodes[i].x} ${nodes[i].y} L ${nodes[j].x} ${nodes[j].y}`);
      }
    }
  }

  const perEdge = edges.length > 0 ? Math.floor(dur3 / edges.length) : dur3;
  const perNode = Math.floor(dur3 / nodeCount);

  return (
    <g>
      {edges.map((ed, i) => (
        <AnimatedPath key={`e${i}`} d={ed} startFrame={startFrame + i * perEdge} drawDuration={Math.max(4, perEdge)} stroke={COLORS.gray2} strokeWidth={1.5} />
      ))}
      {nodes.map((node, i) => (
        <AnimatedPath key={`n${i}`} d={makeCircle(node.x, node.y)} startFrame={startFrame + dur3 + i * perNode} drawDuration={Math.max(4, perNode)} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.3} />
      ))}
    </g>
  );
};

// ─── BlueprintIcon ────────────────────────────────────────────────────────────
interface BlueprintIconProps {
  cx: number;
  cy: number;
  scale?: number;
  startFrame: number;
  drawDuration: number;
  color?: string;
}

export const BlueprintIcon: React.FC<BlueprintIconProps> = ({
  cx, cy, scale = 1, startFrame, drawDuration, color = COLORS.blue,
}) => {
  const s = scale;
  const w = 70 * s, h = 55 * s;
  const x = cx - w / 2, y = cy - h / 2;
  const dur4 = Math.floor(drawDuration / 4);

  const bgD =
    `M ${x + 2} ${y + 1} L ${x + w - 1} ${y - 1} ` +
    `L ${x + w + 1} ${y + h + 1} L ${x - 1} ${y + h - 1} Z`;

  const gridLines: string[] = [];
  for (let i = 1; i < 4; i++) {
    gridLines.push(`M ${x} ${y + i * h / 4} L ${x + w} ${y + i * h / 4}`);
  }
  for (let i = 1; i < 5; i++) {
    gridLines.push(`M ${x + i * w / 5} ${y} L ${x + i * w / 5} ${y + h}`);
  }

  const roomD = `M ${x + w * 0.1} ${y + h * 0.25} L ${x + w * 0.55} ${y + h * 0.25} L ${x + w * 0.55} ${y + h * 0.75} L ${x + w * 0.1} ${y + h * 0.75} Z`;

  return (
    <g>
      <AnimatedPath d={bgD} startFrame={startFrame} drawDuration={dur4} stroke={COLORS.outline} strokeWidth={2.5} fill={color} fillOpacity={0.08} />
      {gridLines.map((gl, i) => (
        <AnimatedPath key={i} d={gl} startFrame={startFrame + dur4 + Math.floor(i * dur4 / gridLines.length)} drawDuration={Math.max(4, dur4 / gridLines.length)} stroke={color} strokeWidth={0.8} fillOpacity={0} />
      ))}
      <AnimatedPath d={roomD} startFrame={startFrame + dur4 * 2} drawDuration={dur4 * 2} stroke={COLORS.outline} strokeWidth={2} fill={color} fillOpacity={0.15} />
    </g>
  );
};
