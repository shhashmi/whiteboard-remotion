import React from 'react';
import {
  FlowchartBuilder,
  FlowNode,
  FlowEdge,
  layoutFlowchartBuilder,
} from './FlowchartBuilder';
import { COLORS } from '../theme';
import type { CompositeLayoutResult } from '../../asset-index/bounds';

export interface ErrorBackoffFlowProps {
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  maxRetries?: number;
  backoffSeconds?: number[];
  circuitBreaker?: boolean;
  title?: string;
}

function buildNodesAndEdges(
  maxRetries: number,
  backoffSeconds: number[],
  circuitBreaker: boolean,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // Translate from the original absolute layout to an explicit 3×3 grid:
  //   row 0:  call       → ok           → return
  //   row 1:  retry      ← backoff      ·
  //   row 2:  breaker    ·               ·     (only if circuitBreaker)
  const nodes: FlowNode[] = [
    { id: 'call', label: 'Call API', kind: 'box', row: 0, col: 0 },
    { id: 'ok', label: 'Success?', kind: 'diamond', row: 0, col: 1 },
    { id: 'return', label: 'Return result', kind: 'terminal', row: 0, col: 2, color: COLORS.green },
    { id: 'backoff', label: `wait ${backoffSeconds.join('/')}s`, kind: 'box', row: 1, col: 1 },
    { id: 'retry', label: `Retries < ${maxRetries}?`, kind: 'diamond', row: 1, col: 0 },
  ];
  const edges: FlowEdge[] = [
    { from: 'call', to: 'ok' },
    { from: 'ok', to: 'return', label: 'yes' },
    { from: 'ok', to: 'backoff', label: 'no' },
    { from: 'backoff', to: 'retry' },
    { from: 'retry', to: 'call', label: 'yes' },
  ];
  if (circuitBreaker) {
    nodes.push({
      id: 'breaker',
      label: 'Open circuit',
      kind: 'terminal',
      row: 2,
      col: 0,
      color: COLORS.red,
    });
    edges.push({ from: 'retry', to: 'breaker', label: 'no', color: COLORS.red });
  }
  return { nodes, edges };
}

export function layoutErrorBackoffFlow(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  maxRetries?: number;
  backoffSeconds?: number[];
  circuitBreaker?: boolean;
  title?: string;
}): CompositeLayoutResult {
  const { nodes } = buildNodesAndEdges(
    props.maxRetries ?? 3,
    props.backoffSeconds ?? [1, 2, 4],
    props.circuitBreaker ?? true,
  );
  const inner = layoutFlowchartBuilder({
    x: props.x,
    y: props.y,
    w: props.w,
    h: props.h,
    nodes,
    title: props.title ?? 'Retry with Exponential Backoff',
  });
  if (inner.error) {
    return { outer: inner.outer, children: [], error: `ErrorBackoffFlow: ${inner.error}` };
  }
  return inner;
}

export const ErrorBackoffFlow: React.FC<ErrorBackoffFlowProps> = ({
  x,
  y,
  w,
  h,
  startFrame,
  maxRetries = 3,
  backoffSeconds = [1, 2, 4],
  circuitBreaker = true,
  title = 'Retry with Exponential Backoff',
}) => {
  const { nodes, edges } = buildNodesAndEdges(maxRetries, backoffSeconds, circuitBreaker);
  return (
    <FlowchartBuilder
      startFrame={startFrame}
      x={x}
      y={y}
      w={w}
      h={h}
      nodes={nodes}
      edges={edges}
      title={title}
    />
  );
};
