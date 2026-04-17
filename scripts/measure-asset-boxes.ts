/**
 * Measure on-canvas bounding boxes for every kind:'icon' asset.
 *
 * Strategy: render each icon component to a static SVG via react-dom/server
 * with cx=500, cy=500, scale=1, then walk the resulting SVG primitives and
 * compute (minX, minY, maxX, maxY). Width/height = (max - min). Subtract the
 * (cx, cy) center to express the box in "size at scale=1" terms.
 *
 * Bezier control points are included in the bbox computation, giving a slight
 * over-estimate — that's fine and actively desirable for clearance checks.
 *
 * Remotion is stubbed via Module._cache before any icon is loaded, since
 * `useCurrentFrame()` requires a Composition context that doesn't exist here.
 * The stub returns frame=99999 so all "drawn" states are fully revealed.
 */

import * as path from 'path';
import * as fs from 'fs';
import Module from 'module';

// ── Stub remotion BEFORE any icon import ────────────────────────────────────
const remotionStub = {
  useCurrentFrame: () => 99999,
  useVideoConfig: () => ({ fps: 30, width: 1920, height: 1080, durationInFrames: 1 }),
  interpolate: (_frame: number, _input: number[], output: number[]) =>
    output[output.length - 1],
  spring: () => 1,
  AbsoluteFill: ({ children }: { children?: any }) => children,
  Img: () => null,
  Composition: () => null,
  Sequence: ({ children }: { children?: any }) => children,
  Series: ({ children }: { children?: any }) => children,
  registerRoot: () => {},
};

const remotionResolved = require.resolve('remotion');
require.cache[remotionResolved] = {
  id: remotionResolved,
  filename: remotionResolved,
  loaded: true,
  exports: remotionStub,
  children: [],
  paths: [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// ── Now safe to import React + icons ─────────────────────────────────────────
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ASSET_REGISTRY } from '../src/asset-index/registry';
import * as Icons from '../src/shared/icons';

// ── SVG bbox computation ────────────────────────────────────────────────────

interface BBox { minX: number; minY: number; maxX: number; maxY: number }

const EMPTY: BBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

function expand(b: BBox, x: number, y: number): void {
  if (x < b.minX) b.minX = x;
  if (y < b.minY) b.minY = y;
  if (x > b.maxX) b.maxX = x;
  if (y > b.maxY) b.maxY = y;
}

function pathBBox(d: string, into: BBox): void {
  // Tokenise into commands (single letters) and numbers
  const tokens = d.match(/[a-zA-Z]|[+-]?(?:\d+\.\d+|\.\d+|\d+)(?:[eE][+-]?\d+)?/g) || [];
  let cmd = 'M';
  let cx = 0, cy = 0;
  let startX = 0, startY = 0;
  let i = 0;
  const next = (): number => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const tok = tokens[i];
    if (/[a-zA-Z]/.test(tok)) { cmd = tok; i++; continue; }
    const isRel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    switch (C) {
      case 'M': case 'L': case 'T': {
        const x = next(); const y = next();
        cx = isRel ? cx + x : x; cy = isRel ? cy + y : y;
        if (C === 'M') { startX = cx; startY = cy; }
        expand(into, cx, cy);
        break;
      }
      case 'H': {
        const x = next();
        cx = isRel ? cx + x : x;
        expand(into, cx, cy);
        break;
      }
      case 'V': {
        const y = next();
        cy = isRel ? cy + y : y;
        expand(into, cx, cy);
        break;
      }
      case 'C': {
        const x1 = next(), y1 = next(), x2 = next(), y2 = next(), x = next(), y = next();
        const px = isRel ? cx : 0, py = isRel ? cy : 0;
        expand(into, px + x1, py + y1);
        expand(into, px + x2, py + y2);
        cx = px + x; cy = py + y;
        expand(into, cx, cy);
        break;
      }
      case 'S': case 'Q': {
        const x1 = next(), y1 = next(), x = next(), y = next();
        const px = isRel ? cx : 0, py = isRel ? cy : 0;
        expand(into, px + x1, py + y1);
        cx = px + x; cy = py + y;
        expand(into, cx, cy);
        break;
      }
      case 'A': {
        const rx = next(), ry = next();
        next(); next(); next();        // rotation, large-arc, sweep
        const x = next(), y = next();
        const prevCx = cx, prevCy = cy;
        cx = isRel ? cx + x : x; cy = isRel ? cy + y : y;
        expand(into, cx, cy);
        // Approximate arc bulge via midpoint + rx/ry offsets (conservative)
        const midX = (prevCx + cx) / 2, midY = (prevCy + cy) / 2;
        expand(into, midX - rx, midY - ry);
        expand(into, midX + rx, midY + ry);
        break;
      }
      case 'Z': {
        cx = startX; cy = startY;
        break;
      }
      default:
        i++; // skip unknown single token
    }
  }
}

const NUM = '([+-]?(?:\\d+\\.\\d+|\\.\\d+|\\d+)(?:[eE][+-]?\\d+)?)';

