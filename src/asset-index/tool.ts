import { ASSET_REGISTRY } from './registry';
import type {
  AssetEntry,
  AssetKind,
  FindAssetQuery,
  FindAssetResult,
} from './types';

const MIN_MATCH_SCORE = 0.25;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter((t) => t.length > 1);
}

function scoreEntry(entry: AssetEntry, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const haystack = tokens(
    [entry.name, entry.description, ...entry.concepts, ...entry.tags].join(' '),
  );
  const haystackSet = new Set(haystack);
  let hits = 0;
  let conceptBoost = 0;
  const conceptTokens = new Set(
    entry.concepts.flatMap((c) => tokens(c)),
  );
  for (const t of queryTokens) {
    if (haystackSet.has(t)) hits += 1;
    if (conceptTokens.has(t)) conceptBoost += 0.5;
  }
  const base = hits / queryTokens.length;
  return Math.min(1, base + conceptBoost / queryTokens.length);
}

export function findAsset(query: FindAssetQuery): FindAssetResult {
  const queryTokens = tokens(query.concept);
  const limit = query.limit ?? 5;
  const scored = ASSET_REGISTRY
    .filter((e) => (query.kind ? e.kind === query.kind : true))
    .filter((e) =>
      query.tags && query.tags.length > 0
        ? query.tags.every((t) => e.tags.includes(t))
        : true,
    )
    .map((entry) => ({ entry, score: scoreEntry(entry, queryTokens) }))
    .filter((m) => m.score >= MIN_MATCH_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return {
    matches: scored,
    gap: scored.length === 0,
    query,
  };
}

export function getAsset(id: string): AssetEntry | undefined {
  return ASSET_REGISTRY.find((e) => e.id === id);
}

export function listAssets(filter: {
  kind?: AssetKind;
  tags?: string[];
} = {}): AssetEntry[] {
  return ASSET_REGISTRY.filter((e) =>
    filter.kind ? e.kind === filter.kind : true,
  ).filter((e) =>
    filter.tags && filter.tags.length > 0
      ? filter.tags.every((t) => e.tags.includes(t))
      : true,
  );
}

export { ASSET_REGISTRY };
