import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SVG, COLORS } from '../shared/components';
import {
  FlowPulse,
  StaggerMap,
  SpringReveal,
  CountUp,
  CameraPan,
} from '../shared/motions';

const BG = '#fafaf5';

const PanelLabel: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text
    x={x}
    y={y}
    fontSize={28}
    fill={COLORS.outline}
    fontFamily="Architects Daughter, cursive"
    fontWeight={700}
    textAnchor="middle"
  >
    {text}
  </text>
);

// All five motion helpers showcased in a single composition.
export const MotionsTest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      {/* Panel 1: FlowPulse — pulsing circle */}
      <PanelLabel x={320} y={120} text="FlowPulse" />
      <FlowPulse startFrame={0} durationFrames={300} cycleDuration={30} svg>
        <circle cx={320} cy={280} r={80} fill={COLORS.orange} opacity={0.85} />
      </FlowPulse>

      {/* Panel 2: StaggerMap — 5 rectangles entering in sequence */}
      <PanelLabel x={960} y={120} text="StaggerMap" />
      <StaggerMap startFrame={10} staggerDelay={15} count={5}>
        {(i, sf) => (
          <SpringReveal key={i} startFrame={sf} direction="up" distance={40} svg>
            <rect
              x={760 + i * 90}
              y={220}
              width={70}
              height={120}
              fill={COLORS.blue}
              rx={8}
              opacity={0.9}
            />
          </SpringReveal>
        )}
      </StaggerMap>

      {/* Panel 3: SpringReveal — three directions */}
      <PanelLabel x={1600} y={120} text="SpringReveal" />
      <SpringReveal startFrame={20} direction="up" distance={60} svg>
        <circle cx={1500} cy={280} r={40} fill={COLORS.green} />
      </SpringReveal>
      <SpringReveal startFrame={40} direction="scale" svg>
        <rect x={1580} y={240} width={80} height={80} fill={COLORS.purple} rx={8} />
      </SpringReveal>
      <SpringReveal startFrame={60} direction="left" distance={80} svg>
        <polygon
          points="1700,240 1760,240 1730,320"
          fill={COLORS.yellow}
        />
      </SpringReveal>

      {/* Panel 4: CountUp — animated number */}
      <PanelLabel x={640} y={600} text="CountUp 0 → 100" />
      <CountUp
        startFrame={30}
        durationFrames={120}
        from={0}
        to={100}
        suffix="%"
        x={640}
        y={760}
        fontSize={120}
        fill={COLORS.orange}
      />

      {/* Panel 5: CameraPan anchor — labeled (see div overlay below) */}
      <PanelLabel x={1400} y={600} text="CameraPan (below)" />
    </SVG>

    {/* CameraPan lives in a div layer because it transforms a container */}
    <div
      style={{
        position: 'absolute',
        top: 650,
        left: 1100,
        width: 600,
        height: 360,
        border: `2px dashed ${COLORS.gray2}`,
        overflow: 'hidden',
      }}
    >
      <CameraPan
        keyframes={[
          { frame: 0, x: 0, y: 0, scale: 1 },
          { frame: 90, x: 200, y: 120, scale: 1.4 },
          { frame: 180, x: 0, y: 0, scale: 1 },
        ]}
      >
        <div
          style={{
            position: 'relative',
            width: 900,
            height: 600,
            background: `repeating-linear-gradient(45deg, ${COLORS.gray3} 0 20px, ${COLORS.white} 20px 40px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 240,
              top: 180,
              width: 100,
              height: 100,
              background: COLORS.red,
              borderRadius: 50,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 500,
              top: 380,
              width: 120,
              height: 120,
              background: COLORS.blue,
              borderRadius: 16,
            }}
          />
        </div>
      </CameraPan>
    </div>
  </AbsoluteFill>
);
