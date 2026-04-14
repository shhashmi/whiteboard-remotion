import React from 'react';
import { SketchTable, HandWrittenText } from '../components';
import { COLORS } from '../theme';

export interface ComparisonTableProps {
  startFrame: number;
  columns: string[];
  rows: string[][];
  highlightCells?: Array<[number, number]>;
  x?: number;
  y?: number;
  colWidth?: number;
  rowHeight?: number;
  fontSize?: number;
  title?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  startFrame,
  columns,
  rows,
  highlightCells = [],
  x = 160,
  y = 220,
  colWidth,
  rowHeight = 72,
  fontSize = 28,
  title,
}) => {
  const fittedColWidth = colWidth ?? Math.floor((1920 - x * 2) / columns.length);
  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={x + (fittedColWidth * columns.length) / 2}
          y={y - 80}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={42}
          fill={COLORS.outline}
          textAnchor="middle"
        />
      )}
      <SketchTable
        headers={columns}
        rows={rows}
        x={x}
        y={y}
        colWidth={fittedColWidth}
        rowHeight={rowHeight}
        fontSize={fontSize}
        startFrame={startFrame + 15}
      />
      {highlightCells.map(([r, c], i) => {
        const cx = x + c * fittedColWidth + fittedColWidth / 2;
        const cy = y + (r + 1) * rowHeight + rowHeight / 2;
        return (
          <rect
            key={`hc-${i}`}
            x={cx - fittedColWidth / 2 + 4}
            y={cy - rowHeight / 2 + 2}
            width={fittedColWidth - 8}
            height={rowHeight - 4}
            fill={COLORS.yellow}
            opacity={0.35}
            rx={6}
          />
        );
      })}
    </g>
  );
};
