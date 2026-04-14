import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { AnimatedPath, HandWrittenText } from '../components';
import { COLORS } from '../theme';

export type AnnotationStyle = 'highlight' | 'spotlight' | 'callout';

export interface AnnotationHighlightProps {
  startFrame: number;
  drawDuration?: number;
  style?: AnnotationStyle;
  target: { x: number; y: number; width?: number; height?: number };
  label?: string;
  labelPosition?: 'above' | 'below' | 'left' | 'right';
  color?: string;
  pulse?: boolean;
}

export const AnnotationHighlight: React.FC<AnnotationHighlightProps> = ({
  startFrame,
  drawDuration = 18,
  style = 'highlight',
  target,
  label,
  labelPosition = 'above',
  color = COLORS.orange,
  pulse = false,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const tw = target.width ?? 220;
  const th = target.height ?? 80;
  const tx = target.x;
  const ty = target.y;

  const pulseScale = pulse
    ? 1 + 0.04 * Math.sin((elapsed / 15) * Math.PI)
    : 1;
  const pulseOpacity = pulse
    ? 0.7 + 0.3 * Math.sin((elapsed / 15) * Math.PI)
    : 1;

  const labelPos = (() => {
    switch (labelPosition) {
      case 'above':
        return { x: tx, y: ty - th / 2 - 40, anchor: 'middle' as const };
      case 'below':
        return { x: tx, y: ty + th / 2 + 60, anchor: 'middle' as const };
      case 'left':
        return { x: tx - tw / 2 - 20, y: ty + 10, anchor: 'end' as const };
      case 'right':
        return { x: tx + tw / 2 + 20, y: ty + 10, anchor: 'start' as const };
    }
  })();

  if (style === 'spotlight') {
    const outerR = Math.max(tw, th) * 1.6;
    const innerR = Math.max(tw, th) * 0.6;
    const fadeInOpacity = interpolate(elapsed, [0, drawDuration], [0, 0.55], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <g>
        <defs>
          <mask id={`spotlight-mask-${startFrame}`}>
            <rect width={1920} height={1080} fill="white" />
            <circle cx={tx} cy={ty} r={innerR} fill="black" />
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
          cx={tx}
          cy={ty}
          r={innerR * pulseScale}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={fadeInOpacity * pulseOpacity + 0.2}
        />
        {label && (
          <HandWrittenText
            text={label}
            x={labelPos.x}
            y={labelPos.y}
            startFrame={startFrame + drawDuration}
            durationFrames={18}
            fontSize={32}
            fill={color}
            textAnchor={labelPos.anchor}
          />
        )}
        {/* unused outerR for spec symmetry */}
        <g data-outer={outerR} />
      </g>
    );
  }

  if (style === 'callout') {
    const pointerStartX = labelPos.x + (labelPosition === 'left' ? 20 : labelPosition === 'right' ? -20 : 0);
    const pointerStartY = labelPos.y + (labelPosition === 'above' ? 20 : labelPosition === 'below' ? -20 : 0);
    return (
      <g>
        <AnimatedPath
          d={`M ${pointerStartX} ${pointerStartY} Q ${(pointerStartX + tx) / 2} ${(pointerStartY + ty) / 2 - 30} ${tx} ${ty - th / 2}`}
          startFrame={startFrame}
          drawDuration={drawDuration}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
        />
        {label && (
          <HandWrittenText
            text={label}
            x={labelPos.x}
            y={labelPos.y}
            startFrame={startFrame + 5}
            durationFrames={18}
            fontSize={30}
            fill={color}
            textAnchor={labelPos.anchor}
          />
        )}
      </g>
    );
  }

  const pad = 14;
  const rx = 10;
  const bx = tx - tw / 2 - pad;
  const by = ty - th / 2 - pad;
  const bw = tw + pad * 2;
  const bh = th + pad * 2;
  const d = `M ${bx + rx} ${by} L ${bx + bw - rx} ${by} Q ${bx + bw} ${by} ${bx + bw} ${by + rx} L ${bx + bw} ${by + bh - rx} Q ${bx + bw} ${by + bh} ${bx + bw - rx} ${by + bh} L ${bx + rx} ${by + bh} Q ${bx} ${by + bh} ${bx} ${by + bh - rx} L ${bx} ${by + rx} Q ${bx} ${by} ${bx + rx} ${by} Z`;
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
      {label && (
        <HandWrittenText
          text={label}
          x={labelPos.x}
          y={labelPos.y}
          startFrame={startFrame + drawDuration - 4}
          durationFrames={18}
          fontSize={30}
          fill={color}
          textAnchor={labelPos.anchor}
        />
      )}
    </g>
  );
};
