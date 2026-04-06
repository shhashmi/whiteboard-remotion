import React from 'react';
import { Composition } from 'remotion';
import { AgenticAIExplainer } from './AgenticAIExplainer';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AgenticAIExplainer"
        component={AgenticAIExplainer}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
