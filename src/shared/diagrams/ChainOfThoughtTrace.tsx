import React from 'react';
import { SketchBox, SketchArrow, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import { CodeBlock } from './CodeBlock';

export interface ChainOfThoughtTraceProps {
  startFrame: number;
  steps: string[];
  finalAnswer: string;
  schema?: string;
  title?: string;
}

export const ChainOfThoughtTrace: React.FC<ChainOfThoughtTraceProps> = ({
  startFrame,
  steps,
  finalAnswer,
  schema,
  title = 'Chain-of-Thought Reasoning',
}) => {
  const hasSchema = !!schema;
  const traceX = 100;
  const traceWidth = hasSchema ? 1100 : 1720;
  const stepHeight = 120;
  const gap = 30;

  return (
    <>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <HandWrittenText
          text={title}
          x={traceX + traceWidth / 2}
          y={80}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
        {steps.map((step, i) => {
          const stepY = 160 + i * (stepHeight + gap);
          const appear = startFrame + 15 + i * 25;
          return (
            <g key={`cot-${i}`}>
              <SketchBox
                x={traceX}
                y={stepY}
                width={traceWidth}
                height={stepHeight}
                startFrame={appear}
                drawDuration={20}
                stroke={COLORS.blue}
                strokeWidth={2.5}
                fill={COLORS.blue}
                fillOpacity={0.08}
                rx={12}
                rows={[
                  {
                    text: `${i + 1}. ${step}`,
                    fontSize: 32,
                    startFrame: appear + 8,
                    durationFrames: 20,
                    align: 'start',
                  },
                ]}
                contentAlign="start"
              />
              {i < steps.length - 1 && (
                <SketchArrow
                  x1={traceX + 60}
                  y1={stepY + stepHeight + 2}
                  x2={traceX + 60}
                  y2={stepY + stepHeight + gap - 2}
                  startFrame={appear + 22}
                  drawDuration={10}
                  color={COLORS.orange}
                  strokeWidth={2.5}
                />
              )}
            </g>
          );
        })}
        {/* Final answer */}
        <SketchBox
          x={traceX}
          y={160 + steps.length * (stepHeight + gap)}
          width={traceWidth}
          height={stepHeight}
          startFrame={startFrame + 15 + steps.length * 25}
          drawDuration={22}
          stroke={COLORS.green}
          strokeWidth={4}
          fill={COLORS.green}
          fillOpacity={0.18}
          rx={12}
          rows={[
            {
              text: `Answer: ${finalAnswer}`,
              fontSize: 34,
              startFrame: startFrame + 15 + steps.length * 25 + 10,
              durationFrames: 20,
              color: COLORS.green,
              fontWeight: 700,
              align: 'start',
            },
          ]}
          contentAlign="start"
        />
      </svg>
      {hasSchema && (
        <CodeBlock
          startFrame={startFrame + 20}
          code={schema}
          language="schema"
          x={1260}
          y={180}
          width={580}
          fontSize={22}
          title="Output schema"
        />
      )}
    </>
  );
};
