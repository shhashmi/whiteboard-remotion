import React from 'react';
import { SketchBox, SketchArrow, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import { fitFontSizeToNode, FIT_FONT_NOT_POSSIBLE } from './GraphNodeEdge';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface MaturityStage {
  label: string;
  adoptionPct?: number;
  description?: string;
}

export interface MaturityProgressionProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  drawDuration?: number;
  stages?: MaturityStage[];
  currentStage?: number;
  title?: string;
}

const DEFAULT_STAGES: MaturityStage[] = [
  { label: 'Experimentation' },
  { label: 'Operationalization' },
  { label: 'Scaling' },
  { label: 'Embedded' },
];

const TITLE_H = 72;
const MIN_BOX_W = 140;
const MIN_BOX_H = 88;
const MIN_GAP = 20;
const DEFAULT_BOX_H = 160;
const DEFAULT_GAP = 40;
const DESC_BAND_H = 84;
const DEFAULT_LABEL_FONT = 34;
const MIN_LABEL_FONT = 18;
const CHAR_WIDTH_FACTOR = 0.55;

interface StageSpec {
  bbox: Box;
  descBbox?: Box;
  stage: MaturityStage;
  labelFont: number;
  isCurrent: boolean;
}

interface MaturityProgressionGeometry {
  outer: Box;
  stages: StageSpec[];
  title?: string;
  titleBbox?: Box;
  hasDesc: boolean;
  error?: string;
}

function computeMaturityProgressionGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  stages?: MaturityStage[];
  currentStage?: number;
  title?: string;
}): MaturityProgressionGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const stages = props.stages ?? DEFAULT_STAGES;
  const hasTitle = !!props.title;
  const hasDesc = stages.some((s) => !!s.description);
  const n = stages.length;

  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentH = outer.y2 - contentY1;
  const reservedDesc = hasDesc ? DESC_BAND_H : 0;

  // Horizontal: n boxes + (n-1) gaps fit in w.
  const gap = Math.min(DEFAULT_GAP, Math.max(MIN_GAP, Math.floor(props.w * 0.02)));
  const boxW = (props.w - (n - 1) * gap) / n;

  if (boxW < MIN_BOX_W) {
    const needW = Math.ceil(n * MIN_BOX_W + (n - 1) * MIN_GAP);
    return {
      outer,
      stages: [],
      hasDesc,
      error: `MaturityProgression with ${n} stages requires rect width ≥ ${needW}px (min box ${MIN_BOX_W}px + ${MIN_GAP}px gaps); got ${Math.floor(props.w)}px`,
    };
  }

  const boxH = Math.min(DEFAULT_BOX_H, Math.max(MIN_BOX_H, contentH - reservedDesc));
  if (boxH < MIN_BOX_H) {
    const needH = Math.ceil(MIN_BOX_H + reservedDesc + (hasTitle ? TITLE_H : 0));
    return {
      outer,
      stages: [],
      hasDesc,
      error: `MaturityProgression requires rect height ≥ ${needH}px (min box ${MIN_BOX_H}px${hasDesc ? ` + ${DESC_BAND_H}px description band` : ''}${hasTitle ? ` + ${TITLE_H}px title` : ''}); got ${Math.floor(props.h)}px`,
    };
  }

  // Center the progression row vertically in the content area minus the desc band.
  const rowY = contentY1 + Math.max(0, Math.floor((contentH - reservedDesc - boxH) / 2));

  // Fit label font to the smallest-enough box.
  let labelFont = DEFAULT_LABEL_FONT;
  for (const stage of stages) {
    const fs = fitFontSizeToNode(stage.label, boxW, boxH, {
      defaultFontSize: DEFAULT_LABEL_FONT,
      minFontSize: MIN_LABEL_FONT,
    });
    if (fs === FIT_FONT_NOT_POSSIBLE) {
      return {
        outer,
        stages: [],
        hasDesc,
        error: `MaturityProgression label "${stage.label}" does not fit ${Math.floor(boxW)}×${Math.floor(boxH)} at fontSize ≥ ${MIN_LABEL_FONT}`,
      };
    }
    if (fs < labelFont) labelFont = fs;
  }

  const specs: StageSpec[] = stages.map((stage, i) => {
    const bx = outer.x1 + i * (boxW + gap);
    const bbox: Box = { x1: bx, y1: rowY, x2: bx + boxW, y2: rowY + boxH };
    const descBbox: Box | undefined = stage.description
      ? {
          x1: bx,
          y1: rowY + boxH,
          x2: bx + boxW,
          y2: Math.min(outer.y2, rowY + boxH + DESC_BAND_H),
        }
      : undefined;
    return {
      bbox,
      descBbox,
      stage,
      labelFont,
      isCurrent: props.currentStage === i,
    };
  });

  return {
    outer,
    stages: specs,
    title: props.title,
    titleBbox,
    hasDesc,
  };
}

