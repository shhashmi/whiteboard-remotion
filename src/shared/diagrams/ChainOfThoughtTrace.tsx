import React from 'react';
import { SketchBox, SketchArrow, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import { CodeBlock, layoutCodeBlock } from './CodeBlock';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface ChainOfThoughtTraceProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  steps: string[];
  finalAnswer: string;
  schema?: string;
  /**
   * Pass `null` or `""` to omit the title entirely (no vertical budget reserved).
   * Omitted / undefined defaults to the standard title, which reserves TITLE_H
   * px at the top of the rect.
   */
  title?: string | null;
}

const TITLE_H = 72;
const MIN_STEP_H = 80;
const STEP_GAP = 30;
const SCHEMA_W_RATIO = 0.38;
const SCHEMA_GAP = 40;
const MIN_STEP_W = 400;
const MIN_SCHEMA_W = 400;
const ARROW_MARGIN = 4;

interface StepSpec {
  bbox: Box;
  text: string;
  isAnswer: boolean;
}

interface ChainOfThoughtGeometry {
  outer: Box;
  steps: StepSpec[];
  schemaRect?: Box;
  schemaChildren?: CompositeChild[];
  schemaError?: string;
  title?: string;
  titleBbox?: Box;
  error?: string;
}

function computeChainOfThoughtGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  steps: string[];
  finalAnswer: string;
  schema?: string;
  title?: string | null;
}): ChainOfThoughtGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  // title === null explicitly suppresses the title. undefined defaults to the
  // standard label. An empty string still reserves budget (treat as a title).
  const title = props.title === null
    ? undefined
    : (props.title ?? 'Chain-of-Thought Reasoning');
  const hasTitle = !!title;
  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;
  const hasSchema = !!props.schema;
  const nBoxes = props.steps.length + 1; // steps + final answer

  // Horizontal split.
  const schemaW = hasSchema ? Math.max(MIN_SCHEMA_W, Math.floor(props.w * SCHEMA_W_RATIO)) : 0;
  const schemaGap = hasSchema ? SCHEMA_GAP : 0;
  const traceW = props.w - schemaW - schemaGap;

  if (traceW < MIN_STEP_W) {
    return {
      outer,
      steps: [],
      title,
      titleBbox,
      error: `ChainOfThoughtTrace requires trace column ≥ ${MIN_STEP_W}px${hasSchema ? ` plus ${MIN_SCHEMA_W}px schema column + ${SCHEMA_GAP}px gap` : ''}; got trace column ${Math.floor(traceW)}px`,
    };
  }

  // Vertical: (hasTitle ? TITLE_H : 0) + nBoxes * stepH + (nBoxes - 1) * STEP_GAP ≤ h
  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const contentH = outer.y2 - contentY1;
  const stepH = Math.floor((contentH - (nBoxes - 1) * STEP_GAP) / nBoxes);

  if (stepH < MIN_STEP_H) {
    const needH = Math.ceil((hasTitle ? TITLE_H : 0) + nBoxes * MIN_STEP_H + (nBoxes - 1) * STEP_GAP);
    return {
      outer,
      steps: [],
      title,
      titleBbox,
      error: `ChainOfThoughtTrace with ${nBoxes} boxes requires rect height ≥ ${needH}px (min step ${MIN_STEP_H}px); got ${Math.floor(props.h)}px`,
    };
  }

  const traceX1 = outer.x1;
  const traceX2 = traceX1 + traceW;
  const steps: StepSpec[] = [];
  for (let i = 0; i < props.steps.length; i++) {
    const y1 = contentY1 + i * (stepH + STEP_GAP);
    steps.push({
      bbox: { x1: traceX1, y1, x2: traceX2, y2: y1 + stepH },
      text: `${i + 1}. ${props.steps[i]}`,
      isAnswer: false,
    });
  }
  const answerY1 = contentY1 + props.steps.length * (stepH + STEP_GAP);
  steps.push({
    bbox: { x1: traceX1, y1: answerY1, x2: traceX2, y2: answerY1 + stepH },
    text: `Answer: ${props.finalAnswer}`,
    isAnswer: true,
  });

  let schemaRect: Box | undefined;
  let schemaChildren: CompositeChild[] | undefined;
  let schemaError: string | undefined;
  if (hasSchema && props.schema !== undefined) {
    schemaRect = {
      x1: traceX2 + schemaGap,
      y1: contentY1,
      x2: outer.x2,
      y2: outer.y2,
    };
    const schemaLayout = layoutCodeBlock({
      x: schemaRect.x1,
      y: schemaRect.y1,
      w: schemaRect.x2 - schemaRect.x1,
      h: schemaRect.y2 - schemaRect.y1,
      code: props.schema,
      title: 'Output schema',
      language: 'schema',
    });
    if (schemaLayout.error) {
      schemaError = `schema — ${schemaLayout.error}`;
    } else {
      schemaChildren = schemaLayout.children;
    }
  }

  return {
    outer,
    steps,
    schemaRect,
    schemaChildren,
    schemaError,
    title,
    titleBbox,
    error: schemaError,
  };
}

