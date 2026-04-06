import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  SVG, Scene, FadeIn,
  AnimatedPath, HandWrittenText,
  SketchBox, SketchCircle, SketchArrow, SketchLine,
  RobotHead, PersonIcon, BrainIcon, GearIcon, Lightbulb,
  ToolIcon, TargetIcon, CheckMark, CrossMark,
  DatabaseIcon, CodeIcon, CloudIcon,
  SketchTable, COLORS,
} from './components';

// ─── Scene 1: Title (frames 0–300) ───────────────────────────────────────────
export const Scene1Title: React.FC = () => (
  <Scene startFrame={0} endFrame={300}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        {/* Big robot */}
        <RobotHead cx={960} cy={320} scale={4} startFrame={20} drawDuration={80} color="#e0f2fe" />

        {/* "What Makes AI" */}
        <HandWrittenText
          text="What Makes AI"
          x={960} y={560}
          startFrame={80} durationFrames={40}
          fontSize={72} fill={COLORS.outline}
          fontWeight={700} textAnchor="middle"
        />

        {/* "'Agentic'?" */}
        <HandWrittenText
          text="'Agentic'?"
          x={960} y={650}
          startFrame={120} durationFrames={40}
          fontSize={88} fill={COLORS.orange}
          fontWeight={700} textAnchor="middle"
        />

        {/* 3 orange dots */}
        {[940, 960, 980].map((dotX, i) => {
          const r = 6;
          const k = r * 0.56;
          return (
            <AnimatedPath
              key={i}
              d={`M ${dotX} ${720 - r} C ${dotX + k} ${720 - r}, ${dotX + r} ${720 - k}, ${dotX + r} ${720} C ${dotX + r} ${720 + k}, ${dotX + k} ${720 + r}, ${dotX} ${720 + r} C ${dotX - k} ${720 + r}, ${dotX - r} ${720 + k}, ${dotX - r} ${720} C ${dotX - r} ${720 - k}, ${dotX - k} ${720 - r}, ${dotX} ${720 - r} Z`}
              startFrame={170 + i * 10}
              drawDuration={15}
              stroke={COLORS.orange}
              fill={COLORS.orange}
              fillOpacity={1}
            />
          );
        })}

        {/* Subtitle */}
        <HandWrittenText
          text="Autonomy • Goals • Tools"
          x={960} y={800}
          startFrame={200} durationFrames={50}
          fontSize={36} fill={COLORS.gray1}
          fontWeight={400} textAnchor="middle"
        />
      </SVG>
    </AbsoluteFill>
  </Scene>
);

// ─── Scene 2: Definition (frames 300–660) ────────────────────────────────────
export const Scene2Definition: React.FC = () => (
  <Scene startFrame={300} endFrame={660}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        {/* Header */}
        <HandWrittenText
          text="AGENTIC AI"
          x={120} y={80}
          startFrame={315} durationFrames={25}
          fontSize={52} fill={COLORS.orange}
          fontWeight={700} textAnchor="start"
        />
        {/* Underline */}
        <SketchLine x1={120} y1={92} x2={400} y2={92} startFrame={340} drawDuration={15} color={COLORS.orange} strokeWidth={3} />

        {/* Robot */}
        <RobotHead cx={280} cy={340} scale={3.5} startFrame={320} drawDuration={60} color="#e0f2fe" />

        {/* Text lines */}
        <HandWrittenText text="AI systems that act as" x={700} y={250} startFrame={360} durationFrames={30} fontSize={34} fill={COLORS.outline} textAnchor="start" fontWeight={400} />
        <HandWrittenText text="autonomous agents" x={700} y={300} startFrame={390} durationFrames={30} fontSize={38} fill={COLORS.orange} fontWeight={700} textAnchor="start" />

        {/* Three circles: Perceive / Reason / Act */}
        <SketchCircle cx={620} cy={460} r={55} startFrame={400} drawDuration={25} stroke={COLORS.blue} strokeWidth={2.5} fill={COLORS.blue} fillOpacity={0.15} />
        <HandWrittenText text="Perceive" x={620} y={468} startFrame={425} durationFrames={20} fontSize={26} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />

        <SketchCircle cx={820} cy={460} r={55} startFrame={415} drawDuration={25} stroke={COLORS.purple} strokeWidth={2.5} fill={COLORS.purple} fillOpacity={0.15} />
        <HandWrittenText text="Reason" x={820} y={468} startFrame={440} durationFrames={20} fontSize={26} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />

        <SketchCircle cx={1020} cy={460} r={55} startFrame={430} drawDuration={25} stroke={COLORS.green} strokeWidth={2.5} fill={COLORS.green} fillOpacity={0.15} />
        <HandWrittenText text="Act" x={1020} y={468} startFrame={455} durationFrames={20} fontSize={26} fill={COLORS.green} fontWeight={700} textAnchor="middle" />

        {/* Arrows between circles */}
        <SketchArrow x1={675} y1={460} x2={762} y2={460} startFrame={450} drawDuration={15} color={COLORS.gray1} />
        <SketchArrow x1={875} y1={460} x2={962} y2={460} startFrame={460} drawDuration={15} color={COLORS.gray1} />

        {/* Red-bordered box: "Without constant supervision" */}
        <SketchBox x={550} y={565} width={550} height={55} startFrame={470} drawDuration={20} stroke={COLORS.red} strokeWidth={2} fill="#fff5f5" fillOpacity={0.8} />
        <HandWrittenText text="Without constant supervision" x={825} y={600} startFrame={490} durationFrames={30} fontSize={28} fill={COLORS.red} fontWeight={700} textAnchor="middle" />

        {/* Cross mark + text */}
        <CrossMark cx={570} cy={680} scale={0.8} startFrame={505} drawDuration={15} color={COLORS.gray1} />
        <HandWrittenText text="≠ Simply responds to prompts" x={620} y={688} startFrame={515} durationFrames={30} fontSize={26} fill={COLORS.gray1} fontWeight={400} textAnchor="start" />

        {/* Brain icon top-right */}
        <BrainIcon cx={1500} cy={350} scale={3} startFrame={330} drawDuration={60} />

        {/* Gear icons bottom-right */}
        <GearIcon cx={1380} cy={820} scale={2} startFrame={530} drawDuration={40} color={COLORS.purple} />
        <GearIcon cx={1520} cy={780} scale={1.5} startFrame={545} drawDuration={35} color={COLORS.blue} />
      </SVG>
    </AbsoluteFill>
  </Scene>
);

