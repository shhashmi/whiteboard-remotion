import React from 'react';
import {
  Scene,
  AnimatedPath,
  HandWrittenText,
  SketchBox,
  SketchCircle,
  SketchArrow,
  BookIcon,
  MonitorIcon,
  PersonIcon,
  Lightbulb,
  GearIcon,
  SpeechBubble,
  BarChart,
  ClockIcon,
  DocStack,
  COLORS,
} from '../shared/components';

// ─── Scene 1: Manual → Video (frames 0-210) ───────────────────────────────────
export const Scene1: React.FC = () => {
  const BASE = 0;
  return (
    <Scene startFrame={BASE} endFrame={BASE + 210}>
      <svg width={1080} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Left: Book */}
        <BookIcon cx={280} cy={340} scale={2.5} startFrame={BASE + 5} drawDuration={60} color={COLORS.blue} label="ONBOARDING" />
        <HandWrittenText
          text="ONBOARDING MANUAL"
          x={280}
          y={480}
          startFrame={BASE + 50}
          endFrame={BASE + 90}
          fontSize={22}
          fill={COLORS.outline}
          textAnchor="middle"
        />

        {/* Center: Arrow */}
        <SketchArrow
          x1={430} y1={340} x2={590} y2={340}
          startFrame={BASE + 30}
          drawDuration={25}
          stroke={COLORS.blue}
          strokeWidth={4}
          headSize={16}
        />

        {/* Right: Monitor */}
        <MonitorIcon cx={720} cy={340} scale={2.8} startFrame={BASE + 55} drawDuration={60} />

        {/* Lightbulb above monitor */}
        <Lightbulb cx={720} cy={150} scale={1.2} startFrame={BASE + 100} drawDuration={40} />

        {/* Speech bubble */}
        <SpeechBubble
          cx={720}
          cy={315}
          width={140}
          height={60}
          startFrame={BASE + 115}
          drawDuration={25}
          fill={COLORS.purple}
          text="Watch &amp; Learn"
          text2="Anytime!"
        />

        {/* Label right */}
        <HandWrittenText
          text="Engaging Video"
          x={720}
          y={510}
          startFrame={BASE + 130}
          endFrame={BASE + 170}
          fontSize={22}
          fill={COLORS.outline}
          textAnchor="middle"
        />

        {/* Scene title */}
        <HandWrittenText
          text="Turn manuals into videos"
          x={540}
          y={650}
          startFrame={BASE + 150}
          endFrame={BASE + 200}
          fontSize={28}
          fill={COLORS.blue}
          textAnchor="middle"
        />
      </svg>
    </Scene>
  );
};

// ─── Scene 2: Documents → Engaging Video (frames 210-420) ────────────────────
export const Scene2: React.FC = () => {
  const BASE = 210;
  return (
    <Scene startFrame={BASE} endFrame={BASE + 210}>
      <svg width={1080} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Left: DocStack */}
        <DocStack cx={270} cy={340} scale={2.5} startFrame={BASE + 5} drawDuration={70} />
        {/* Gear overlay */}
        <GearIcon cx={350} cy={250} scale={1.4} startFrame={BASE + 60} drawDuration={40} color={COLORS.gold} />

        {/* Label left */}
        <HandWrittenText
          text="Your Documents"
          x={270}
          y={500}
          startFrame={BASE + 70}
          endFrame={BASE + 110}
          fontSize={24}
          fill={COLORS.outline}
          textAnchor="middle"
        />

        {/* Center: Arrow */}
        <SketchArrow
          x1={430} y1={340} x2={590} y2={340}
          startFrame={BASE + 50}
          drawDuration={25}
          stroke={COLORS.orange}
          strokeWidth={4}
          headSize={16}
        />

        {/* Right: Monitor + Lightbulb */}
        <MonitorIcon cx={750} cy={340} scale={2.8} startFrame={BASE + 75} drawDuration={60} />
        <Lightbulb cx={750} cy={150} scale={1.2} startFrame={BASE + 120} drawDuration={35} />

        {/* Label right */}
        <HandWrittenText
          text="Engaging Video"
          x={750}
          y={505}
          startFrame={BASE + 135}
          endFrame={BASE + 175}
          fontSize={24}
          fill={COLORS.outline}
          textAnchor="middle"
        />

        {/* Bottom title */}
        <HandWrittenText
          text="Any document becomes a video"
          x={540}
          y={640}
          startFrame={BASE + 155}
          endFrame={BASE + 200}
          fontSize={26}
          fill={COLORS.green}
          textAnchor="middle"
        />
      </svg>
    </Scene>
  );
};

