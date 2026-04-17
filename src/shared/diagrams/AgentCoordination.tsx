import React from 'react';
import { GraphNode, GraphEdge } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';

export type CoordinationPattern = 'supervisor' | 'hierarchical' | 'peer';

export interface AgentCoordinationProps {
  startFrame: number;
  drawDuration?: number;
  pattern?: CoordinationPattern;
  agents?: string[];
  supervisor?: string;
  cx?: number;
  cy?: number;
  radius?: number;
  /**
   * Hard cap on the diagram's horizontal extent (px). When set, the hierarchical
   * pattern clamps its leaf span to maxWidth and shrinks node width proportionally
   * so leaves stay inside. Use this to fit several diagrams side-by-side without
   * overlap. If unset, hierarchical layout grows with `agents.length`.
   */
  maxWidth?: number;
  title?: string;
}

const NODE = { w: 220, h: 96 };
const MIN_NODE_W = 120;

export const AgentCoordination: React.FC<AgentCoordinationProps> = ({
  startFrame,
  drawDuration = 20,
  pattern = 'supervisor',
  agents = ['Agent A', 'Agent B', 'Agent C', 'Agent D'],
  supervisor = 'Supervisor',
  cx = 960,
  cy = 560,
  radius = 300,
  maxWidth,
  title,
}) => {
  const titleEl = title ? (
    <HandWrittenText
      text={title}
      x={cx}
      y={cy - radius - 140}
      startFrame={startFrame}
      durationFrames={18}
      fontSize={40}
      fill={COLORS.outline}
      textAnchor="middle"
    />
  ) : null;

  if (pattern === 'supervisor') {
    const positions = agents.map((_, i) => {
      const angle = (i * 2 * Math.PI) / agents.length - Math.PI / 2;
      return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
    return (
      <g>
        {titleEl}
        <GraphNode
          x={cx}
          y={cy}
          label={supervisor}
          startFrame={startFrame}
          drawDuration={drawDuration}
          width={NODE.w}
          height={NODE.h}
          fill={COLORS.orange}
          fillOpacity={0.15}
          stroke={COLORS.orange}
        />
        {positions.map((p, i) => (
          <React.Fragment key={`sp-${i}`}>
            <GraphNode
              x={p.x}
              y={p.y}
              label={agents[i]}
              startFrame={startFrame + (i + 1) * 10}
              drawDuration={drawDuration}
              width={NODE.w}
              height={NODE.h}
            />
            <GraphEdge
              from={{ x: cx, y: cy }}
              to={p}
              startFrame={startFrame + (i + 1) * 10 + drawDuration}
              fromSize={NODE}
              toSize={NODE}
              drawDuration={14}
              color={COLORS.orange}
            />
          </React.Fragment>
        ))}
      </g>
    );
  }

  if (pattern === 'hierarchical') {
    const rows = 3;
    const rowY = (r: number) => cy - radius + (r * (2 * radius)) / (rows - 1);
    const desiredLeafSpan = Math.max(2 * radius, agents.length * (NODE.w + 40));
    // If maxWidth is set, scale leaf span and node width together so the whole
    // diagram (leftmost leaf left-edge to rightmost leaf right-edge) fits within maxWidth.
    const desiredFullExtent = desiredLeafSpan + NODE.w;
    const scale = maxWidth && desiredFullExtent > maxWidth ? maxWidth / desiredFullExtent : 1;
    const leafSpan = desiredLeafSpan * scale;
    const nodeW = Math.max(MIN_NODE_W, NODE.w * scale);
    const node = { w: nodeW, h: NODE.h };
    const leafGap = agents.length > 1 ? leafSpan / (agents.length - 1) : 0;
    const leafX = (i: number) => cx - leafSpan / 2 + i * leafGap;
    const root = { x: cx, y: rowY(0) };
    const leafPerMid = Math.ceil(agents.length / 2);
    const mid = [0, 1].map((i) => {
      const members = agents
        .map((_, idx) => idx)
        .filter((idx) => Math.floor(idx / leafPerMid) === i);
      const midX = members.length
        ? members.reduce((sum, idx) => sum + leafX(idx), 0) / members.length
        : cx + (i - 0.5) * radius;
      return { x: midX, y: rowY(1) };
    });
    const leaves = agents.map((_, i) => ({ x: leafX(i), y: rowY(2) }));
    return (
      <g>
        {titleEl}
        <GraphNode
          x={root.x}
          y={root.y}
          label={supervisor}
          startFrame={startFrame}
          drawDuration={drawDuration}
          width={node.w}
          height={node.h}
          fill={COLORS.orange}
          fillOpacity={0.15}
          stroke={COLORS.orange}
        />
        {mid.map((m, i) => (
          <React.Fragment key={`mid-${i}`}>
            <GraphNode
              x={m.x}
              y={m.y}
              label={`Lead ${i + 1}`}
              startFrame={startFrame + 10 + i * 8}
              drawDuration={drawDuration}
              width={node.w}
              height={node.h}
              fill={COLORS.blue}
              fillOpacity={0.12}
              stroke={COLORS.blue}
            />
            <GraphEdge
              from={root}
              to={m}
              fromSize={node}
              toSize={node}
              startFrame={startFrame + 10 + i * 8 + drawDuration}
              drawDuration={14}
              color={COLORS.orange}
            />
          </React.Fragment>
        ))}
        {leaves.map((leaf, i) => {
          const parent = mid[Math.floor(i / leafPerMid)];
          return (
            <React.Fragment key={`leaf-${i}`}>
              <GraphNode
                x={leaf.x}
                y={leaf.y}
                label={agents[i]}
                startFrame={startFrame + 40 + i * 8}
                drawDuration={drawDuration}
                width={node.w}
                height={node.h}
              />
              <GraphEdge
                from={parent}
                to={leaf}
                fromSize={node}
                toSize={node}
                startFrame={startFrame + 40 + i * 8 + drawDuration}
                drawDuration={14}
                color={COLORS.orange}
              />
            </React.Fragment>
          );
        })}
      </g>
    );
  }

  const positions = agents.map((_, i) => {
    const angle = (i * 2 * Math.PI) / agents.length - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  return (
    <g>
      {titleEl}
      {positions.map((p, i) => (
        <GraphNode
          key={`peer-${i}`}
          x={p.x}
          y={p.y}
          label={agents[i]}
          startFrame={startFrame + i * 8}
          drawDuration={drawDuration}
          width={NODE.w}
          height={NODE.h}
        />
      ))}
      {positions.map((p, i) =>
        positions.slice(i + 1).map((q, j) => (
          <GraphEdge
            key={`peer-e-${i}-${j}`}
            from={p}
            to={q}
            fromSize={NODE}
            toSize={NODE}
            directed={false}
            startFrame={startFrame + drawDuration + 10 + (i * agents.length + j) * 5}
            drawDuration={14}
            color={COLORS.purple}
          />
        )),
      )}
    </g>
  );
};
