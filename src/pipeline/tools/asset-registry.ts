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

// Simple keyword-based search (no embedding model dependency for MVP)
function keywordScore(query: string, record: ImageRecord): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const searchableText = [
    record.name,
    record.description,
    ...record.depicts,
    record.category,
  ]
    .join(' ')
    .toLowerCase();

  let matches = 0;
  for (const term of queryTerms) {
    if (searchableText.includes(term)) matches++;
  }
  return queryTerms.length > 0 ? matches / queryTerms.length : 0;
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

  // Score each candidate
  const scored = candidates.map((record) => {
    // Use embeddings if available, otherwise keyword matching
    let score: number;
    if (record.embedding && record.embedding.length > 0) {
      // Would use query embedding here — for MVP, fall back to keyword
      score = keywordScore(query, record);
    } else {
      score = keywordScore(query, record);
    }
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