// ─── Scene 3: Narration in Dozens of Languages (frames 420-630) ──────────────
export const Scene3: React.FC = () => {
  const BASE = 420;

  const bubbles = [
    { cx: 680, cy: 200, r: 55, letter: 'A', color: COLORS.red },
    { cx: 800, cy: 290, r: 55, letter: '文', color: COLORS.blue },
    { cx: 680, cy: 400, r: 55, letter: '~', color: COLORS.green },
    { cx: 800, cy: 490, r: 55, letter: 'б', color: COLORS.orange },
  ];

  return (
    <Scene startFrame={BASE} endFrame={BASE + 210}>
      <svg width={1080} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Title */}
        <HandWrittenText
          text="With narration in"
          x={540}
          y={80}
          startFrame={BASE + 5}
          endFrame={BASE + 40}
          fontSize={44}
          fill={COLORS.outline}
          textAnchor="middle"
        />
        <HandWrittenText
          text="dozens of languages"
          x={540}
          y={130}
          startFrame={BASE + 25}
          endFrame={BASE + 65}
          fontSize={44}
          fill={COLORS.blue}
          textAnchor="middle"
        />

        {/* Person left */}
        <PersonIcon cx={260} cy={400} scale={2} startFrame={BASE + 40} drawDuration={55} shirtColor={COLORS.yellow} />

        {/* Speech circles */}
        {bubbles.map((b, i) => (
          <g key={i}>
            <SketchCircle
              cx={b.cx} cy={b.cy} r={b.r}
              startFrame={BASE + 80 + i * 18}
              drawDuration={22}
              stroke={b.color}
              strokeWidth={3}
              fill={b.color}
              fillOpacity={0.12}
            />
            {/* Tail from person */}
            <AnimatedPath
              d={`M ${260 + 40} ${400 - 20} Q ${(260 + b.cx) / 2} ${(400 + b.cy) / 2 - 20}, ${b.cx - b.r * 0.7} ${b.cy}`}
              startFrame={BASE + 80 + i * 18}
              drawDuration={15}
              stroke={b.color}
              strokeWidth={1.5}
            />
            <HandWrittenText
              text={b.letter}
              x={b.cx}
              y={b.cy + 12}
              startFrame={BASE + 100 + i * 18}
              endFrame={BASE + 125 + i * 18}
              fontSize={36}
              fill={b.color}
              textAnchor="middle"
            />
          </g>
        ))}

        {/* Bottom note */}
        <HandWrittenText
          text="AI-powered voice in your language"
          x={540}
          y={650}
          startFrame={BASE + 160}
          endFrame={BASE + 205}
          fontSize={26}
          fill={COLORS.purple}
          textAnchor="middle"
        />
      </svg>
    </Scene>
  );
};

