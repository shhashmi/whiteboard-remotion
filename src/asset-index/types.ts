export type AssetKind =
  | 'component'
  | 'diagram'
  | 'icon'
  | 'image'
  | 'photo'
  | 'audio';

export interface AssetEntry {
  id: string;
  kind: AssetKind;
  name: string;
  importPath?: string;
  filePath?: string;
  concepts: string[];
  tags: string[];
  description: string;
  propsSchema?: Record<string, unknown>;
  previewPath?: string;
}

export interface FindAssetQuery {
  concept: string;
  kind?: AssetKind;
  tags?: string[];
  limit?: number;
}

export interface FindAssetMatch {
  entry: AssetEntry;
  score: number;
}

export interface FindAssetResult {
  matches: FindAssetMatch[];
  gap: boolean;
  query: FindAssetQuery;
}
