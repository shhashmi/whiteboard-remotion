import React from 'react';
import { GraphNode, GraphEdge, GraphNodeShape, fitFontSizeToNode, FIT_FONT_NOT_POSSIBLE } from './GraphNodeEdge';
import { HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

/**
 * Entity — id + label + optional cosmetic hints. Positions are computed by
 * EntityRelationshipGraph (circular layout inscribed in the rect), not passed
 * by the caller.
 */
export interface EREntity {
  id: string;
  label: string;
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
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  entities: EREntity[];
  relationships: ERRelationship[];
  highlightPath?: string[];
  title?: string;
}

const TITLE_H = 72;
const MIN_NODE_W = 140;
const MIN_NODE_H = 64;
const DEFAULT_NODE_W = 220;
const DEFAULT_NODE_H = 90;
const MIN_FONT_SIZE = 18;
const DEFAULT_FONT_SIZE = 30;
const CHORD_PAD = 16;  // extra room so adjacent nodes don't touch on the circle

interface ERNodeSpec {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  shape: GraphNodeShape;
  fontSize: number;
  color?: string;
  highlighted: boolean;
}

interface ERGeometry {
  outer: Box;
  nodes: ERNodeSpec[];
  radius: number;
  center: { x: number; y: number };
  title?: string;
  titleBbox?: Box;
  highlightNodes: Set<string>;
  highlightEdges: Set<string>;
  error?: string;
}

function nodeBox(n: ERNodeSpec): Box {
  return { x1: n.cx - n.w / 2, y1: n.cy - n.h / 2, x2: n.cx + n.w / 2, y2: n.cy + n.h / 2 };
}

function computeERGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  entities: EREntity[];
  relationships: ERRelationship[];
  highlightPath?: string[];
  title?: string;
}): ERGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const highlightNodes = new Set(props.highlightPath ?? []);
  const highlightEdges = new Set<string>();
  const path = props.highlightPath ?? [];
  for (let i = 0; i < path.length - 1; i++) {
    highlightEdges.add(`${path[i]}->${path[i + 1]}`);
    highlightEdges.add(`${path[i + 1]}->${path[i]}`);
  }

  const n = props.entities.length;
  if (n === 0) {
    return {
      outer,
      nodes: [],
      radius: 0,
      center: { x: 0, y: 0 },
      highlightNodes,
      highlightEdges,
      error: 'EntityRelationshipGraph requires at least one entity',
    };
  }

  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentY2 = outer.y2;
  const contentW = outer.x2 - outer.x1;
  const contentH = contentY2 - contentY1;
  const center = { x: (outer.x1 + outer.x2) / 2, y: (contentY1 + contentY2) / 2 };

  // Pick node size first (shrink if needed).
  let nodeW = DEFAULT_NODE_W;
  let nodeH = DEFAULT_NODE_H;

  // Inscribed circle radius constrained by rect half-width/height minus node size.
  // Circle center at `center`. Each node centered at radius r; to stay in the rect,
  // r + nodeW/2 ≤ contentW/2 and r + nodeH/2 ≤ contentH/2.
  let rMax = Math.min((contentW - nodeW) / 2, (contentH - nodeH) / 2);

  // Chord constraint: 2r * sin(π/n) ≥ nodeW + CHORD_PAD (so adjacent nodes don't touch).
  const chordMin = n > 1 ? (nodeW + CHORD_PAD) / (2 * Math.sin(Math.PI / n)) : 0;

  if (rMax < chordMin || rMax < 40) {
    // Shrink nodes proportionally and try again.
    const scale = Math.min(1, rMax / Math.max(40, chordMin));
    nodeW = Math.max(MIN_NODE_W, Math.floor(DEFAULT_NODE_W * scale));
    nodeH = Math.max(MIN_NODE_H, Math.floor(DEFAULT_NODE_H * scale));
    rMax = Math.min((contentW - nodeW) / 2, (contentH - nodeH) / 2);
  }

  const chordReq = n > 1 ? (nodeW + CHORD_PAD) / (2 * Math.sin(Math.PI / n)) : 0;

  if (nodeW < MIN_NODE_W || nodeH < MIN_NODE_H || rMax < chordReq - 0.5 || rMax < 40) {
    // Compute a helpful minimum rect for n entities with default node size.
    const needR = Math.max(40, chordMin);
    const needSide = Math.ceil(2 * needR + DEFAULT_NODE_W) + 2;
    return {
      outer,
      nodes: [],
      radius: 0,
      center,
      highlightNodes,
      highlightEdges,
      error: `EntityRelationshipGraph with ${n} entities requires rect ≥ ${needSide}×${needSide + (hasTitle ? TITLE_H : 0)}; got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  const radius = rMax;

  // Fit smallest font so every label renders at ≥ MIN_FONT_SIZE in its node.
  let fontSize = DEFAULT_FONT_SIZE;
  for (const e of props.entities) {
    const fs = fitFontSizeToNode(e.label, nodeW, nodeH, {
      defaultFontSize: DEFAULT_FONT_SIZE,
      minFontSize: MIN_FONT_SIZE,
    });
    if (fs === FIT_FONT_NOT_POSSIBLE) {
      return {
        outer,
        nodes: [],
        radius: 0,
        center,
        highlightNodes,
        highlightEdges,
        error: `EntityRelationshipGraph entity "${e.label}" does not fit in ${Math.floor(nodeW)}×${Math.floor(nodeH)} at fontSize ≥ ${MIN_FONT_SIZE}`,
      };
    }
    if (fs < fontSize) fontSize = fs;
  }

  const nodes: ERNodeSpec[] = props.entities.map((e, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      id: e.id,
      cx: center.x + radius * Math.cos(angle),
      cy: center.y + radius * Math.sin(angle),
      w: nodeW,
      h: nodeH,
      label: e.label,
      shape: e.shape ?? 'box',
      fontSize,
      color: e.color,
      highlighted: highlightNodes.has(e.id),
    };
  });

  return {
    outer,
    nodes,
    radius,
    center,
    title: props.title,
    titleBbox,
    highlightNodes,
    highlightEdges,
  };
}

export function layoutEntityRelationshipGraph(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  entities: EREntity[];
  relationships: ERRelationship[];
  highlightPath?: string[];
  title?: string;
}): CompositeLayoutResult {
  const g = computeERGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const n of g.nodes) children.push({ kind: 'node', bbox: nodeBox(n), label: n.label });
  return { outer: g.outer, children };
}

export const EntityRelationshipGraph: React.FC<EntityRelationshipGraphProps> = (props) => {
  const { x, y, w, h, startFrame, entities, relationships, highlightPath = [], title } = props;

  const g = computeERGeometry({ x, y, w, h, entities, relationships, highlightPath, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="EntityRelationshipGraph layout error"
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
      {g.nodes.map((n, i) => {
        const baseColor = n.color ?? COLORS.outline;
        return (
          <GraphNode
            key={`ent-${n.id}`}
            x={n.cx}
            y={n.cy}
            label={n.label}
            shape={n.shape}
            width={n.w}
            height={n.h}
            startFrame={startFrame + 10 + i * 8}
            stroke={n.highlighted ? COLORS.orange : baseColor}
            fill={n.highlighted ? COLORS.orange : baseColor}
            fillOpacity={n.highlighted ? 0.22 : 0.08}
            fontSize={n.fontSize}
            labelColor={n.highlighted ? COLORS.orange : baseColor}
          />
        );
      })}
      {relationships.map((r, i) => {
        const from = byId.get(r.from);
        const to = byId.get(r.to);
        if (!from || !to) return null;
        const isHighlight = g.highlightEdges.has(`${r.from}->${r.to}`);
        const color = r.color ?? (isHighlight ? COLORS.orange : COLORS.gray1);
        return (
          <GraphEdge
            key={`rel-${i}`}
            from={{ x: from.cx, y: from.cy }}
            to={{ x: to.cx, y: to.cy }}
            fromShape={from.shape}
            toShape={to.shape}
            fromSize={{ w: from.w, h: from.h }}
            toSize={{ w: to.w, h: to.h }}
            startFrame={startFrame + 10 + g.nodes.length * 8 + i * 6}
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