// ─── Scene 4: Automating Understanding (frames 630-840) ──────────────────────
export const Scene4: React.FC = () => {
  const BASE = 630;
  return (
    <Scene startFrame={BASE} endFrame={BASE + 210}>
      <svg width={1080} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Presentation board top-left */}
        <SketchBox
          x={60} y={60} width={220} height={160}
          startFrame={BASE + 5}
          drawDuration={30}
          stroke={COLORS.outline}
          fill={COLORS.white}
          fillOpacity={0.9}
        />
        {/* Board stand */}
        <AnimatedPath
          d={`M ${170} ${220} L ${150} ${270} M ${170} ${220} L ${190} ${270}`}
          startFrame={BASE + 30}
          drawDuration={15}
          stroke={COLORS.outline}
          strokeWidth={3}
        />
        {/* Board content */}
        <SketchBox
          x={80} y={80} width={90} height={50}
          startFrame={BASE + 35}
          drawDuration={20}
          stroke={COLORS.outline}
          fill={COLORS.yellow}
          fillOpacity={0.5}
        />
        <AnimatedPath
          d={`M ${185} ${95} L ${260} ${95} M ${185} ${110} L ${250} ${110} M ${185} ${125} L ${255} ${125}`}
          startFrame={BASE + 50}
          drawDuration={20}
          stroke={COLORS.outline}
          strokeWidth={2}
        />

        {/* Clock top-right */}
        <ClockIcon cx={870} cy={170} scale={2.2} startFrame={BASE + 10} drawDuration={55} />

        {/* Center person */}
        <PersonIcon cx={490} cy={430} scale={2.5} startFrame={BASE + 55} drawDuration={65} shirtColor={COLORS.red} />

        {/* Right: 3 stacked books */}
        <BookIcon cx={820} cy={430} scale={1.6} startFrame={BASE + 70} drawDuration={30} color={COLORS.green} />
        <BookIcon cx={820} cy={500} scale={1.6} startFrame={BASE + 90} drawDuration={30} color={COLORS.yellow} />
        <BookIcon cx={820} cy={570} scale={1.6} startFrame={BASE + 110} drawDuration={30} color={COLORS.red} />

        {/* Bottom bold title */}
        <HandWrittenText
          text="AUTOMATING UNDERSTANDING"
          x={540}
          y={665}
          startFrame={BASE + 130}
          endFrame={BASE + 195}
          fontSize={48}
          fill={COLORS.outline}
          fontWeight={700}
          textAnchor="middle"
        />
      </svg>
    </Scene>
  );
};

// ─── Scene 5: Final Message (frames 840-1080) ─────────────────────────────────
export const Scene5: React.FC = () => {
  const BASE = 840;

  const lines = [
    { text: 'THIS IS HOW', color: COLORS.outline },
    { text: 'INSTITUTIONAL', color: COLORS.outline },
    { text: 'KNOWLEDGE', color: COLORS.outline },
    { text: 'FINALLY', color: COLORS.outline },
    { text: 'KEEPS PACE', color: COLORS.outline },
    { text: 'WITH BUSINESS', color: COLORS.blue },
  ];

  return (
    <Scene startFrame={BASE} endFrame={BASE + 240}>
      <svg width={1080} height={720} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Clock top-left */}
        <ClockIcon cx={160} cy={170} scale={2.8} startFrame={BASE + 5} drawDuration={55} />

        {/* Two upward curved arrows from book icons */}
        <BookIcon cx={200} cy={530} scale={1.5} startFrame={BASE + 20} drawDuration={30} color={COLORS.blue} />
        <BookIcon cx={290} cy={560} scale={1.5} startFrame={BASE + 30} drawDuration={30} color={COLORS.green} />

        {/* Red curved arrow */}
        <AnimatedPath
          d={`M ${200} ${490} Q ${220} ${380}, ${300} ${280}`}
          startFrame={BASE + 60}
          drawDuration={30}
          stroke={COLORS.red}
          strokeWidth={3}
        />
        <SketchArrow
          x1={295} y1={295}
          x2={310} y2={270}
          startFrame={BASE + 88}
          drawDuration={12}
          stroke={COLORS.red}
          strokeWidth={3}
          headSize={10}
        />

        {/* Green curved arrow */}
        <AnimatedPath
          d={`M ${290} ${520} Q ${330} ${410}, ${420} ${310}`}
          startFrame={BASE + 70}
          drawDuration={30}
          stroke={COLORS.green}
          strokeWidth={3}
        />
        <SketchArrow
          x1={415} y1={322}
          x2={432} y2={298}
          startFrame={BASE + 98}
          drawDuration={12}
          stroke={COLORS.green}
          strokeWidth={3}
          headSize={10}
        />

        {/* Center Lightbulb */}
        <Lightbulb cx={490} cy={300} scale={2.2} startFrame={BASE + 55} drawDuration={55} />

        {/* BarChart bottom-right */}
        <BarChart cx={870} cy={530} scale={2} startFrame={BASE + 80} drawDuration={90} />

        {/* Right side stacked text */}
        {lines.map((line, i) => (
          <HandWrittenText
            key={i}
            text={line.text}
            x={840}
            y={120 + i * 58}
            startFrame={BASE + 110 + i * 18}
            endFrame={BASE + 145 + i * 18}
            fontSize={44}
            fill={line.color}
            fontWeight={700}
            textAnchor="middle"
          />
        ))}
      </svg>
    </Scene>
  );
};