export function layoutChainOfThoughtTrace(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  steps: string[];
  finalAnswer: string;
  schema?: string;
  title?: string | null;
}): CompositeLayoutResult {
  const g = computeChainOfThoughtGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) {
    children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  }
  for (const s of g.steps) {
    children.push({ kind: 'node', bbox: s.bbox, label: s.text });
  }
  if (g.schemaChildren) {
    for (const c of g.schemaChildren) children.push(c);
  }
  return { outer: g.outer, children };
}

export const ChainOfThoughtTrace: React.FC<ChainOfThoughtTraceProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    steps,
    finalAnswer,
    schema,
    title,
  } = props;

  const g = computeChainOfThoughtGeometry({ x, y, w, h, steps, finalAnswer, schema, title });
  const renderedTitle = g.title;
  if (g.error) {
    return (
      <>
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <HandWrittenText
            text="ChainOfThoughtTrace layout error"
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
        </svg>
      </>
    );
  }

  const stepSpecs = g.steps;
  const answerIdx = stepSpecs.length - 1;

  return (
    <>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {renderedTitle && (
          <HandWrittenText
            text={renderedTitle}
            x={(g.outer.x1 + g.outer.x2) / 2}
            y={g.outer.y1 + TITLE_H - 24}
            startFrame={startFrame}
            durationFrames={18}
            fontSize={42}
            fill={COLORS.outline}
            textAnchor="middle"
          />
        )}
        {stepSpecs.map((spec, i) => {
          const appear = startFrame + 15 + i * 25;
          const isAnswer = spec.isAnswer;
          const stepX = spec.bbox.x1;
          const stepY = spec.bbox.y1;
          const stepW = spec.bbox.x2 - spec.bbox.x1;
          const stepH = spec.bbox.y2 - spec.bbox.y1;
          return (
            <g key={`cot-${i}`}>
              <SketchBox
                x={stepX}
                y={stepY}
                width={stepW}
                height={stepH}
                startFrame={appear}
                drawDuration={isAnswer ? 22 : 20}
                stroke={isAnswer ? COLORS.green : COLORS.blue}
                strokeWidth={isAnswer ? 4 : 2.5}
                fill={isAnswer ? COLORS.green : COLORS.blue}
                fillOpacity={isAnswer ? 0.18 : 0.08}
                rx={12}
                rows={[
                  {
                    text: spec.text,
                    fontSize: isAnswer ? 34 : 32,
                    startFrame: appear + (isAnswer ? 10 : 8),
                    durationFrames: 20,
                    color: isAnswer ? COLORS.green : undefined,
                    fontWeight: isAnswer ? 700 : undefined,
                    align: 'start',
                  },
                ]}
                contentAlign="start"
              />
              {i < answerIdx && (
                <SketchArrow
                  x1={stepX + 60}
                  y1={spec.bbox.y2 + ARROW_MARGIN}
                  x2={stepX + 60}
                  y2={stepSpecs[i + 1].bbox.y1 - ARROW_MARGIN}
                  startFrame={appear + 22}
                  drawDuration={10}
                  color={COLORS.orange}
                  strokeWidth={2.5}
                />
              )}
            </g>
          );
        })}
      </svg>
      {schema !== undefined && g.schemaRect && (
        <CodeBlock
          startFrame={startFrame + 20}
          code={schema}
          language="schema"
          x={g.schemaRect.x1}
          y={g.schemaRect.y1}
          w={g.schemaRect.x2 - g.schemaRect.x1}
          h={g.schemaRect.y2 - g.schemaRect.y1}
          title="Output schema"
        />
      )}
    </>
  );
};
