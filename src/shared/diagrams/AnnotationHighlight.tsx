import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { AnimatedPath, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export type AnnotationStyle = 'highlight' | 'spotlight' | 'callout';
export type LabelPosition = 'above' | 'below' | 'left' | 'right';

export interface AnnotationHighlightProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  style?: AnnotationStyle;
  label?: string;
  labelPosition?: LabelPosition;
  color?: string;
  pulse?: boolean;
}

const MIN_TARGET_SIDE = 40;
const LABEL_FONT_SIZE = 30;
const LABEL_MARGIN = 20;
const HIGHLIGHT_PAD = 14;
const CHAR_W_FACTOR = 0.55;

interface AnnotationHighlightGeometry {
  outer: Box;               // union of target rect + highlight extension + label bbox
  targetRect: Box;          // {x, y, w, h} as-supplied
  style: AnnotationStyle;
  highlightRect: Box;       // target ± padding (for style=highlight) or spotlight circle bbox
  spotlightInnerR?: number;
  labelPosition: LabelPosition;
  label?: string;
  labelBbox?: Box;
  error?: string;
}

function computeAnnotationHighlightGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  style?: AnnotationStyle;
  label?: string;
  labelPosition?: LabelPosition;
}): AnnotationHighlightGeometry {
  const targetRect: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const style = props.style ?? 'highlight';
  const labelPosition = props.labelPosition ?? 'above';

  if (props.w < MIN_TARGET_SIDE || props.h < MIN_TARGET_SIDE) {
    return {
      outer: targetRect,
      targetRect,
      style,
      highlightRect: targetRect,
      labelPosition,
      label: props.label,
      error: `AnnotationHighlight target rect must be at least ${MIN_TARGET_SIDE}×${MIN_TARGET_SIDE}; got ${Math.floor(props.w)}×${Math.floor(props.h)}`,
    };
  }

  const tcx = (targetRect.x1 + targetRect.x2) / 2;
  const tcy = (targetRect.y1 + targetRect.y2) / 2;
  const maxDim = Math.max(props.w, props.h);

  let highlightRect: Box = targetRect;
  let spotlightInnerR: number | undefined;
  if (style === 'highlight') {
    highlightRect = {
      x1: targetRect.x1 - HIGHLIGHT_PAD,
      y1: targetRect.y1 - HIGHLIGHT_PAD,
      x2: targetRect.x2 + HIGHLIGHT_PAD,
      y2: targetRect.y2 + HIGHLIGHT_PAD,
    };
  } else if (style === 'spotlight') {
    spotlightInnerR = maxDim * 0.6;
    highlightRect = {
      x1: tcx - spotlightInnerR,
      y1: tcy - spotlightInnerR,
      x2: tcx + spotlightInnerR,
      y2: tcy + spotlightInnerR,
    };
  }

  let labelBbox: Box | undefined;
  if (props.label) {
    const textW = props.label.length * CHAR_W_FACTOR * LABEL_FONT_SIZE;
    const textH = LABEL_FONT_SIZE * 1.2;
    switch (labelPosition) {
      case 'above':
        labelBbox = {
          x1: tcx - textW / 2,
          y1: highlightRect.y1 - LABEL_MARGIN - textH,
          x2: tcx + textW / 2,
          y2: highlightRect.y1 - LABEL_MARGIN,
        };
        break;
      case 'below':
        labelBbox = {
          x1: tcx - textW / 2,
          y1: highlightRect.y2 + LABEL_MARGIN,
          x2: tcx + textW / 2,
          y2: highlightRect.y2 + LABEL_MARGIN + textH,
        };
        break;
      case 'left':
        labelBbox = {
          x1: highlightRect.x1 - LABEL_MARGIN - textW,
          y1: tcy - textH / 2,
          x2: highlightRect.x1 - LABEL_MARGIN,
          y2: tcy + textH / 2,
        };
        break;
      case 'right':
        labelBbox = {
          x1: highlightRect.x2 + LABEL_MARGIN,
          y1: tcy - textH / 2,
          x2: highlightRect.x2 + LABEL_MARGIN + textW,
          y2: tcy + textH / 2,
        };
        break;
    }
  }

  const union: Box = {
    x1: Math.min(highlightRect.x1, labelBbox?.x1 ?? Infinity, targetRect.x1),
    y1: Math.min(highlightRect.y1, labelBbox?.y1 ?? Infinity, targetRect.y1),
    x2: Math.max(highlightRect.x2, labelBbox?.x2 ?? -Infinity, targetRect.x2),
    y2: Math.max(highlightRect.y2, labelBbox?.y2 ?? -Infinity, targetRect.y2),
  };

  return {
    outer: union,
    targetRect,
    style,
    highlightRect,
    spotlightInnerR,
    labelPosition,
    label: props.label,
    labelBbox,
  };
}

