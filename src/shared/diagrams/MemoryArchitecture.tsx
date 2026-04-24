import React from 'react';
import { SketchBox, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface MemoryLayer {
  label: string;
  sublabel?: string;
  color?: string;
}

export interface MemoryArchitectureProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  layers?: MemoryLayer[];
  highlightLayer?: number;
  title?: string;
}

const DEFAULT_LAYERS: MemoryLayer[] = [
  { label: 'Short-term Context', sublabel: 'Current conversation window', color: COLORS.orange },
  { label: 'Episodic', sublabel: 'Past interactions & events', color: COLORS.blue },
  { label: 'Semantic', sublabel: 'Facts & learned knowledge', color: COLORS.green },
  { label: 'Procedural', sublabel: 'Learned skills & routines', color: COLORS.purple },
];

const TITLE_H = 72;
const MIN_LAYER_H = 88;
const MIN_LAYER_GAP = 8;
const MAX_LAYER_GAP = 24; // upper cap used by gap formula below
const LAYER_PAD_LEFT = 40;
const LABEL_FONT = 40;
const SUBLABEL_FONT = 28;
const CHAR_WIDTH_FACTOR = 0.55;

interface LayerSpec {
  bbox: Box;
  layer: MemoryLayer;
  isHighlight: boolean;
}

interface MemoryArchitectureGeometry {
  outer: Box;
  layers: LayerSpec[];
  title?: string;
  titleBbox?: Box;
  error?: string;
}

function computeMemoryArchitectureGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  layers?: MemoryLayer[];
  highlightLayer?: number;
  title?: string;
}): MemoryArchitectureGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const layers = props.layers ?? DEFAULT_LAYERS;
  const hasTitle = !!props.title;
  const n = layers.length;

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  // Minimum width: widest label must fit in (w - 2*LAYER_PAD_LEFT) at LABEL_FONT.
  let longestLabelW = 0;
  for (const l of layers) {
    const labelW = l.label.length * LABEL_FONT * CHAR_WIDTH_FACTOR;
    const subW = (l.sublabel ?? '').length * SUBLABEL_FONT * CHAR_WIDTH_FACTOR;
    longestLabelW = Math.max(longestLabelW, labelW, subW);
  }
  const needW = Math.ceil(longestLabelW + 2 * LAYER_PAD_LEFT);
  if (props.w < needW) {
    return {
      outer,
      layers: [],
      error: `MemoryArchitecture requires rect width ≥ ${needW}px for longest label; got ${Math.floor(props.w)}px`,
    };
  }

  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentH = outer.y2 - contentY1;
  // Fill rect: layerHeight * n + gap * (n-1) = contentH. Gap scales with contentH.
  const gap = Math.max(MIN_LAYER_GAP, Math.min(MAX_LAYER_GAP, Math.floor(contentH * 0.03)));
  const layerH = (contentH - gap * (n - 1)) / n;
  if (layerH < MIN_LAYER_H) {
    // Report the worst-case minimum using MAX_LAYER_GAP. At that reported height
    // the actual runtime gap is ≤ MAX_LAYER_GAP, so the constraint holds with
    // slack. Using MIN_LAYER_GAP here would under-report and leave callers who
    // bump to the reported value still failing at runtime.
    const needH = Math.ceil(n * MIN_LAYER_H + (n - 1) * MAX_LAYER_GAP + (hasTitle ? TITLE_H : 0));
    return {
      outer,
      layers: [],
      error: `MemoryArchitecture with ${n} layers requires rect height ≥ ${needH}px (min layer ${MIN_LAYER_H}px); got ${Math.floor(props.h)}px`,
    };
  }

  const specs: LayerSpec[] = layers.map((layer, i) => {
    const y1 = contentY1 + i * (layerH + gap);
    return {
      bbox: { x1: outer.x1, y1, x2: outer.x2, y2: y1 + layerH },
      layer,
      isHighlight: props.highlightLayer === i,
    };
  });

  return { outer, layers: specs, title: props.title, titleBbox };
}

export function layoutMemoryArchitecture(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  layers?: MemoryLayer[];
  highlightLayer?: number;
  title?: string;
}): CompositeLayoutResult {
  const g = computeMemoryArchitectureGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const l of g.layers) {
    children.push({ kind: 'node', bbox: l.bbox, label: l.layer.label });
  }
  return { outer: g.outer, children };
}

export const MemoryArchitecture: React.FC<MemoryArchitectureProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 22,
    layers = DEFAULT_LAYERS,
    highlightLayer,
    title,
  } = props;

  const g = computeMemoryArchitectureGeometry({ x, y, w, h, layers, highlightLayer, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="MemoryArchitecture layout error"
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
      {g.layers.map((spec, i) => {
        const accent = spec.layer.color ?? COLORS.outline;
        const appear = startFrame + i * 12;
        const layerW = spec.bbox.x2 - spec.bbox.x1;
        const layerH = spec.bbox.y2 - spec.bbox.y1;
        return (
          <g key={`layer-${i}`}>
            <SketchBox
              x={spec.bbox.x1}
              y={spec.bbox.y1}
              width={layerW}
              height={layerH}
              startFrame={appear}
              drawDuration={drawDuration}
              stroke={spec.isHighlight ? accent : COLORS.outline}
              strokeWidth={spec.isHighlight ? 4 : 2.5}
              fill={accent}
              fillOpacity={spec.isHighlight ? 0.2 : 0.08}
              rx={14}
            />
            <HandWrittenText
              text={spec.layer.label}
              x={spec.bbox.x1 + LAYER_PAD_LEFT}
              y={spec.bbox.y1 + (spec.layer.sublabel ? layerH * 0.3 : layerH * 0.4)}
              startFrame={appear + 6}
              durationFrames={16}
              fontSize={LABEL_FONT}
              fill={accent}
              fontWeight={700}
              textAnchor="start"
              baseline="hanging"
            />
            {spec.layer.sublabel && (
              <HandWrittenText
                text={spec.layer.sublabel}
                x={spec.bbox.x1 + LAYER_PAD_LEFT}
                y={spec.bbox.y1 + layerH * 0.65}
                startFrame={appear + 12}
                durationFrames={16}
                fontSize={SUBLABEL_FONT}
                fill={COLORS.gray1}
                textAnchor="start"
                baseline="hanging"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
