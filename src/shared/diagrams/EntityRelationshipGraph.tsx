import React from 'react';
import { GraphNode, GraphEdge, GraphNodeShape } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface EREntity {
  id: string;
  label: string;
  x: number;
  y: number;
  shape?: GraphNodeShape;
  color?: string;
}

export interface ERRelationship {
  from: string;
  to: string;
  label?: string;
  color?: string;
}

export interface EntityRelationshipGraphProps {
  startFrame: number;
  entities: EREntity[];
  relationships: ERRelationship[];
  highlightPath?: string[];
  title?: string;
}

export const EntityRelationshipGraph: React.FC<EntityRelationshipGraphProps> = ({
  startFrame,
  entities,
  relationships,
  highlightPath = [],
  title,
}) => {
  const byId = new Map(entities.map((e) => [e.id, e]));
  const highlightEdgeSet = new Set<string>();
  for (let i = 0; i < highlightPath.length - 1; i++) {
    highlightEdgeSet.add(`${highlightPath[i]}->${highlightPath[i + 1]}`);
    highlightEdgeSet.add(`${highlightPath[i + 1]}->${highlightPath[i]}`);
  }
  const highlightNodeSet = new Set(highlightPath);

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={960}
          y={80}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {entities.map((e, i) => {
        const isHighlight = highlightNodeSet.has(e.id);
        const baseColor = e.color ?? COLORS.outline;
        return (
          <GraphNode
            key={`ent-${e.id}`}
            x={e.x}
            y={e.y}
            label={e.label}
            shape={e.shape ?? 'box'}
            width={220}
            height={90}
            startFrame={startFrame + 10 + i * 8}
            stroke={isHighlight ? COLORS.orange : baseColor}
            fill={isHighlight ? COLORS.orange : baseColor}
            fillOpacity={isHighlight ? 0.22 : 0.08}
            labelColor={isHighlight ? COLORS.orange : baseColor}
          />
        );
      })}
      {relationships.map((r, i) => {
        const from = byId.get(r.from);
        const to = byId.get(r.to);
        if (!from || !to) return null;
        const isHighlight = highlightEdgeSet.has(`${r.from}->${r.to}`);
        const color = r.color ?? (isHighlight ? COLORS.orange : COLORS.gray1);
        return (
          <GraphEdge
            key={`rel-${i}`}
            from={{ x: from.x, y: from.y }}
            to={{ x: to.x, y: to.y }}
            fromShape={from.shape ?? 'box'}
            toShape={to.shape ?? 'box'}
            fromSize={{ w: 220, h: 90 }}
            toSize={{ w: 220, h: 90 }}
            startFrame={startFrame + 10 + entities.length * 8 + i * 6}
            drawDuration={14}
            color={color}
            strokeWidth={isHighlight ? 3.5 : 2.5}
            label={r.label}
          />
        );
      })}
    </g>
  );
};
