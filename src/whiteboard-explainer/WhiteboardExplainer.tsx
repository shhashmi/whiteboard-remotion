import React from 'react';
import { AbsoluteFill } from 'remotion';
// import { Audio } from 'remotion';
import { Scene1, Scene2, Scene3, Scene4, Scene5 } from './scenes';

export const WhiteboardExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Patrick+Hand&display=swap');
      `}</style>

      {/* Subtle paper texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 28px,
              rgba(180,160,120,0.04) 28px,
              rgba(180,160,120,0.04) 29px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 28px,
              rgba(180,160,120,0.03) 28px,
              rgba(180,160,120,0.03) 29px
            )
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Scene content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Scene1 />
        <Scene2 />
        <Scene3 />
        <Scene4 />
        <Scene5 />
      </div>

      {/*
        To add voiceover audio, uncomment and set src:
        <Audio src={staticFile('voiceover.mp3')} />
      */}
    </AbsoluteFill>
  );
};