export function layoutAnnotationHighlight(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  style?: AnnotationStyle;
  label?: string;
  labelPosition?: LabelPosition;
}): CompositeLayoutResult {
  const g = computeAnnotationHighlightGeometry(props);
  if (g.error) {
    return {
      outer: { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h },
      children: [],
      error: g.error,
    };
  }
  const children: CompositeChild[] = [
    { kind: 'node', bbox: g.highlightRect, label: 'annotation' },
  ];
  if (g.labelBbox && g.label) {
    children.push({ kind: 'text', bbox: g.labelBbox, label: g.label });
  }
  return { outer: g.outer, children };
}

export const AnnotationHighlight: React.FC<AnnotationHighlightProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 18,
    style = 'highlight',
    label,
    labelPosition = 'above',
    color = COLORS.orange,
    pulse = false,
  } = props;

  const g = computeAnnotationHighlightGeometry({ x, y, w, h, style, label, labelPosition });
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const pulseScale = pulse ? 1 + 0.04 * Math.sin((elapsed / 15) * Math.PI) : 1;
  const pulseOpacity = pulse ? 0.7 + 0.3 * Math.sin((elapsed / 15) * Math.PI) : 1;

  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="AnnotationHighlight error"
          x={x + w / 2}
          y={y + h / 2}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={20}
          fill={COLORS.red}
          textAnchor="middle"
        />
      </g>
    );
  }

  const tcx = (g.targetRect.x1 + g.targetRect.x2) / 2;
  const tcy = (g.targetRect.y1 + g.targetRect.y2) / 2;
  const labelBbox = g.labelBbox;

  const labelEl = label && labelBbox ? (
    <HandWrittenText
      text={label}
      x={(labelBbox.x1 + labelBbox.x2) / 2}
      y={labelBbox.y2 - LABEL_FONT_SIZE * 0.2}
      startFrame={startFrame + (style === 'highlight' ? drawDuration - 4 : 5)}
      durationFrames={18}
      fontSize={LABEL_FONT_SIZE}
      fill={color}
      textAnchor="middle"
    />
  ) : null;

  if (style === 'spotlight') {
    const innerR = g.spotlightInnerR!;
    const fadeInOpacity = interpolate(elapsed, [0, drawDuration], [0, 0.55], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <g>
        <defs>
          <mask id={`spotlight-mask-${startFrame}`}>
            <rect width={1920} height={1080} fill="white" />
            <circle cx={tcx} cy={tcy} r={innerR} fill="black" />
          </mask>
        </defs>
        <rect
          width={1920}
          height={1080}
          fill={COLORS.outline}
          opacity={fadeInOpacity}
          mask={`url(#spotlight-mask-${startFrame})`}
        />
        <circle
          cx={tcx}
          cy={tcy}
          r={innerR * pulseScale}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={fadeInOpacity * pulseOpacity + 0.2}
        />
        {labelEl}
      </g>
    );
  }

  if (style === 'callout') {
    const pointerStart = labelBbox
      ? {
          x: (labelBbox.x1 + labelBbox.x2) / 2,
          y: (labelBbox.y1 + labelBbox.y2) / 2,
        }
      : { x: tcx, y: tcy };
    const pointerEnd = { x: tcx, y: g.targetRect.y1 };
    return (
      <g>
        <AnimatedPath
          d={`M ${pointerStart.x} ${pointerStart.y} Q ${(pointerStart.x + pointerEnd.x) / 2} ${(pointerStart.y + pointerEnd.y) / 2 - 30} ${pointerEnd.x} ${pointerEnd.y}`}
          startFrame={startFrame}
          drawDuration={drawDuration}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
        />
        {labelEl}
      </g>
    );
  }

  // highlight style — rounded box around target with padding.
  const rx = 10;
  const { highlightRect } = g;
  const hx = highlightRect.x1;
  const hy = highlightRect.y1;
  const hw = highlightRect.x2 - highlightRect.x1;
  const hh = highlightRect.y2 - highlightRect.y1;
  const d = `M ${hx + rx} ${hy} L ${hx + hw - rx} ${hy} Q ${hx + hw} ${hy} ${hx + hw} ${hy + rx} L ${hx + hw} ${hy + hh - rx} Q ${hx + hw} ${hy + hh} ${hx + hw - rx} ${hy + hh} L ${hx + rx} ${hy + hh} Q ${hx} ${hy + hh} ${hx} ${hy + hh - rx} L ${hx} ${hy + rx} Q ${hx} ${hy} ${hx + rx} ${hy} Z`;
  return (
    <g opacity={pulseOpacity}>
      <AnimatedPath
        d={d}
        startFrame={startFrame}
        drawDuration={drawDuration}
        stroke={color}
        strokeWidth={3.5}
        fill={color}
        fillOpacity={0.12}
      />
      {labelEl}
    </g>
  );
};
