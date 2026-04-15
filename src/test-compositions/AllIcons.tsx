import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SVG, COLORS } from '../shared/components';
import * as Icons from '../shared/icons';

const BG = '#fafaf5';

type IconEntry = {
  name: string;
  render: (cx: number, cy: number, startFrame: number) => React.ReactNode;
};

const ICON_SCALE = 0.45;
const DRAW = 18;

// All icons in the library. Some need extra props (number, steps, etc.) — those
// get sensible defaults so every icon renders with just (cx, cy, startFrame).
const ENTRIES: IconEntry[] = [
  // technology
  { name: 'RobotHead', render: (cx, cy, sf) => <Icons.RobotHead cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ToolIcon', render: (cx, cy, sf) => <Icons.ToolIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'DatabaseIcon', render: (cx, cy, sf) => <Icons.DatabaseIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CodeIcon', render: (cx, cy, sf) => <Icons.CodeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CloudIcon', render: (cx, cy, sf) => <Icons.CloudIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MonitorIcon', render: (cx, cy, sf) => <Icons.MonitorIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'GearIcon', render: (cx, cy, sf) => <Icons.GearIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'KeyboardIcon', render: (cx, cy, sf) => <Icons.KeyboardIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MobilePhone', render: (cx, cy, sf) => <Icons.MobilePhone cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ServerRack', render: (cx, cy, sf) => <Icons.ServerRack cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'EnvelopeIcon', render: (cx, cy, sf) => <Icons.EnvelopeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'WiFiSignal', render: (cx, cy, sf) => <Icons.WiFiSignal cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'GridIcon', render: (cx, cy, sf) => <Icons.GridIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'RadarSensorIcon', render: (cx, cy, sf) => <Icons.RadarSensorIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'SensorEyeIcon', render: (cx, cy, sf) => <Icons.SensorEyeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // people
  { name: 'PersonIcon', render: (cx, cy, sf) => <Icons.PersonIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PersonSitting', render: (cx, cy, sf) => <Icons.PersonSitting cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PersonPresenting', render: (cx, cy, sf) => <Icons.PersonPresenting cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TwoPersons', render: (cx, cy, sf) => <Icons.TwoPersons cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TeamGroup', render: (cx, cy, sf) => <Icons.TeamGroup cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // actions
  { name: 'UploadIcon', render: (cx, cy, sf) => <Icons.UploadIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'DownloadIcon', render: (cx, cy, sf) => <Icons.DownloadIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'SyncIcon', render: (cx, cy, sf) => <Icons.SyncIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PlayIcon', render: (cx, cy, sf) => <Icons.PlayIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PauseIcon', render: (cx, cy, sf) => <Icons.PauseIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ExpandIcon', render: (cx, cy, sf) => <Icons.ExpandIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ShareIcon', render: (cx, cy, sf) => <Icons.ShareIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // transport
  { name: 'CarIcon', render: (cx, cy, sf) => <Icons.CarIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'AutonomousCarIcon', render: (cx, cy, sf) => <Icons.AutonomousCarIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'AirplaneIcon', render: (cx, cy, sf) => <Icons.AirplaneIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ShipIcon', render: (cx, cy, sf) => <Icons.ShipIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BicycleIcon', render: (cx, cy, sf) => <Icons.BicycleIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // abstract
  { name: 'BrainIcon', render: (cx, cy, sf) => <Icons.BrainIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TargetIcon', render: (cx, cy, sf) => <Icons.TargetIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BookIcon', render: (cx, cy, sf) => <Icons.BookIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'Lightbulb', render: (cx, cy, sf) => <Icons.Lightbulb cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ClockIcon', render: (cx, cy, sf) => <Icons.ClockIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'SpeechBubble', render: (cx, cy, sf) => <Icons.SpeechBubble cx={cx} cy={cy} width={70} height={45} startFrame={sf} drawDuration={DRAW} text="hi" /> },
  { name: 'LockIcon', render: (cx, cy, sf) => <Icons.LockIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ShieldIcon', render: (cx, cy, sf) => <Icons.ShieldIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MagnifyingGlass', render: (cx, cy, sf) => <Icons.MagnifyingGlass cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'WarningTriangle', render: (cx, cy, sf) => <Icons.WarningTriangle cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PuzzlePiece', render: (cx, cy, sf) => <Icons.PuzzlePiece cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'StarIcon', render: (cx, cy, sf) => <Icons.StarIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'FlagIcon', render: (cx, cy, sf) => <Icons.FlagIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MirrorIcon', render: (cx, cy, sf) => <Icons.MirrorIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'NumberBadge', render: (cx, cy, sf) => <Icons.NumberBadge cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} number={1} /> },
  { name: 'EyeIcon', render: (cx, cy, sf) => <Icons.EyeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'LightningBoltIcon', render: (cx, cy, sf) => <Icons.LightningBoltIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // structure
  { name: 'ScaleIcon', render: (cx, cy, sf) => <Icons.ScaleIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TreeDiagram', render: (cx, cy, sf) => <Icons.TreeDiagram cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'StackedLayers', render: (cx, cy, sf) => <Icons.StackedLayers cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'NetworkGraph', render: (cx, cy, sf) => <Icons.NetworkGraph cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BlueprintIcon', render: (cx, cy, sf) => <Icons.BlueprintIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // finance
  { name: 'CoinIcon', render: (cx, cy, sf) => <Icons.CoinIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'WalletIcon', render: (cx, cy, sf) => <Icons.WalletIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BankIcon', render: (cx, cy, sf) => <Icons.BankIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CreditCardIcon', render: (cx, cy, sf) => <Icons.CreditCardIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'DollarSignIcon', render: (cx, cy, sf) => <Icons.DollarSignIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // flow
  { name: 'CycleArrow', render: (cx, cy, sf) => <Icons.CycleArrow cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'FlowChain', render: (cx, cy, sf) => <Icons.FlowChain cx={cx} cy={cy} scale={ICON_SCALE * 0.6} startFrame={sf} drawDuration={DRAW} steps={['A', 'B', 'C']} /> },
  { name: 'FunnelIcon', render: (cx, cy, sf) => <Icons.FunnelIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'DecisionDiamond', render: (cx, cy, sf) => <Icons.DecisionDiamond cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // nature
  { name: 'GrowthTransformIcon', render: (cx, cy, sf) => <Icons.GrowthTransformIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MountainPeakIcon', render: (cx, cy, sf) => <Icons.MountainPeakIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'WaveIcon', render: (cx, cy, sf) => <Icons.WaveIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'FlameIcon', render: (cx, cy, sf) => <Icons.FlameIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'SunIcon', render: (cx, cy, sf) => <Icons.SunIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MoonIcon', render: (cx, cy, sf) => <Icons.MoonIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // places
  { name: 'FactoryIcon', render: (cx, cy, sf) => <Icons.FactoryIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ShoppingCartIcon', render: (cx, cy, sf) => <Icons.ShoppingCartIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'HandshakeIcon', render: (cx, cy, sf) => <Icons.HandshakeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'SatelliteIcon', render: (cx, cy, sf) => <Icons.SatelliteIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'WindmillIcon', render: (cx, cy, sf) => <Icons.WindmillIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'RecycleIcon', render: (cx, cy, sf) => <Icons.RecycleIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BridgeIcon', render: (cx, cy, sf) => <Icons.BridgeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CircuitBoardIcon', render: (cx, cy, sf) => <Icons.CircuitBoardIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // science
  { name: 'DNAEvolutionIcon', render: (cx, cy, sf) => <Icons.DNAEvolutionIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'AtomIcon', render: (cx, cy, sf) => <Icons.AtomIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MicroscopeIcon', render: (cx, cy, sf) => <Icons.MicroscopeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BeakerIcon', render: (cx, cy, sf) => <Icons.BeakerIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MagnetIcon', render: (cx, cy, sf) => <Icons.MagnetIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'GlobeIcon', render: (cx, cy, sf) => <Icons.GlobeIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // communication
  { name: 'ChatbotIcon', render: (cx, cy, sf) => <Icons.ChatbotIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'VideoCallIcon', render: (cx, cy, sf) => <Icons.VideoCallIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'BroadcastIcon', render: (cx, cy, sf) => <Icons.BroadcastIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'AntennaIcon', render: (cx, cy, sf) => <Icons.AntennaIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // business
  { name: 'BarChart', render: (cx, cy, sf) => <Icons.BarChart cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'DocStack', render: (cx, cy, sf) => <Icons.DocStack cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PieChart', render: (cx, cy, sf) => <Icons.PieChart cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'LineGraph', render: (cx, cy, sf) => <Icons.LineGraph cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ProgressBar', render: (cx, cy, sf) => <Icons.ProgressBar cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ProjectPlannerIcon', render: (cx, cy, sf) => <Icons.ProjectPlannerIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // objects
  { name: 'FlowerIcon', render: (cx, cy, sf) => <Icons.FlowerIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CompassIcon', render: (cx, cy, sf) => <Icons.CompassIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'RocketIcon', render: (cx, cy, sf) => <Icons.RocketIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TrophyIcon', render: (cx, cy, sf) => <Icons.TrophyIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CalendarIcon', render: (cx, cy, sf) => <Icons.CalendarIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CameraIcon', render: (cx, cy, sf) => <Icons.CameraIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MegaphoneIcon', render: (cx, cy, sf) => <Icons.MegaphoneIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'HourglassIcon', render: (cx, cy, sf) => <Icons.HourglassIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'AnchorIcon', render: (cx, cy, sf) => <Icons.AnchorIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CrownIcon', render: (cx, cy, sf) => <Icons.CrownIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ScissorsIcon', render: (cx, cy, sf) => <Icons.ScissorsIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'GiftIcon', render: (cx, cy, sf) => <Icons.GiftIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MusicNoteIcon', render: (cx, cy, sf) => <Icons.MusicNoteIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PaintBrushIcon', render: (cx, cy, sf) => <Icons.PaintBrushIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'PencilIcon', render: (cx, cy, sf) => <Icons.PencilIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'FolderIcon', render: (cx, cy, sf) => <Icons.FolderIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TrashIcon', render: (cx, cy, sf) => <Icons.TrashIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'TagIcon', render: (cx, cy, sf) => <Icons.TagIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'MicrophoneIcon', render: (cx, cy, sf) => <Icons.MicrophoneIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'SpeakerIcon', render: (cx, cy, sf) => <Icons.SpeakerIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'HeadphonesIcon', render: (cx, cy, sf) => <Icons.HeadphonesIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'USBPlugIcon', render: (cx, cy, sf) => <Icons.USBPlugIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  // status
  { name: 'SmileyIcon', render: (cx, cy, sf) => <Icons.SmileyIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'ThumbsUpIcon', render: (cx, cy, sf) => <Icons.ThumbsUpIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'HeartIcon', render: (cx, cy, sf) => <Icons.HeartIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'CheckCircleIcon', render: (cx, cy, sf) => <Icons.CheckCircleIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'InfoCircleIcon', render: (cx, cy, sf) => <Icons.InfoCircleIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
  { name: 'NotificationBellIcon', render: (cx, cy, sf) => <Icons.NotificationBellIcon cx={cx} cy={cy} scale={ICON_SCALE} startFrame={sf} drawDuration={DRAW} /> },
];

const COLS = 12;
const MARGIN_X = 80;
const MARGIN_TOP = 40;
const CELL_W = (1920 - MARGIN_X * 2) / COLS;
const CELL_H = 110;
const STAGGER = 3;

export const IconsTest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <SVG>
      {ENTRIES.map((entry, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const cx = MARGIN_X + CELL_W * (col + 0.5);
        const cy = MARGIN_TOP + CELL_H * (row + 0.5) - 10;
        const sf = i * STAGGER;
        return (
          <g key={entry.name}>
            {entry.render(cx, cy, sf)}
            <text
              x={cx}
              y={cy + 50}
              fontSize={11}
              fill={COLORS.outline}
              fontFamily="Architects Daughter, cursive"
              textAnchor="middle"
            >
              {entry.name}
            </text>
          </g>
        );
      })}
    </SVG>
  </AbsoluteFill>
);
