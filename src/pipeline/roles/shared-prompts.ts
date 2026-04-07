/**
 * Shared prompt constants extracted from the former monolithic animator.
 * Used by layout.ts, animate.ts, and polish.ts.
 */

export const COMPONENT_API = `
COMPONENT API REFERENCE (all from src/studymaterial/components.tsx):

HandWrittenText — Typewriter character-by-character text reveal in SVG
  Props: text (string), x (number), y (number), startFrame (number), durationFrames (number),
         fontSize? (number, default 32), fill? (string, default COLORS.outline),
         fontWeight? (number|string, default 700), textAnchor? ("start"|"middle"|"end", default "middle")

AnimatedPath — SVG path with stroke-dash draw animation
  Props: d (string), startFrame (number), drawDuration (number),
         stroke? (string), strokeWidth? (number, default 2.5),
         fill? (string, default "none"), fillOpacity? (number, default 1)

SketchBox — Wobbly-cornered rectangle
  Props: x (number), y (number), width (number), height (number),
         startFrame (number), drawDuration (number),
         stroke? (string), strokeWidth? (number, default 2.5),
         fill? (string, default "none"), fillOpacity? (number, default 0.15)

SketchCircle — Imperfect bezier circle
  Props: cx (number), cy (number), r (number), startFrame (number), drawDuration (number),
         stroke? (string), fill? (string, default "none"), fillOpacity? (number)

SketchArrow — Line with arrowhead
  Props: x1 (number), y1 (number), x2 (number), y2 (number),
         startFrame (number), drawDuration (number), color? (string), strokeWidth? (number)

SketchLine — Simple animated line
  Props: x1 (number), y1 (number), x2 (number), y2 (number),
         startFrame (number), drawDuration (number), color? (string), strokeWidth? (number)

SketchTable — Animated table
  Props: headers (string[]), rows (string[][]), x (number), y (number),
         colWidth? (number), rowHeight? (number), startFrame (number),
         framesPerRow? (number), headerColor? (string), fontSize? (number)

Scene — Container with 30-frame fade in/out. Returns null outside frame range.
  Props: startFrame (number), endFrame (number), children

CheckMark — Animated green checkmark
  Props: cx (number), cy (number), scale (number), startFrame (number), drawDuration (number), color? (string)

CrossMark — Animated red X
  Props: cx (number), cy (number), scale (number), startFrame (number), drawDuration (number), color? (string)

ICONS (all share: cx, cy, scale, startFrame, drawDuration):
  RobotHead (+color), PersonIcon (+shirtColor,hairColor), BrainIcon, GearIcon (+color),
  Lightbulb, ToolIcon, TargetIcon, DatabaseIcon, CodeIcon, CloudIcon,
  BookIcon (+color,label), MonitorIcon, BarChart, ClockIcon, DocStack

COLORS: COLORS.outline, COLORS.orange, COLORS.blue, COLORS.purple, COLORS.green,
        COLORS.yellow, COLORS.red, COLORS.gray1, COLORS.gray2, COLORS.gray3, COLORS.white
`;

export const TIMING_REFERENCE = `
TIMING CONVENTIONS:
- Scene duration: 300-500 frames (10-17 sec at 30fps)
- Text: durationFrames ≈ ceil(text.length / 1.5)
- SketchBox draw: 18-30 frames
- SketchArrow draw: 10-15 frames
- Icon draw: 40-80 frames
- Stagger between items: 25-35 frames
- First element: sceneStart + 30 (after fade-in)
- CRITICAL: All content animations must COMPLETE by endFrame - 60 (leaves 30 frames hold + 30 frames fade-out)
- The last animation's (startFrame + durationFrames/drawDuration) must be <= endFrame - 60

PACING → SCENE DURATION:
- slow: 450-500 frames (15-17 sec)
- medium: 350-400 frames (12-13 sec)
- fast: 300-350 frames (10-12 sec)
`;

export const LAYOUT_CONVENTIONS = `
LAYOUT (1920x1080 canvas):
- Title: x=960, y=68, fontSize=46, textAnchor="middle"
- Title underline: SketchLine y=82
- Content area: y=120 to y=950
- Side margins: 60-120px
- Hero icon: cx=960, cy=300-440, scale=2-4
`;

