import React from 'react';
import { FlowchartBuilder, FlowNode, FlowEdge } from './FlowchartBuilder';
import { COLORS } from '../theme';

export interface ErrorBackoffFlowProps {
  startFrame: number;
  maxRetries?: number;
  backoffSeconds?: number[];
  circuitBreaker?: boolean;
  title?: string;
}

export const ErrorBackoffFlow: React.FC<ErrorBackoffFlowProps> = ({
  startFrame,
  maxRetries = 3,
  backoffSeconds = [1, 2, 4],
  circuitBreaker = true,
  title = 'Retry with Exponential Backoff',
}) => {
  const nodes: FlowNode[] = [
    { id: 'call', label: 'Call API', kind: 'box', x: 300, y: 220 },
    { id: 'ok', label: 'Success?', kind: 'diamond', x: 700, y: 220 },
    { id: 'return', label: 'Return result', kind: 'terminal', x: 1100, y: 220, color: COLORS.green },
    {
      id: 'backoff',
      label: `wait ${backoffSeconds.join('/')}s`,
      kind: 'box',
      x: 700,
      y: 480,
    },
    {
      id: 'retry',
      label: `Retries < ${maxRetries}?`,
      kind: 'diamond',
      x: 300,
      y: 480,
    },
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
      x: 300,
      y: 780,
      color: COLORS.red,
    });
    edges.push({ from: 'retry', to: 'breaker', label: 'no', color: COLORS.red });
  }

  return (
    <FlowchartBuilder
      startFrame={startFrame}
      nodes={nodes}
      edges={edges}
      title={title}
    />
  );
};
