import React from 'react';
import { SketchTable, HandWrittenText } from '../components';
import { COLORS } from '../theme';
import type { Box, CompositeChild, CompositeLayoutResult } from '../../asset-index/bounds';

export interface ComparisonTableProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  columns: string[];
  rows: string[][];
  highlightCells?: Array<[number, number]>;
  title?: string;
}

const TITLE_H = 80;
const MIN_ROW_H = 48;
const MIN_COL_W = 140;
const MIN_FONT_SIZE = 18;
const DEFAULT_FONT_SIZE = 28;
const CHAR_WIDTH_FACTOR = 0.55;
const CELL_PAD = 16;

interface ComparisonTableGeometry {
  outer: Box;
  tableX: number;
  tableY: number;
  colWidth: number;
  rowHeight: number;
  fontSize: number;
  columns: string[];
  rows: string[][];
  highlightCells: Array<[number, number]>;
  title?: string;
  titleBbox?: Box;
  tableBbox: Box;
  error?: string;
}

function computeComparisonTableGeometry(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  columns: string[];
  rows: string[][];
  highlightCells?: Array<[number, number]>;
  title?: string;
}): ComparisonTableGeometry {
  const outer: Box = { x1: props.x, y1: props.y, x2: props.x + props.w, y2: props.y + props.h };
  const hasTitle = !!props.title;
  const titleBbox: Box | undefined = hasTitle
    ? { x1: outer.x1, y1: outer.y1, x2: outer.x2, y2: outer.y1 + TITLE_H }
    : undefined;

  const nCols = props.columns.length;
  const nRows = props.rows.length;
  if (nCols < 1 || nRows < 1) {
    return {
      outer,
      tableX: 0,
      tableY: 0,
      colWidth: 0,
      rowHeight: 0,
      fontSize: MIN_FONT_SIZE,
      columns: props.columns,
      rows: props.rows,
      highlightCells: props.highlightCells ?? [],
      tableBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      error: 'ComparisonTable requires at least 1 column and 1 row',
    };
  }

  const contentY1 = outer.y1 + (hasTitle ? TITLE_H : 0);
  const availW = props.w;
  const availH = outer.y2 - contentY1;

  const colWidth = Math.floor(availW / nCols);
  const rowHeight = Math.floor(availH / (nRows + 1)); // +1 for header row

  if (colWidth < MIN_COL_W) {
    const needW = Math.ceil(nCols * MIN_COL_W);
    return {
      outer,
      tableX: 0,
      tableY: 0,
      colWidth: 0,
      rowHeight: 0,
      fontSize: MIN_FONT_SIZE,
      columns: props.columns,
      rows: props.rows,
      highlightCells: props.highlightCells ?? [],
      tableBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      error: `ComparisonTable with ${nCols} cols requires width ≥ ${needW}px; got ${Math.floor(props.w)}px`,
    };
  }
  if (rowHeight < MIN_ROW_H) {
    const needH = Math.ceil((nRows + 1) * MIN_ROW_H + (hasTitle ? TITLE_H : 0));
    return {
      outer,
      tableX: 0,
      tableY: 0,
      colWidth: 0,
      rowHeight: 0,
      fontSize: MIN_FONT_SIZE,
      columns: props.columns,
      rows: props.rows,
      highlightCells: props.highlightCells ?? [],
      tableBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      error: `ComparisonTable with ${nRows} rows + header requires height ≥ ${needH}px; got ${Math.floor(props.h)}px`,
    };
  }

  // Pick fontSize so longest cell text fits in (colWidth - 2*CELL_PAD).
  let longestLen = 0;
  for (const h of props.columns) longestLen = Math.max(longestLen, h.length);
  for (const r of props.rows) {
    for (const c of r) longestLen = Math.max(longestLen, c.length);
  }
  const availTextW = colWidth - 2 * CELL_PAD;
  const byWidth = longestLen > 0 ? availTextW / (longestLen * CHAR_WIDTH_FACTOR) : DEFAULT_FONT_SIZE;
  const byHeight = rowHeight * 0.7;
  const fontSize = Math.max(MIN_FONT_SIZE, Math.floor(Math.min(DEFAULT_FONT_SIZE, byWidth, byHeight)));

  if (fontSize < MIN_FONT_SIZE) {
    return {
      outer,
      tableX: 0,
      tableY: 0,
      colWidth: 0,
      rowHeight: 0,
      fontSize: MIN_FONT_SIZE,
      columns: props.columns,
      rows: props.rows,
      highlightCells: props.highlightCells ?? [],
      tableBbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
      error: `ComparisonTable longest cell (${longestLen} chars) does not fit in ${Math.floor(colWidth)}px col at fontSize ≥ ${MIN_FONT_SIZE}`,
    };
  }

  // Center the table horizontally in the rect.
  const tableWidth = nCols * colWidth;
  const tableHeight = (nRows + 1) * rowHeight;
  const tableX = outer.x1 + Math.floor((props.w - tableWidth) / 2);
  const tableY = contentY1 + Math.floor((availH - tableHeight) / 2);
  const tableBbox: Box = {
    x1: tableX,
    y1: tableY,
    x2: tableX + tableWidth,
    y2: tableY + tableHeight,
  };

  return {
    outer,
    tableX,
    tableY,
    colWidth,
    rowHeight,
    fontSize,
    columns: props.columns,
    rows: props.rows,
    highlightCells: props.highlightCells ?? [],
    title: props.title,
    titleBbox,
    tableBbox,
  };
}

