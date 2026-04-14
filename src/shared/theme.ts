export const COLORS = {
  outline: '#1e293b',
  orange: '#f97316',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  yellow: '#fbbf24',
  skin: '#fde2c4',
  hairBrown: '#5a3825',
  hair: '#5a3825',
  gray1: '#64748b',
  gray2: '#94a3b8',
  gray3: '#cbd5e1',
  white: '#ffffff',
  red: '#ef4444',
  gold: '#d4a017',
} as const;

export const SEMANTIC_COLORS = {
  success: COLORS.green,
  warning: COLORS.yellow,
  danger: COLORS.red,
  highlight: COLORS.orange,
  info: COLORS.blue,
  muted: COLORS.gray2,
  canvas: COLORS.white,
  ink: COLORS.outline,
} as const;

export const TYPOGRAPHY = {
  fontFamily: 'Architects Daughter, cursive',
  size: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    display: 96,
  },
  lineHeightRatio: 1.35,
} as const;

export const MOTION = {
  fadeInFrames: 20,
  staggerDelayFrames: 25,
  strokeDrawFrames: 30,
  flowPulseCycleFrames: 30,
  scenePaddingFrames: 10,
} as const;

export const CANVAS = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export type ColorToken = keyof typeof COLORS;
export type SemanticToken = keyof typeof SEMANTIC_COLORS;
export type TypographySize = keyof typeof TYPOGRAPHY.size;
