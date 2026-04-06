import React from 'react';
import { Composition } from 'remotion';
import { WhiteboardExplainer } from './whiteboard-explainer/WhiteboardExplainer';
import { CFPBExplainer } from './cfpb-riskcheck/CFPBExplainer';
import { CardStack3D } from './3danimation/CardStack3D';
import { ZPatternCards } from './3danimationZpattern/ZPatternCards';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="WhiteboardExplainer"
        component={WhiteboardExplainer}
        durationInFrames={1080}
        fps={30}
        width={1080}
        height={720}
      />
      <Composition
        id="CFPBRiskCheck"
        component={CFPBExplainer}
        durationInFrames={5100}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="CardStack3D"
        component={CardStack3D}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ZPatternCards"
        component={ZPatternCards}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
