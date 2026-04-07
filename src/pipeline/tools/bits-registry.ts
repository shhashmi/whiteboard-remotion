import * as fs from 'fs';
import * as path from 'path';

export interface BitSummary {
  id: string;
  name: string;
  description: string;
  tags: string[];
  duration: number;
  width?: number;
  height?: number;
  registryDependencies: string[];
  relevance_score: number;
}

export interface BitEntry extends BitSummary {
  sourceCode: string;
}

interface InventoryEntry {
  exportName: string;
  id: string;
  name: string;
  description: string;
  tags: string[];
  duration: number;
  width?: number;
  height?: number;
  sourcePath: string;
  componentNames: string[];
  registryDependencies: string[];
}

let inventory: InventoryEntry[] | null = null;

function getRemotionBitsRoot(): string {
  // Resolve from node_modules or the file: linked package
  const resolved = require.resolve('remotion-bits/package.json');
  return path.dirname(resolved);
}

function loadInventory(): InventoryEntry[] {
  if (inventory) return inventory;
  // Load the generated inventory from the built package
  const inventoryModule = require(
    path.join(getRemotionBitsRoot(), 'dist', 'catalog', 'inventory.generated.js')
  );
  inventory = inventoryModule.sharedBitInventory as InventoryEntry[];
  return inventory;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function tokenizeQuery(value: string): string[] {
  return Array.from(new Set(normalizeText(value).split(/\s+/).filter(Boolean)));
}

function scoreEntry(entry: InventoryEntry, query: string): number {
  const normalizedQuery = normalizeText(query);
  const terms = tokenizeQuery(query);
  const normalizedId = normalizeText(entry.id);
  const normalizedName = normalizeText(entry.name);
  const normalizedDescription = normalizeText(entry.description);
  const normalizedTags = entry.tags.map(normalizeText);
  const normalizedDeps = entry.registryDependencies.map(normalizeText);

  let score = 0;

  // Full query matches
  if (normalizedId === normalizedQuery) score += 1400;
  else if (normalizedId.includes(normalizedQuery)) score += 500;

  if (normalizedName === normalizedQuery) score += 1200;
  else if (normalizedName.startsWith(normalizedQuery)) score += 800;
  else if (normalizedName.includes(normalizedQuery)) score += 650;

  if (normalizedTags.some((t) => t === normalizedQuery)) score += 420;
  else if (normalizedTags.some((t) => t.includes(normalizedQuery))) score += 280;

  if (normalizedDescription.includes(normalizedQuery)) score += 240;

  if (normalizedDeps.some((d) => d === normalizedQuery)) score += 200;
  else if (normalizedDeps.some((d) => d.includes(normalizedQuery))) score += 120;

  // Per-term matches
  for (const term of terms) {
    if (normalizedName.includes(term)) score += 60;
    if (normalizedTags.some((t) => t.includes(term))) score += 40;
    if (normalizedDescription.includes(term)) score += 25;
    if (normalizedDeps.some((d) => d.includes(term))) score += 20;
  }

  return score;
}

export function searchBits(query: string, tags?: string[], limit: number = 5): BitSummary[] {
  const entries = loadInventory();
  const normalizedTags = (tags ?? []).map(normalizeText).filter(Boolean);

  // Filter by tags (AND logic)
  let candidates = entries;
  if (normalizedTags.length > 0) {
    candidates = candidates.filter((entry) => {
      const entryTags = entry.tags.map(normalizeText);
      return normalizedTags.every((tag) => entryTags.includes(tag));
    });
  }

  // Score and sort
  const scored = candidates
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ entry, score }) => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags,
    duration: entry.duration,
    width: entry.width,
    height: entry.height,
    registryDependencies: entry.registryDependencies,
    relevance_score: score,
  }));
}

export function fetchBit(id: string): BitEntry | null {
  const entries = loadInventory();
  const normalizedId = normalizeText(id);

  // Find by id or name
  const entry = entries.find(
    (e) => normalizeText(e.id) === normalizedId || normalizeText(e.name) === normalizedId
  );
  if (!entry) return null;

  // Read source code from the remotion-bits package
  const bitsRoot = getRemotionBitsRoot();
  const sourcePath = path.resolve(bitsRoot, entry.sourcePath);

  // Safety check: must be within the package
  const relative = path.relative(bitsRoot, sourcePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

  let sourceCode: string;
  try {
    sourceCode = fs.readFileSync(sourcePath, 'utf-8');
  } catch {
    return null;
  }

  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags,
    duration: entry.duration,
    width: entry.width,
    height: entry.height,
    registryDependencies: entry.registryDependencies,
    relevance_score: 0,
    sourceCode,
  };
}
