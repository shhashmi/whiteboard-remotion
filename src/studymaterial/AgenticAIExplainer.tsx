import React from 'react';
import { AbsoluteFill } from 'remotion';
// import { Audio } from 'remotion';
// import voiceover from './voiceover.mp3';

import {
  Scene1Title,
  Scene2Definition,
  Scene3ThreePillars,
  Scene4Autonomy,
  Scene5ComparisonTable,
  Scene6GoalDirected,
  Scene7ToolUse,
  Scene8SpectrumTable,
  Scene9Spotlight,
  Scene10Closing,
} from './scenes';

// Load handwritten fonts via CSS @import
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
`;

export const AgenticAIExplainer: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#fefefe',
        fontFamily: '"Architects Daughter", "Caveat", cursive',
      }}
    >
      {/* Font injection */}
      <style>{fontStyle}</style>

      {/* Paper texture overlay */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.006) 39px, rgba(0,0,0,0.006) 40px),' +
            'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.006) 39px, rgba(0,0,0,0.006) 40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Dot grid pattern */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* All 10 scenes */}
      <Scene1Title />
      <Scene2Definition />
      <Scene3ThreePillars />
      <Scene4Autonomy />
      <Scene5ComparisonTable />
      <Scene6GoalDirected />
      <Scene7ToolUse />
      <Scene8SpectrumTable />
      <Scene9Spotlight />
      <Scene10Closing />

      {/*
        To add audio, uncomment the lines below and provide your audio file:

        import { Audio } from 'remotion';
        import voiceover from './voiceover.mp3';

        <Audio src={voiceover} startFrom={0} />
      */}
    </AbsoluteFill>
  );
};