// ─── Scene 3: Three Pillars (frames 660–900) ──────────────────────────────────
export const Scene3ThreePillars: React.FC = () => (
  <Scene startFrame={660} endFrame={900}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        {/* Title */}
        <HandWrittenText
          text="Three Characteristics of Agentic AI"
          x={960} y={70}
          startFrame={675} durationFrames={35}
          fontSize={46} fill={COLORS.outline}
          fontWeight={700} textAnchor="middle"
        />
        {/* Underline */}
        <SketchLine x1={380} y1={82} x2={1540} y2={82} startFrame={710} drawDuration={20} color={COLORS.orange} strokeWidth={3} />

        {/* Card 1: Autonomy (blue) */}
        <SketchBox x={160} y={120} width={450} height={650} startFrame={700} drawDuration={30} stroke={COLORS.blue} strokeWidth={3} fill="#eff6ff" fillOpacity={0.6} />
        <HandWrittenText text="1" x={385} y={205} startFrame={720} durationFrames={15} fontSize={72} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <RobotHead cx={385} cy={350} scale={2.5} startFrame={730} drawDuration={40} color="#dbeafe" />
        <HandWrittenText text="AUTONOMY" x={385} y={490} startFrame={755} durationFrames={20} fontSize={34} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Acting without" x={385} y={535} startFrame={770} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />
        <HandWrittenText text="constant direction" x={385} y={562} startFrame={780} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

        {/* Card 2: Goal-Directed (purple) */}
        <SketchBox x={735} y={120} width={450} height={650} startFrame={715} drawDuration={30} stroke={COLORS.purple} strokeWidth={3} fill="#faf5ff" fillOpacity={0.6} />
        <HandWrittenText text="2" x={960} y={205} startFrame={730} durationFrames={15} fontSize={72} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />
        <TargetIcon cx={960} cy={355} scale={2.2} startFrame={740} drawDuration={45} />
        <HandWrittenText text="GOAL-DIRECTED" x={960} y={490} startFrame={770} durationFrames={20} fontSize={30} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Pursuing outcomes," x={960} y={535} startFrame={785} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />
        <HandWrittenText text="not just responding" x={960} y={562} startFrame={795} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

        {/* Card 3: Tool Use (green) */}
        <SketchBox x={1310} y={120} width={450} height={650} startFrame={730} drawDuration={30} stroke={COLORS.green} strokeWidth={3} fill="#f0fdf4" fillOpacity={0.6} />
        <HandWrittenText text="3" x={1535} y={205} startFrame={745} durationFrames={15} fontSize={72} fill={COLORS.green} fontWeight={700} textAnchor="middle" />
        <ToolIcon cx={1535} cy={355} scale={2.5} startFrame={755} drawDuration={45} />
        <HandWrittenText text="TOOL USE" x={1535} y={490} startFrame={785} durationFrames={20} fontSize={34} fill={COLORS.green} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Interacting with" x={1535} y={535} startFrame={800} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />
        <HandWrittenText text="the real world" x={1535} y={562} startFrame={810} durationFrames={20} fontSize={22} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />
      </SVG>
    </AbsoluteFill>
  </Scene>
);