export function layoutComparisonTable(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  columns: string[];
  rows: string[][];
  highlightCells?: Array<[number, number]>;
  title?: string;
}): CompositeLayoutResult {
  const g = computeComparisonTableGeometry(props);
  if (g.error) return { outer: g.outer, children: [], error: g.error };

  const children: CompositeChild[] = [];
  if (g.titleBbox && g.title) children.push({ kind: 'text', bbox: g.titleBbox, label: g.title });
  children.push({ kind: 'node', bbox: g.tableBbox, label: 'table' });
  return { outer: g.outer, children };
}

export const ComparisonTable: React.FC<ComparisonTableProps> = (props) => {
  const {
    x,
    y,
    w,
    h,
    startFrame,
    columns,
    rows,
    highlightCells = [],
    title,
  } = props;

  const g = computeComparisonTableGeometry({ x, y, w, h, columns, rows, highlightCells, title });
  if (g.error) {
    return (
      <g>
        <HandWrittenText
          text="ComparisonTable layout error"
          x={x + w / 2}
          y={y + h / 2 - 16}
          startFrame={startFrame}
          durationFrames={18}
          fontSize={28}
          fill={COLORS.red}
          textAnchor="middle"
        />
        <HandWrittenText
          text={g.error.slice(0, 80)}
          x={x + w / 2}
          y={y + h / 2 + 24}
          startFrame={startFrame + 2}
          durationFrames={18}
          fontSize={18}
          fill={COLORS.red}
          textAnchor="middle"
        />
      </g>
    );
  }

  return (
    <g>
      {title && (
        <HandWrittenText
          text={title}
          x={(g.outer.x1 + g.outer.x2) / 2}
          y={g.outer.y1 + TITLE_H - 24}
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
        x={g.tableX}
        y={g.tableY}
        colWidth={g.colWidth}
        rowHeight={g.rowHeight}
        fontSize={g.fontSize}
        startFrame={startFrame + 15}
      />
      {highlightCells.map(([r, c], i) => {
        const cellX = g.tableX + c * g.colWidth;
        const cellY = g.tableY + (r + 1) * g.rowHeight;
        return (
          <rect
            key={`hc-${i}`}
            x={cellX + 4}
            y={cellY + 2}
            width={g.colWidth - 8}
            height={g.rowHeight - 4}
            fill={COLORS.yellow}
            opacity={0.35}
            rx={6}
          />
        );
      })}
    </g>
  );
};
