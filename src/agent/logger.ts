import { inspect } from 'util';

const MAX_STR = 2000;
const FULL = process.env.LOG_FULL_PROMPT === '1';

function ts(): string {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function truncate(s: string, max = MAX_STR): string {
  if (FULL || s.length <= max) return s;
  return `${s.slice(0, max)}…[+${s.length - max} chars]`;
}

function formatData(data?: Record<string, unknown>): string {
  if (!data || Object.keys(data).length === 0) return '';
  const shaped: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    shaped[k] = typeof v === 'string' ? truncate(v) : v;
  }
  return ' ' + inspect(shaped, { depth: 6, colors: false, breakLength: 120, compact: 4 });
}

export function log(tag: string, msg: string, data?: Record<string, unknown>): void {
  console.log(`[${ts()}] [${tag}] ${msg}${formatData(data)}`);
}

export function time(tag: string, label: string, data?: Record<string, unknown>) {
  const t0 = Date.now();
  log(tag, `${label} start`, data);
  return (extra?: Record<string, unknown>) => {
    const elapsedMs = Date.now() - t0;
    log(tag, `${label} end`, { elapsedMs, ...(extra ?? {}) });
    return elapsedMs;
  };
}

export const logger = { log, time, truncate };
