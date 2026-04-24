import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SVG, HandWrittenText } from '../shared/components';
import { ReActLoop } from '../shared/diagrams/ReActLoop';
import { COLORS } from '../shared/theme';

export const ReActLoopTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#fafaf5' }}>
      <SVG>
        <HandWrittenText
          text="ReAct Loop — Memory + Tools, Think highlighted"
          x={960}
          y={70}
          startFrame={0}
          durationFrames={15}
          fontSize={40}
          fill={COLORS.outline}
          textAnchor="middle"
        />
        <ReActLoop
          startFrame={10}
          x={140}
          y={200}
          w={1640}
          h={760}
          showMemory
          showTools
          highlightStep={1}
        />
      </SVG>
    </AbsoluteFill>
  );
};
