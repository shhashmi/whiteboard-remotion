import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export type CodeRevealMode = 'all' | 'line' | 'char';

export interface CodeBlockProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  code: string;
  language?: string;
  highlightLines?: number[];
  revealMode?: CodeRevealMode;
  lineRevealFrames?: number;
  charsPerFrame?: number;
  title?: string;
}

const PADDING = 24;
const TITLE_H = 56;           // when title/language present
const LINE_NUM_W = 46;
const DEFAULT_FONT_SIZE = 28;
const MIN_FONT_SIZE = 14;
const MONO_CHAR_W_FACTOR = 0.6;

interface CodeBlockGeometry {
  outer: Box;
  fontSize: number;
  lineHeight: number;
  lines: string[];
  title?: string;
  language?: string;
  error?: string;
}

function computeCodeBlockGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  code: string;
  title?: string;
  language?: string;
}): CodeBlockGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const lines = props.code.replace(/\t/g, '  ').split('\n');
  const hasHeader = !!(props.title || props.language);
  const contentH = props.h - 2 * PADDING - (hasHeader ? TITLE_H : 0);
  const contentW = props.w - 2 * PADDING - LINE_NUM_W;
  const maxLineLen = lines.reduce((m, l) => Math.max(m, l.length), 0);

  // Shrink fontSize until lines fit height and longest line fits width.
  const byHeight = lines.length > 0 ? contentH / (lines.length * 1.5) : DEFAULT_FONT_SIZE;
  const byWidth = maxLineLen > 0 ? contentW / (maxLineLen * MONO_CHAR_W_FACTOR) : DEFAULT_FONT_SIZE;
  const fontSize = Math.floor(Math.min(DEFAULT_FONT_SIZE, byHeight, byWidth));

  if (fontSize < MIN_FONT_SIZE) {
    return {
      outer,
      fontSize: MIN_FONT_SIZE,
      lineHeight: MIN_FONT_SIZE * 1.5,
      lines,
      title: props.title,
      language: props.language,
      error:
        `CodeBlock: ${lines.length} lines × longest ${maxLineLen} chars won't fit ` +
        `${Math.floor(props.w)}×${Math.floor(props.h)} at fontSize ≥ ${MIN_FONT_SIZE} ` +
        `(would need ${fontSize}). Widen the rect, trim the code, or break into multiple blocks.`,
    };
  }

  return {
    outer,
    fontSize,
    lineHeight: fontSize * 1.5,
    lines,
    title: props.title,
    language: props.language,
  };
}

export function layoutCodeBlock(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  code: string;
  title?: string;
  language?: string;
}): CompositeLayoutResult {
  const g = computeCodeBlockGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };
  const hasHeader = !!(g.title || g.language);
  const children: CompositeChild[] = [];
  if (hasHeader) {
    children.push({
      kind: 'text',
      bbox: {
        x1: g.outer.x1 + PADDING,
        y1: g.outer.y1 + PADDING,
        x2: g.outer.x2 - PADDING,
        y2: g.outer.y1 + PADDING + TITLE_H - 16,
      },
      label: g.title ?? g.language,
    });
  }
  children.push({
    kind: 'node',
    bbox: {
      x1: g.outer.x1 + PADDING,
      y1: g.outer.y1 + PADDING + (hasHeader ? TITLE_H : 0),
      x2: g.outer.x2 - PADDING,
      y2: g.outer.y2 - PADDING,
    },
    label: 'code',
  });
  return { outer: g.outer, children };
}

export const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    code,
    language,
    highlightLines = [],
    revealMode = 'line',
    lineRevealFrames = 6,
    charsPerFrame = 3,
    title,
  } = props;

  const g = computeCodeBlockGeometry({ x, y, w, h, code, title, language });
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  if (g.error) {
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: w,
            height: h,
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: `2px dashed ${COLORS.red}`,
            color: COLORS.red,
            padding: 20,
            fontFamily: 'Architects Daughter, cursive',
            fontSize: 22,
          }}
        >
          CodeBlock error: {g.error}
        </div>
      </AbsoluteFill>
    );
  }

  const { fontSize, lineHeight, lines } = g;
  const highlightSet = new Set(highlightLines);

  let revealedLines = lines.length;
  let partialLineChars: number | null = null;
  if (revealMode === 'line') {
    revealedLines = Math.min(lines.length, Math.floor(elapsed / lineRevealFrames));
  } else if (revealMode === 'char') {
    const totalChars = Math.floor(elapsed * charsPerFrame);
    let consumed = 0;
    revealedLines = 0;
    for (let i = 0; i < lines.length; i++) {
      if (consumed + lines[i].length + 1 <= totalChars) {
        consumed += lines[i].length + 1;
        revealedLines = i + 1;
      } else {
        partialLineChars = Math.max(0, totalChars - consumed);
        break;
      }
    }
  }

  const opacity = interpolate(elapsed, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          backgroundColor: '#1e293b',
          borderRadius: 14,
          boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
          padding: PADDING,
          fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
          fontSize,
          color: '#e2e8f0',
          lineHeight: `${lineHeight}px`,
          overflow: 'hidden',
        }}
      >
        {(title || language) && (
          <div
            style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: Math.max(18, fontSize * 0.75),
              color: COLORS.gray2,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: COLORS.yellow }}>{title}</span>
            {language && <span>{language}</span>}
          </div>
        )}
        <pre style={{ margin: 0, whiteSpace: 'pre', fontFamily: 'inherit' }}>
          {lines.slice(0, revealedLines).map((line, i) => {
            const isHighlight = highlightSet.has(i + 1);
            return (
              <div
                key={`line-${i}`}
                style={{
                  backgroundColor: isHighlight ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                  borderLeft: isHighlight ? `3px solid ${COLORS.yellow}` : '3px solid transparent',
                  paddingLeft: 10,
                  margin: '0 -10px',
                }}
              >
                <span style={{ color: COLORS.gray2, userSelect: 'none', marginRight: 16 }}>
                  {String(i + 1).padStart(2, ' ')}
                </span>
                {line || ' '}
              </div>
            );
          })}
          {partialLineChars !== null && revealedLines < lines.length && (
            <div>
              <span style={{ color: COLORS.gray2, marginRight: 16 }}>
                {String(revealedLines + 1).padStart(2, ' ')}
              </span>
              {lines[revealedLines].slice(0, partialLineChars)}
            </div>
          )}
        </pre>
      </div>
    </AbsoluteFill>
  );
};