export function layoutMaturityProgression(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  stages?: MaturityStage[];
  currentStage?: number;
  title?: string;
}): CompositeLayoutResult {
  const g = computeMaturityProgressionGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  for (const s of g.stages) {
    children.push({ kind: 'node', bbox: s.bbox, label: s.stage.label });
    if (s.descBbox) children.push({ kind: 'text', bbox: s.descBbox, label: s.stage.description });
  }
  return { outer: g.outer, children };
}

export const MaturityProgression: React.FC<MaturityProgressionProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    drawDuration = 22,
    stages = DEFAULT_STAGES,
    currentStage,
    title,
  } = props;

  const g = computeMaturityProgressionGeometry({ x, y, w, h, stages, currentStage, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="MaturityProgression layout error"
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
          y={g.outer.y1 + TITLE_H - 24}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      {g.stages.map((spec, i) => {
        const { bbox, descBbox, stage, labelFont, isCurrent } = spec;
        const appear = startFrame + i * 15;
        const boxW = bbox.x2 - bbox.x1;
        const boxH = bbox.y2 - bbox.y1;
        const hasPct = stage.adoptionPct !== undefined;
        const labelCy = bbox.y1 + boxH / 2 - (hasPct ? labelFont * 0.75 : 0);
        return (
          <g key={`stage-${i}`}>
            <SketchBox
              x={bbox.x1}
              y={bbox.y1}
              width={boxW}
              height={boxH}
              startFrame={appear}
              drawDuration={drawDuration}
              stroke={isCurrent ? COLORS.orange : COLORS.outline}
              strokeWidth={isCurrent ? 4 : 2.5}
              fill={isCurrent ? COLORS.orange : COLORS.blue}
              fillOpacity={isCurrent ? 0.25 : 0.08}
              rx={12}
            />
            <HandWrittenText
              text={stage.label}
              x={bbox.x1 + boxW / 2}
              y={labelCy}
              startFrame={appear + 8}
              durationFrames={18}
              fontSize={labelFont}
              fill={isCurrent ? COLORS.orange : COLORS.outline}
              fontWeight={700}
              textAnchor="middle"
              maxWidth={boxW - 16}
            />
            {hasPct && (
              <HandWrittenText
                text={`${stage.adoptionPct}%`}
                x={bbox.x1 + boxW / 2}
                y={bbox.y1 + boxH / 2 + labelFont * 0.85}
                startFrame={appear + 14}
                durationFrames={18}
                fontSize={Math.max(MIN_LABEL_FONT, Math.floor(labelFont * 0.9))}
                fill={COLORS.green}
                fontWeight={700}
                textAnchor="middle"
              />
            )}
            {descBbox && stage.description && (
              <HandWrittenText
                text={stage.description}
                x={bbox.x1 + boxW / 2}
                y={descBbox.y1 + 32}
                startFrame={appear + 18}
                durationFrames={18}
                fontSize={24}
                fill={COLORS.gray1}
                textAnchor="middle"
                maxWidth={boxW - 20}
              />
            )}
            {i < g.stages.length - 1 && (
              <SketchArrow
                x1={bbox.x2 + 4}
                y1={bbox.y1 + boxH / 2}
                x2={g.stages[i + 1].bbox.x1 - 4}
                y2={bbox.y1 + boxH / 2}
                startFrame={appear + drawDuration}
                drawDuration={10}
                color={COLORS.orange}
                strokeWidth={3}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
