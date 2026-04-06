import React from 'react';
import { Composition } from 'remotion';
import { CFPBExplainer } from './cfpb-riskcheck/CFPBExplainer';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CFPBRiskCheck"
        component={CFPBExplainer}
        durationInFrames={5100}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