// ─── Scene 4: Autonomy Deep Dive (frames 900–1350) ────────────────────────────
export const Scene4Autonomy: React.FC = () => {
  // 6-step chain: starting at x=400, y=480, spacing 80px
  const steps = [
    { text: 'Read error logs', bg: '#dbeafe', border: COLORS.blue },
    { text: 'Search codebase', bg: '#dcfce7', border: COLORS.green },
    { text: 'Identify root cause', bg: '#fef9c3', border: COLORS.yellow },
    { text: 'Write a fix', bg: '#fce7f3', border: '#ec4899' },
    { text: 'Run tests', bg: '#e0e7ff', border: '#6366f1' },
    { text: 'Submit PR', bg: '#d1fae5', border: '#10b981' },
  ];

  return (
    <Scene startFrame={900} endFrame={1350}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          {/* Header */}
          <SketchCircle cx={75} cy={75} r={30} startFrame={910} drawDuration={20} stroke={COLORS.blue} strokeWidth={3} fill={COLORS.blue} fillOpacity={0.2} />
          <HandWrittenText text="1" x={75} y={84} startFrame={930} durationFrames={10} fontSize={36} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
          <HandWrittenText
            text="Autonomy: Acting Without Constant Direction"
            x={160} y={80}
            startFrame={920} durationFrames={40}
            fontSize={36} fill={COLORS.outline}
            fontWeight={700} textAnchor="start"
          />

          {/* "You define the WHAT / the agent figures out the HOW" */}
          <HandWrittenText text="You define the WHAT..." x={200} y={155} startFrame={945} durationFrames={25} fontSize={30} fill={COLORS.outline} fontWeight={400} textAnchor="start" />
          <HandWrittenText text="the agent figures out the HOW" x={200} y={195} startFrame={965} durationFrames={30} fontSize={32} fill={COLORS.orange} fontWeight={700} textAnchor="start" />

          {/* PersonIcon on left */}
          <PersonIcon cx={200} cy={400} scale={1.8} startFrame={950} drawDuration={50} shirtColor={COLORS.blue} />

          {/* Speech bubble: "Resolve this bug" */}
          <SketchBox x={265} y={270} width={220} height={55} startFrame={975} drawDuration={20} stroke={COLORS.blue} strokeWidth={2} fill="#eff6ff" fillOpacity={0.9} />
          <HandWrittenText text="Resolve this bug" x={375} y={305} startFrame={990} durationFrames={20} fontSize={24} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />

          {/* Arrow person → robot */}
          <SketchArrow x1={330} y1={360} x2={430} y2={340} startFrame={1000} drawDuration={15} color={COLORS.orange} />

          {/* Robot */}
          <RobotHead cx={510} cy={300} scale={2.5} startFrame={960} drawDuration={55} color="#e0f2fe" />

          {/* 6-step vertical chain */}
          {steps.map((step, i) => {
            const sy = 420 + i * 78;
            const sf = 1000 + i * 30;
            return (
              <g key={i}>
                <SketchBox x={330} y={sy} width={360} height={50} startFrame={sf} drawDuration={18} stroke={step.border} strokeWidth={2} fill={step.bg} fillOpacity={0.9} />
                <HandWrittenText text={step.text} x={510} y={sy + 32} startFrame={sf + 18} durationFrames={20} fontSize={22} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
                {i < 5 && (
                  <SketchArrow x1={510} y1={sy + 50} x2={510} y2={sy + 72} startFrame={sf + 30} drawDuration={10} color={step.border} strokeWidth={2} />
                )}
              </g>
            );
          })}

          {/* KEY DISTINCTION box (orange border) */}
          <SketchBox x={1100} y={260} width={700} height={130} startFrame={1050} drawDuration={25} stroke={COLORS.orange} strokeWidth={2.5} fill="#fff7ed" fillOpacity={0.8} />
          <HandWrittenText text="KEY DISTINCTION" x={1450} y={305} startFrame={1070} durationFrames={20} fontSize={30} fill={COLORS.orange} fontWeight={700} textAnchor="middle" />
          <HandWrittenText text="Agents replace human work" x={1450} y={365} startFrame={1085} durationFrames={25} fontSize={26} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />

          {/* "vs" */}
          <HandWrittenText text="vs" x={1450} y={435} startFrame={1110} durationFrames={10} fontSize={28} fill={COLORS.gray1} fontWeight={700} textAnchor="middle" />

          {/* Copilots box (purple border) */}
          <SketchBox x={1100} y={460} width={700} height={100} startFrame={1090} drawDuration={22} stroke={COLORS.purple} strokeWidth={2.5} fill="#faf5ff" fillOpacity={0.8} />
          <HandWrittenText text="Copilots enhance human work" x={1450} y={522} startFrame={1108} durationFrames={25} fontSize={26} fill={COLORS.purple} fontWeight={400} textAnchor="middle" />
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};

// ─── Scene 5: Comparison Table (frames 1350–1740) ────────────────────────────
export const Scene5ComparisonTable: React.FC = () => {
  const tableHeaders = ['Characteristic', 'Chatbot', 'Copilot', 'Agent'];
  const tableRows = [
    ['Waits for input', 'Yes', 'Yes', 'No'],
    ['Suggests actions', 'Limited', 'Yes', 'Yes'],
    ['Acts independently', 'No', 'No', 'Yes'],
    ['Adapts mid-task', 'No', 'Limited', 'Yes'],
    ['Human involvement', 'Every step', 'Approval', 'Goal-setting'],
  ];

  return (
    <Scene startFrame={1350} endFrame={1740}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          {/* Title */}
          <HandWrittenText
            text="The Spectrum: Chatbot → Copilot → Agent"
            x={960} y={68}
            startFrame={1365} durationFrames={40}
            fontSize={44} fill={COLORS.outline}
            fontWeight={700} textAnchor="middle"
          />
          <SketchLine x1={270} y1={80} x2={1650} y2={80} startFrame={1405} drawDuration={20} color={COLORS.orange} strokeWidth={3} />

          {/* Table */}
          <SketchTable
            headers={tableHeaders}
            rows={tableRows}
            x={185}
            y={110}
            colWidth={350}
            rowHeight={52}
            startFrame={1415}
            framesPerRow={18}
            headerColor={COLORS.outline}
            fontSize={22}
          />

          {/* Bottom summary circles */}
          {/* Chat bubble icon circle */}
          <SketchCircle cx={500} cy={960} r={45} startFrame={1600} drawDuration={20} stroke={COLORS.gray1} strokeWidth={2} fill={COLORS.gray3} fillOpacity={0.3} />
          <HandWrittenText text="💬 Waits" x={500} y={968} startFrame={1620} durationFrames={15} fontSize={22} fill={COLORS.gray1} fontWeight={700} textAnchor="middle" />

          <SketchArrow x1={548} y1={960} x2={710} y2={960} startFrame={1630} drawDuration={12} color={COLORS.gray1} />

          <SketchCircle cx={760} cy={960} r={45} startFrame={1615} drawDuration={20} stroke={COLORS.blue} strokeWidth={2} fill={COLORS.blue} fillOpacity={0.15} />
          <HandWrittenText text="🤝 Assists" x={760} y={968} startFrame={1635} durationFrames={15} fontSize={22} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />

          <SketchArrow x1={808} y1={960} x2={970} y2={960} startFrame={1645} drawDuration={12} color={COLORS.blue} />

          <SketchCircle cx={1020} cy={960} r={45} startFrame={1625} drawDuration={20} stroke={COLORS.green} strokeWidth={2} fill={COLORS.green} fillOpacity={0.15} />
          <HandWrittenText text="🤖 Drives" x={1020} y={968} startFrame={1650} durationFrames={15} fontSize={22} fill={COLORS.green} fontWeight={700} textAnchor="middle" />
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};

// ─── Scene 6: Goal-Directed Behavior (frames 1740–2160) ───────────────────────
export const Scene6GoalDirected: React.FC = () => (
  <Scene startFrame={1740} endFrame={2160}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        {/* Header */}
        <SketchCircle cx={75} cy={75} r={30} startFrame={1750} drawDuration={20} stroke={COLORS.purple} strokeWidth={3} fill={COLORS.purple} fillOpacity={0.2} />
        <HandWrittenText text="2" x={75} y={84} startFrame={1770} durationFrames={10} fontSize={36} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Goal-Directed Behavior" x={150} y={80} startFrame={1758} durationFrames={30} fontSize={40} fill={COLORS.outline} fontWeight={700} textAnchor="start" />
        <HandWrittenText text="Pursuing outcomes, not just responding" x={960} y={128} startFrame={1778} durationFrames={30} fontSize={28} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

        {/* Left panel: Traditional AI */}
        <SketchBox x={60} y={165} width={750} height={550} startFrame={1790} drawDuration={25} stroke={COLORS.gray2} strokeWidth={2} fill="#f8fafc" fillOpacity={0.8} />
        <HandWrittenText text="Traditional AI" x={435} y={210} startFrame={1808} durationFrames={20} fontSize={32} fill={COLORS.gray1} fontWeight={700} textAnchor="middle" />

        <PersonIcon cx={180} cy={420} scale={1.5} startFrame={1815} drawDuration={40} shirtColor={COLORS.blue} />
        <SketchBox x={225} y={340} width={260} height={55} startFrame={1835} drawDuration={18} stroke={COLORS.gray2} strokeWidth={1.5} fill={COLORS.white} fillOpacity={0.9} />
        <HandWrittenText text={'How do I fix this error?'} x={355} y={374} startFrame={1850} durationFrames={22} fontSize={19} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />

        <SketchArrow x1={490} y1={420} x2={590} y2={420} startFrame={1865} drawDuration={15} color={COLORS.gray1} />

        <SketchBox x={590} y={385} width={200} height={70} startFrame={1875} drawDuration={18} stroke={COLORS.gray1} strokeWidth={2} fill="#f1f5f9" fillOpacity={0.9} />
        <HandWrittenText text="Gives an answer" x={690} y={427} startFrame={1890} durationFrames={20} fontSize={22} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />

        {/* Right panel: Agentic AI */}
        <SketchBox x={870} y={165} width={960} height={700} startFrame={1795} drawDuration={28} stroke={COLORS.purple} strokeWidth={2.5} fill="#faf5ff" fillOpacity={0.6} />
        <HandWrittenText text="Agentic AI" x={1350} y={215} startFrame={1815} durationFrames={20} fontSize={34} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />

        <RobotHead cx={970} cy={320} scale={2} startFrame={1810} drawDuration={45} color="#ede9fe" />

        {/* Goal box */}
        <SketchBox x={1050} y={265} width={700} height={65} startFrame={1840} drawDuration={20} stroke={COLORS.purple} strokeWidth={2} fill="#ede9fe" fillOpacity={0.8} />
        <HandWrittenText text="Fix the null pointer exception" x={1400} y={305} startFrame={1858} durationFrames={25} fontSize={26} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />

        {/* 4 checkmark items */}
        {[
          'Break complex tasks into steps',
          'Adapt plans based on results',
          'Try alternatives when stuck',
          'Know when the goal is achieved',
        ].map((item, i) => {
          const iy = 400 + i * 80;
          const sf = 1880 + i * 35;
          return (
            <g key={i}>
              <CheckMark cx={920} cy={iy} scale={1} startFrame={sf} drawDuration={15} color={COLORS.green} />
              <HandWrittenText text={item} x={960} y={iy + 9} startFrame={sf + 15} durationFrames={22} fontSize={26} fill={COLORS.outline} fontWeight={400} textAnchor="start" />
            </g>
          );
        })}

        {/* Large TargetIcon bottom-right */}
        <TargetIcon cx={1700} cy={750} scale={2.5} startFrame={1960} drawDuration={60} />
      </SVG>
    </AbsoluteFill>
  </Scene>
);

// ─── Scene 7: Tool Use (frames 2160–2550) ────────────────────────────────────
export const Scene7ToolUse: React.FC = () => {
  const leftCards = [
    { text: 'Search the web', bg: '#dbeafe', border: COLORS.blue, dx: -480, dy: -130 },
    { text: 'Query databases', bg: '#fce7f3', border: '#ec4899', dx: -520, dy: 20 },
    { text: 'Call APIs', bg: '#fef9c3', border: COLORS.yellow, dx: -460, dy: 170 },
  ];
  const rightCards = [
    { text: 'Execute code', bg: '#dcfce7', border: COLORS.green, dx: 480, dy: -130 },
    { text: 'Read/write files', bg: '#e0e7ff', border: '#6366f1', dx: 520, dy: 20 },
    { text: 'Run pipelines', bg: '#fef3c7', border: '#d97706', dx: 460, dy: 170 },
  ];

  return (
    <Scene startFrame={2160} endFrame={2550}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          {/* Header */}
          <SketchCircle cx={75} cy={75} r={30} startFrame={2170} drawDuration={20} stroke={COLORS.green} strokeWidth={3} fill={COLORS.green} fillOpacity={0.2} />
          <HandWrittenText text="3" x={75} y={84} startFrame={2190} durationFrames={10} fontSize={36} fill={COLORS.green} fontWeight={700} textAnchor="middle" />
          <HandWrittenText text="Tool Use: Interacting With the Real World" x={155} y={80} startFrame={2178} durationFrames={35} fontSize={38} fill={COLORS.outline} fontWeight={700} textAnchor="start" />
          <HandWrittenText text="Transforms reasoning into action" x={960} y={126} startFrame={2200} durationFrames={28} fontSize={28} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

          {/* Central robot */}
          <RobotHead cx={960} cy={440} scale={3} startFrame={2185} drawDuration={60} color="#dcfce7" />

          {/* Left capability cards */}
          {leftCards.map((card, i) => {
            const cx = 960 + card.dx;
            const cy = 440 + card.dy;
            const sf = 2240 + i * 25;
            return (
              <g key={`l${i}`}>
                <SketchLine x1={960} y1={440} x2={cx + 80} y2={cy} startFrame={sf} drawDuration={15} color="#86efac" strokeWidth={1.5} />
                <SketchBox x={cx - 80} y={cy - 28} width={200} height={56} startFrame={sf + 10} drawDuration={18} stroke={card.border} strokeWidth={2} fill={card.bg} fillOpacity={0.9} />
                <HandWrittenText text={card.text} x={cx + 20} y={cy + 10} startFrame={sf + 28} durationFrames={18} fontSize={24} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
              </g>
            );
          })}

          {/* Right capability cards */}
          {rightCards.map((card, i) => {
            const cx = 960 + card.dx;
            const cy = 440 + card.dy;
            const sf = 2255 + i * 25;
            return (
              <g key={`r${i}`}>
                <SketchLine x1={960} y1={440} x2={cx - 80} y2={cy} startFrame={sf} drawDuration={15} color="#86efac" strokeWidth={1.5} />
                <SketchBox x={cx - 120} y={cy - 28} width={200} height={56} startFrame={sf + 10} drawDuration={18} stroke={card.border} strokeWidth={2} fill={card.bg} fillOpacity={0.9} />
                <HandWrittenText text={card.text} x={cx - 20} y={cy + 10} startFrame={sf + 28} durationFrames={18} fontSize={24} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
              </g>
            );
          })}

          {/* Slack • Jira • GitHub */}
          <HandWrittenText text="Slack • Jira • GitHub" x={960} y={750} startFrame={2400} durationFrames={25} fontSize={28} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

          {/* Orange warning box */}
          <SketchBox x={480} y={820} width={1000} height={70} startFrame={2420} drawDuration={20} stroke={COLORS.orange} strokeWidth={2.5} fill="#fff7ed" fillOpacity={0.9} />
          <HandWrittenText
            text="⚡ Power AND risk — must be properly constrained"
            x={980} y={863}
            startFrame={2438} durationFrames={30}
            fontSize={26} fill={COLORS.orange}
            fontWeight={700} textAnchor="middle"
          />
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};

// ─── Scene 8: Spectrum Table (frames 2550–2940) ───────────────────────────────
export const Scene8SpectrumTable: React.FC = () => {
  const headers = ['Tool', 'Autonomy', 'Goal-Dir.', 'Tool Use', 'Type'];
  const rows = [
    ['ChatGPT', 'Low', 'Low', 'Limited', 'Chatbot'],
    ['GitHub Copilot', 'Low', 'Low', 'No', 'Copilot'],
    ['Cursor Agent', 'Medium', 'Medium', 'Yes', 'Emerging'],
    ['Claude Code', 'High', 'High', 'Yes', 'Agent'],
    ['Devin', 'High', 'High', 'Yes', 'Agent'],
  ];

  return (
    <Scene startFrame={2550} endFrame={2940}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          {/* Title */}
          <HandWrittenText
            text="The Spectrum in Practice (2026)"
            x={960} y={68}
            startFrame={2565} durationFrames={35}
            fontSize={46} fill={COLORS.outline}
            fontWeight={700} textAnchor="middle"
          />
          <SketchLine x1={350} y1={82} x2={1570} y2={82} startFrame={2600} drawDuration={18} color={COLORS.orange} strokeWidth={3} />

          {/* Table */}
          <SketchTable
            headers={headers}
            rows={rows}
            x={240}
            y={108}
            colWidth={320}
            rowHeight={55}
            startFrame={2610}
            framesPerRow={16}
            headerColor={COLORS.outline}
            fontSize={22}
          />

          {/* Highlight arrows for Claude Code and Devin rows (rows 3 & 4, y=108+55*4=328, y=108+55*5=383) */}
          <SketchArrow x1={225} y1={383} x2={246} y2={383} startFrame={2820} drawDuration={15} color={COLORS.orange} strokeWidth={3} />
          <SketchArrow x1={225} y1={438} x2={246} y2={438} startFrame={2825} drawDuration={15} color={COLORS.orange} strokeWidth={3} />

          {/* "True Agents" label */}
          <SketchBox x={60} y={363} width={155} height={95} startFrame={2810} drawDuration={18} stroke={COLORS.orange} strokeWidth={2} fill="#fff7ed" fillOpacity={0.9} />
          <HandWrittenText text="True" x={137} y={398} startFrame={2830} durationFrames={12} fontSize={22} fill={COLORS.orange} fontWeight={700} textAnchor="middle" />
          <HandWrittenText text="Agents" x={137} y={425} startFrame={2838} durationFrames={12} fontSize={22} fill={COLORS.orange} fontWeight={700} textAnchor="middle" />

          {/* Spectrum arrow at bottom */}
          <SketchLine x1={240} y1={960} x2={1700} y2={960} startFrame={2860} drawDuration={20} color={COLORS.gray2} strokeWidth={2} />
          <SketchArrow x1={1680} y1={960} x2={1720} y2={960} startFrame={2876} drawDuration={10} color={COLORS.gray2} strokeWidth={2} />
          <HandWrittenText text="Less autonomous" x={245} y={990} startFrame={2875} durationFrames={20} fontSize={22} fill={COLORS.gray2} fontWeight={400} textAnchor="start" />
          <HandWrittenText text="More autonomous" x={1720} y={990} startFrame={2885} durationFrames={20} fontSize={22} fill={COLORS.gray2} fontWeight={400} textAnchor="end" />
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};

// ─── Scene 9: Claude Code & Devin Spotlight (frames 2940–3300) ────────────────
export const Scene9Spotlight: React.FC = () => {
  const claudeItems = [
    '200K token context window',
    'Multi-file refactors',
    'Execute shell commands',
    'Run tests autonomously',
    '30+ hour complex workflows',
  ];
  const devinItems = [
    'Plans and writes code',
    'Tests and debugs',
    'Deploys in secure sandbox',
    'Works like a junior engineer',
    'Goldman Sachs: 100s of instances',
  ];

  return (
    <Scene startFrame={2940} endFrame={3300}>
      <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
        <SVG>
          {/* Title */}
          <HandWrittenText
            text="Leading Agentic AI Tools"
            x={960} y={68}
            startFrame={2955} durationFrames={30}
            fontSize={48} fill={COLORS.outline}
            fontWeight={700} textAnchor="middle"
          />
          <SketchLine x1={450} y1={82} x2={1470} y2={82} startFrame={2985} drawDuration={18} color={COLORS.orange} strokeWidth={3} />

          {/* Left card: Claude Code */}
          <SketchBox x={60} y={108} width={840} height={780} startFrame={2965} drawDuration={30} stroke={COLORS.orange} strokeWidth={3} fill="#fff7ed" fillOpacity={0.7} />
          <HandWrittenText text="Claude Code" x={480} y={170} startFrame={2988} durationFrames={22} fontSize={42} fill={COLORS.orange} fontWeight={700} textAnchor="middle" />
          <HandWrittenText text="by Anthropic" x={480} y={215} startFrame={3005} durationFrames={18} fontSize={26} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

          <CodeIcon cx={480} cy={360} scale={3} startFrame={2995} drawDuration={55} />

          {claudeItems.map((item, i) => {
            const iy = 500 + i * 72;
            const sf = 3040 + i * 28;
            return (
              <g key={i}>
                <CheckMark cx={105} cy={iy} scale={1} startFrame={sf} drawDuration={14} color={COLORS.green} />
                <HandWrittenText text={item} x={140} y={iy + 9} startFrame={sf + 14} durationFrames={20} fontSize={25} fill={COLORS.outline} fontWeight={400} textAnchor="start" />
              </g>
            );
          })}

          {/* Benchmark box */}
          <SketchBox x={100} y={852} width={720} height={70} startFrame={3190} drawDuration={18} stroke={COLORS.green} strokeWidth={2} fill="#dcfce7" fillOpacity={0.9} />
          <HandWrittenText text="77.2% on SWE-bench Verified" x={460} y={895} startFrame={3205} durationFrames={22} fontSize={24} fill={COLORS.green} fontWeight={700} textAnchor="middle" />

          {/* Right card: Devin */}
          <SketchBox x={1020} y={108} width={840} height={780} startFrame={2970} drawDuration={30} stroke={COLORS.purple} strokeWidth={3} fill="#faf5ff" fillOpacity={0.7} />
          <HandWrittenText text="Devin" x={1440} y={170} startFrame={2990} durationFrames={18} fontSize={42} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />
          <HandWrittenText text="by Cognition Labs" x={1440} y={215} startFrame={3008} durationFrames={20} fontSize={26} fill={COLORS.gray1} fontWeight={400} textAnchor="middle" />

          <CloudIcon cx={1440} cy={355} scale={1.6} startFrame={2998} drawDuration={40} />
          <RobotHead cx={1440} cy={340} scale={1.5} startFrame={3020} drawDuration={40} color="#ede9fe" />

          {devinItems.map((item, i) => {
            const iy = 500 + i * 72;
            const sf = 3048 + i * 28;
            return (
              <g key={i}>
                <CheckMark cx={1062} cy={iy} scale={1} startFrame={sf} drawDuration={14} color={COLORS.purple} />
                <HandWrittenText text={item} x={1098} y={iy + 9} startFrame={sf + 14} durationFrames={20} fontSize={25} fill={COLORS.outline} fontWeight={400} textAnchor="start" />
              </g>
            );
          })}

          {/* Note box */}
          <SketchBox x={1058} y={852} width={720} height={70} startFrame={3195} drawDuration={18} stroke={COLORS.yellow} strokeWidth={2} fill="#fef9c3" fillOpacity={0.9} />
          <HandWrittenText text="Still requires human review" x={1418} y={895} startFrame={3210} durationFrames={22} fontSize={24} fill={COLORS.outline} fontWeight={400} textAnchor="middle" />
        </SVG>
      </AbsoluteFill>
    </Scene>
  );
};

// ─── Scene 10: Closing (frames 3300–3600) ────────────────────────────────────
export const Scene10Closing: React.FC = () => (
  <Scene startFrame={3300} endFrame={3600}>
    <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
      <SVG>
        {/* Large brain at center top */}
        <BrainIcon cx={960} cy={280} scale={5} startFrame={3315} drawDuration={70} />

        {/* Three icons in a row */}
        <RobotHead cx={560} cy={620} scale={2.5} startFrame={3365} drawDuration={50} color="#dbeafe" />
        <TargetIcon cx={960} cy={620} scale={2.5} startFrame={3378} drawDuration={50} />
        <ToolIcon cx={1360} cy={620} scale={2.5} startFrame={3390} drawDuration={50} />

        {/* Labels */}
        <HandWrittenText text="Autonomy" x={560} y={740} startFrame={3408} durationFrames={20} fontSize={30} fill={COLORS.blue} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Goals" x={960} y={740} startFrame={3415} durationFrames={18} fontSize={30} fill={COLORS.purple} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="Tools" x={1360} y={740} startFrame={3422} durationFrames={18} fontSize={30} fill={COLORS.green} fontWeight={700} textAnchor="middle" />

        {/* "+" signs */}
        <HandWrittenText text="+" x={760} y={635} startFrame={3430} durationFrames={10} fontSize={48} fill={COLORS.orange} fontWeight={700} textAnchor="middle" />
        <HandWrittenText text="+" x={1160} y={635} startFrame={3435} durationFrames={10} fontSize={48} fill={COLORS.orange} fontWeight={700} textAnchor="middle" />

        {/* "=" */}
        <HandWrittenText text="=" x={960} y={800} startFrame={3448} durationFrames={10} fontSize={52} fill={COLORS.outline} fontWeight={700} textAnchor="middle" />

        {/* AGENTIC AI */}
        <HandWrittenText
          text="AGENTIC AI"
          x={960} y={890}
          startFrame={3458} durationFrames={35}
          fontSize={72} fill={COLORS.orange}
          fontWeight={700} textAnchor="middle"
        />

        {/* Subtitle */}
        <HandWrittenText
          text="The future of autonomous intelligence"
          x={960} y={960}
          startFrame={3488} durationFrames={35}
          fontSize={30} fill={COLORS.gray1}
          fontWeight={400} textAnchor="middle"
        />

        {/* 5 decorative orange dots */}
        {[840, 880, 920, 960, 1000].map((dotX, i) => {
          const r = 5;
          const k = r * 0.56;
          return (
            <AnimatedPath
              key={i}
              d={`M ${dotX} ${1010 - r} C ${dotX + k} ${1010 - r}, ${dotX + r} ${1010 - k}, ${dotX + r} ${1010} C ${dotX + r} ${1010 + k}, ${dotX + k} ${1010 + r}, ${dotX} ${1010 + r} C ${dotX - k} ${1010 + r}, ${dotX - r} ${1010 + k}, ${dotX - r} ${1010} C ${dotX - r} ${1010 - k}, ${dotX - k} ${1010 - r}, ${dotX} ${1010 - r} Z`}
              startFrame={3520 + i * 8}
              drawDuration={12}
              stroke={COLORS.orange}
              fill={COLORS.orange}
              fillOpacity={1}
            />
          );
        })}
      </SVG>
    </AbsoluteFill>
  </Scene>
);
