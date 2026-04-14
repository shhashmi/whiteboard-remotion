import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../theme';

export type CodeRevealMode = 'all' | 'line' | 'char';

export interface CodeBlockProps {
  startFrame: number;
  code: string;
  language?: string;
  highlightLines?: number[];
  revealMode?: CodeRevealMode;
  lineRevealFrames?: number;
  charsPerFrame?: number;
  x?: number;
  y?: number;
  width?: number;
  fontSize?: number;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  startFrame,
  code,
  language,
  highlightLines = [],
  revealMode = 'line',
  lineRevealFrames = 6,
  charsPerFrame = 3,
  x = 280,
  y = 180,
  width = 1360,
  fontSize = 28,
  title,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const lines = code.replace(/\t/g, '  ').split('\n');
  const lineHeight = fontSize * 1.5;
  const padding = 24;
  const height = padding * 2 + lines.length * lineHeight + (title ? 56 : 0);
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
          width,
          backgroundColor: '#1e293b',
          borderRadius: 14,
          boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
          padding,
          fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
          fontSize,
          color: '#e2e8f0',
          lineHeight: `${lineHeight}px`,
          minHeight: height,
        }}
      >
        {(title || language) && (
          <div
            style={{
              fontFamily: 'Architects Daughter, cursive',
              fontSize: 22,
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
