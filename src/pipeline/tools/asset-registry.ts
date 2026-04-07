import * as fs from 'fs';
import * as path from 'path';
import type { ImageRecord, AssetSearchResult } from '../types';

let registry: ImageRecord[] | null = null;

function getRegistryPath(): string {
  return path.resolve(__dirname, '../../assets/images/registry.jsonl');
}

export function loadRegistry(): ImageRecord[] {
  if (registry) return registry;
  const filePath = getRegistryPath();
  if (!fs.existsSync(filePath)) {
    registry = [];
    return registry;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  registry = content
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as ImageRecord);
  return registry;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Synonym expansion for improved search recall
const SYNONYMS: Record<string, string[]> = {
  workflow: ['process', 'flow', 'pipeline', 'sequence'],
  hierarchy: ['tree', 'organization', 'levels', 'structure'],
  tradeoff: ['balance', 'comparison', 'scale', 'versus'],
  security: ['lock', 'shield', 'protection', 'safety'],
  network: ['connection', 'graph', 'nodes', 'links', 'internet'],
  plan: ['blueprint', 'strategy', 'roadmap', 'planning'],
  loop: ['cycle', 'circular', 'iteration', 'recurring'],
  step: ['sequence', 'process', 'chain', 'flow'],
  team: ['group', 'people', 'collaboration', 'organization'],
  error: ['warning', 'alert', 'caution', 'danger'],
  search: ['find', 'investigate', 'magnify', 'lookup'],
  data: ['chart', 'graph', 'analytics', 'metrics', 'statistics'],
  phone: ['mobile', 'device', 'smartphone'],
  email: ['envelope', 'mail', 'message', 'communication'],
  server: ['infrastructure', 'rack', 'hosting', 'backend'],
  grid: ['matrix', 'table', 'pattern', 'squares'],
  person: ['human', 'user', 'people', 'individual'],
  progress: ['bar', 'completion', 'loading', 'capacity'],
  reflection: ['mirror', 'thinking', 'self', 'introspection'],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  technology: ['tech', 'computer', 'server', 'code', 'cloud', 'keyboard', 'phone', 'wifi', 'grid'],
  people: ['person', 'human', 'team', 'group', 'people', 'user'],
  abstract: ['idea', 'concept', 'think', 'brain', 'star', 'flag', 'lock', 'shield', 'warning'],
  business: ['chart', 'data', 'document', 'report', 'graph', 'progress'],
  flow: ['process', 'workflow', 'cycle', 'loop', 'funnel', 'decision', 'arrow', 'chain'],
  structure: ['hierarchy', 'tree', 'network', 'layers', 'scale', 'blueprint', 'plan'],
};

function expandQuery(terms: string[]): string[] {
  const expanded = new Set(terms);
  for (const term of terms) {
    const syns = SYNONYMS[term];
    if (syns) syns.forEach((s) => expanded.add(s));
  }
  return Array.from(expanded);
}

function detectCategoryBoost(terms: string[]): string | null {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const term of terms) {
      if (keywords.includes(term)) return category;
    }
  }
  return null;
}

// Keyword-based search with synonym expansion
function keywordScore(query: string, record: ImageRecord, boostCategory: string | null): number {
  const queryTerms = expandQuery(query.toLowerCase().split(/\s+/));
  const searchableText = [
    record.name,
    record.description,
    ...record.depicts,
    record.category,
    ...(record.aliases || []),
    ...(record.variants || []),
  ]
    .join(' ')
    .toLowerCase();

  let matches = 0;
  for (const term of queryTerms) {
    if (searchableText.includes(term)) matches++;
  }
  let score = queryTerms.length > 0 ? matches / queryTerms.length : 0;

  if (boostCategory && record.category === boostCategory) {
    score *= 1.5;
  }

  return Math.min(score, 1);
}

export function searchAssets(
  query: string,
  options?: { category?: string; style?: string; limit?: number }
): AssetSearchResult {
  const assets = loadRegistry();
  const limit = options?.limit ?? 5;

  // Filter by category/style if specified
  let candidates = assets;
  if (options?.category) {
    candidates = candidates.filter((a) => a.category === options.category);
  }
  if (options?.style) {
    candidates = candidates.filter((a) => a.style === options.style);
  }

  // Score each candidate with synonym expansion and category boosting
  const boostCategory = detectCategoryBoost(query.toLowerCase().split(/\s+/));
  const scored = candidates.map((record) => {
    const score = keywordScore(query, record, boostCategory);
    return { record, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, limit);

  // Determine quality
  const topScore = topResults.length > 0 ? topResults[0].score : 0;
  let quality: 'strong' | 'weak' | 'none';
  if (topScore > 0.7) quality = 'strong';
  else if (topScore > 0.3) quality = 'weak';
  else quality = 'none';

  const result: AssetSearchResult = {
    results: topResults.map(({ record, score }) => ({
      id: record.id,
      name: record.name,
      description: record.description,
      type: record.type,
      depicts: record.depicts,
      relevance_score: Math.round(score * 100) / 100,
    })),
    quality,
  };

  if (quality === 'none') {
    result.suggestion = `No strong matches for "${query}". Try broader terms like general concepts or categories.`;
  }

  return result;
}

export function getAssetById(id: string): ImageRecord | undefined {
  const assets = loadRegistry();
  return assets.find((a) => a.id === id);
}