export const REFERENCE_SCENES = `
REFERENCE SCENE A — Three cards with staggered timing (static JSX):
\`\`\`tsx
export const Scene3ThreePillars: React.FC = () => (
  <Scene startFrame={660} endFrame={900}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        <HandWrittenText text="Three Characteristics of Agentic AI" x={960} y={70}
          startFrame={690} durationFrames={35} fontSize={46} fill={COLORS.outline} fontWeight={700} textAnchor="middle" />
        <SketchLine x1={380} y1={82} x2={1540} y2={82} startFrame={725} drawDuration={20} color={COLORS.orange} strokeWidth={3} />

        {/* Card 1: Autonomy (blue) */}
        <SketchBox x={160} y={120} width={450} height={650} startFrame={715} drawDuration={30} stroke={COLORS.blue} strokeWidth={3} fill="#eff6ff" fillOpacity={0.6} />
        <HandWrittenText text="1" x={385} y={205} startFrame={735} durationFrames={15} fontSize={72} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <RobotHead cx={385} cy={350} scale={2.5} startFrame={745} drawDuration={40} color="#dbeafe" />
        <HandWrittenText text="AUTONOMY" x={385} y={490} startFrame={770} durationFrames={20} fontSize={34} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Acting without" x={385} y={535} startFrame={785} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

        {/* Card 2 and 3 follow same pattern — last animation must complete by endFrame-60 (frame 840) */}
      </SVG>
    </AbsoluteFill>
  </Scene>
);
\`\`\`

REFERENCE SCENE B — Hub-and-spoke with .map() loops and computed positions:
\`\`\`tsx
export const Scene7ToolUse: React.FC = () => {
  const leftCards = [
    { text: 'Search the web', bg: '#dbeafe', border: COLORS.blue, dx: -480, dy: -130 },
    { text: 'Query databases', bg: '#fce7f3', border: '#ec4899', dx: -520, dy: 20 },
    { text: 'Call APIs', bg: '#fef9c3', border: COLORS.yellow, dx: -460, dy: 170 },
  ];

  return (
    <Scene startFrame={2160} endFrame={2550}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          <RobotHead cx={960} cy={440} scale={3} startFrame={2190} drawDuration={60} color="#dcfce7" />

          {leftCards.map((card, i) => {
            const cx = 960 + card.dx;
            const cy = 440 + card.dy;
            const sf = 2250 + i * 25;
            return (
              <g key={\\\`l\${i}\\\`}>
                <SketchLine x1={960} y1={440} x2={cx + 80} y2={cy} startFrame={sf} drawDuration={15} color="#86efac" strokeWidth={1.5} />
                <SketchBox x={cx - 80} y={cy - 28} width={200} height={56} startFrame={sf + 10} drawDuration={18} stroke={card.border} strokeWidth={2} fill={card.bg} fillOpacity={0.9} />
                <HandWrittenText text={card.text} x={cx + 20} y={cy + 10} startFrame={sf + 28} durationFrames={18} fontSize={24} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
              </g>
            );
          })}
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};
\`\`\`

REFERENCE SCENE C — Step chain with .map() loop:
\`\`\`tsx
const steps = [
  { text: 'Read error logs', bg: '#dbeafe', border: COLORS.blue },
  { text: 'Search codebase', bg: '#dcfce7', border: COLORS.green },
  { text: 'Write a fix', bg: '#fce7f3', border: '#ec4899' },
];

{steps.map((step, i) => {
  const sy = 420 + i * 78;
  const sf = 1000 + i * 30;
  return (
    <g key={i}>
      <SketchBox x={330} y={sy} width={360} height={50} startFrame={sf} drawDuration={18}
        stroke={step.border} strokeWidth={2} fill={step.bg} fillOpacity={0.9} />
      <HandWrittenText text={step.text} x={510} y={sy + 32} startFrame={sf + 18}
        durationFrames={20} fontSize={22} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
      {i < steps.length - 1 && (
        <SketchArrow x1={510} y1={sy + 50} x2={510} y2={sy + 72}
          startFrame={sf + 30} drawDuration={10} color={step.border} strokeWidth={2} />
      )}
    </g>
  );
})}
\`\`\`
`;