function svgBBox(svg: string): BBox | null {
  const b: BBox = { ...EMPTY };

  // <path d="..."/>
  const pathRe = /<path\b[^>]*\bd\s*=\s*"([^"]+)"/g;
  for (let m; (m = pathRe.exec(svg)); ) pathBBox(m[1], b);

  // <circle cx cy r/>
  const circRe = new RegExp(`<circle\\b[^>]*\\bcx\\s*=\\s*"${NUM}"[^>]*\\bcy\\s*=\\s*"${NUM}"[^>]*\\br\\s*=\\s*"${NUM}"`, 'g');
  for (let m; (m = circRe.exec(svg)); ) {
    const cx = +m[1], cy = +m[2], r = +m[3];
    expand(b, cx - r, cy - r); expand(b, cx + r, cy + r);
  }

  // <ellipse cx cy rx ry/>
  const elRe = new RegExp(`<ellipse\\b[^>]*\\bcx\\s*=\\s*"${NUM}"[^>]*\\bcy\\s*=\\s*"${NUM}"[^>]*\\brx\\s*=\\s*"${NUM}"[^>]*\\bry\\s*=\\s*"${NUM}"`, 'g');
  for (let m; (m = elRe.exec(svg)); ) {
    const cx = +m[1], cy = +m[2], rx = +m[3], ry = +m[4];
    expand(b, cx - rx, cy - ry); expand(b, cx + rx, cy + ry);
  }

  // <rect x y width height/>
  const rectRe = new RegExp(`<rect\\b[^>]*\\bx\\s*=\\s*"${NUM}"[^>]*\\by\\s*=\\s*"${NUM}"[^>]*\\bwidth\\s*=\\s*"${NUM}"[^>]*\\bheight\\s*=\\s*"${NUM}"`, 'g');
  for (let m; (m = rectRe.exec(svg)); ) {
    const x = +m[1], y = +m[2], w = +m[3], h = +m[4];
    expand(b, x, y); expand(b, x + w, y + h);
  }

  // <line x1 y1 x2 y2/>
  const lineRe = new RegExp(`<line\\b[^>]*\\bx1\\s*=\\s*"${NUM}"[^>]*\\by1\\s*=\\s*"${NUM}"[^>]*\\bx2\\s*=\\s*"${NUM}"[^>]*\\by2\\s*=\\s*"${NUM}"`, 'g');
  for (let m; (m = lineRe.exec(svg)); ) {
    expand(b, +m[1], +m[2]); expand(b, +m[3], +m[4]);
  }

  // <polygon points="x,y x,y..."/> and <polyline points="...">
  const polyRe = /<(?:polygon|polyline)\b[^>]*\bpoints\s*=\s*"([^"]+)"/g;
  for (let m; (m = polyRe.exec(svg)); ) {
    const nums = m[1].match(/[+-]?(?:\d+\.\d+|\.\d+|\d+)/g) || [];
    for (let k = 0; k + 1 < nums.length; k += 2) expand(b, +nums[k], +nums[k + 1]);
  }

  return b.minX === Infinity ? null : b;
}

// ── Walk the registry, render each icon, measure ────────────────────────────

const CX = 500, CY = 500;
const PROBE_SCALES = [1, 2]; // measure at two scales and confirm linear

interface MeasuredEntry { id: string; name: string; width: number; height: number; parametric?: boolean }
const measured: Record<string, MeasuredEntry> = {};
const parametric: string[] = [];
const skipped: string[] = [];

function isFinitePositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

for (const entry of ASSET_REGISTRY) {
  if (entry.kind !== 'icon') continue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = (Icons as any)[entry.name];
  if (typeof Comp !== 'function') {
    skipped.push(`${entry.id} ${entry.name} (export not found)`);
    continue;
  }
  try {
    const boxes: BBox[] = [];
    for (const s of PROBE_SCALES) {
      const element = React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg' },
        React.createElement(Comp, { cx: CX, cy: CY, scale: s, startFrame: 0, drawDuration: 20 }),
      );
      const html = renderToStaticMarkup(element);
      const b = svgBBox(html);
      if (!b) break;
      boxes.push(b);
    }
    if (boxes.length !== PROBE_SCALES.length) {
      // No primitives rendered → almost certainly a parametric icon needing
      // caller-supplied dimensions (width/height/x1/y1/...). Mark as parametric
      // so the registry merger leaves defaultBox unset and falls back to sizingNotes.
      parametric.push(`${entry.id} ${entry.name}`);
      measured[entry.id] = { id: entry.id, name: entry.name, width: 0, height: 0, parametric: true };
      continue;
    }
    const w1 = boxes[0].maxX - boxes[0].minX;
    const h1 = boxes[0].maxY - boxes[0].minY;
    const w2 = boxes[1].maxX - boxes[1].minX;
    const h2 = boxes[1].maxY - boxes[1].minY;
    if (!isFinitePositive(w1) || !isFinitePositive(h1) || !isFinitePositive(w2) || !isFinitePositive(h2)) {
      parametric.push(`${entry.id} ${entry.name}`);
      measured[entry.id] = { id: entry.id, name: entry.name, width: 0, height: 0, parametric: true };
      continue;
    }
    const width = Math.ceil(Math.max(w1, w2 / 2));
    const height = Math.ceil(Math.max(h1, h2 / 2));
    measured[entry.id] = { id: entry.id, name: entry.name, width, height };
  } catch (err) {
    // Render-time crash usually means a required prop is missing — also parametric.
    parametric.push(`${entry.id} ${entry.name} (render error: ${(err as Error).message})`);
    measured[entry.id] = { id: entry.id, name: entry.name, width: 0, height: 0, parametric: true };
  }
}

const outPath = path.join(__dirname, '..', 'src', 'asset-index', 'measured-boxes.json');
fs.writeFileSync(outPath, JSON.stringify(measured, null, 2) + '\n');

const ok = Object.values(measured).filter((m) => !m.parametric).length;
const totalIcons = ASSET_REGISTRY.filter((e) => e.kind === 'icon').length;
console.log(`Measured ${ok}/${totalIcons} icons → ${path.relative(process.cwd(), outPath)}`);
if (parametric.length) {
  console.warn(`Parametric icons (need sizingNotes, not defaultBox): ${parametric.length}`);
  for (const s of parametric) console.warn(`  - ${s}`);
}
if (skipped.length) {
  console.warn(`Skipped ${skipped.length}:`);
  for (const s of skipped) console.warn(`  - ${s}`);
}
