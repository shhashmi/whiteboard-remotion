import * as fs from 'fs';
import * as path from 'path';

export interface SkillEntry {
  name: string;
  description: string;
  tags: string[];
  filePath: string;
  content: string;
}

export interface SkillSearchResult {
  name: string;
  description: string;
  tags: string[];
  relevance_score: number;
}

const SKILLS_DIR = path.resolve(__dirname, '../../../../../skills/skills/remotion/rules');

let skillIndex: SkillEntry[] | null = null;

function parseFrontmatter(raw: string): { name: string; description: string; tags: string[]; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { name: '', description: '', tags: [], body: raw };

  const frontmatter = match[1];
  const body = match[2];

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const tagsMatch = frontmatter.match(/^\s+tags:\s*(.+)$/m);

  return {
    name: nameMatch?.[1]?.trim() ?? '',
    description: descMatch?.[1]?.trim() ?? '',
    tags: tagsMatch?.[1]?.split(',').map((t) => t.trim()).filter(Boolean) ?? [],
    body,
  };
}

function loadSkillIndex(): SkillEntry[] {
  if (skillIndex) return skillIndex;

  if (!fs.existsSync(SKILLS_DIR)) {
    skillIndex = [];
    return skillIndex;
  }

  const files = fs.readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.md'));
  skillIndex = files.map((file) => {
    const filePath = path.join(SKILLS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { name, description, tags, body } = parseFrontmatter(raw);
    return { name: name || file.replace('.md', ''), description, tags, filePath, content: body };
  });

  return skillIndex;
}

function scoreSkill(query: string, entry: SkillEntry): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const searchable = [entry.name, entry.description, ...entry.tags].join(' ').toLowerCase();

  let score = 0;
  for (const term of queryTerms) {
    if (entry.name.toLowerCase() === term) score += 10;
    else if (entry.name.toLowerCase().includes(term)) score += 5;
    if (entry.tags.some((t) => t.toLowerCase() === term)) score += 4;
    else if (entry.tags.some((t) => t.toLowerCase().includes(term))) score += 2;
    if (entry.description.toLowerCase().includes(term)) score += 2;
  }

  return queryTerms.length > 0 ? score / queryTerms.length : 0;
}

export function searchSkills(query: string, limit: number = 5): SkillSearchResult[] {
  const index = loadSkillIndex();

  const scored = index.map((entry) => ({
    entry,
    score: scoreSkill(query, entry),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, limit)
    .filter((s) => s.score > 0)
    .map(({ entry, score }) => ({
      name: entry.name,
      description: entry.description,
      tags: entry.tags,
      relevance_score: Math.round(score * 100) / 100,
    }));
}

export function fetchSkill(name: string): { name: string; description: string; content: string } | null {
  const index = loadSkillIndex();
  const entry = index.find(
    (e) => e.name.toLowerCase() === name.toLowerCase() || e.filePath.endsWith(`${name}.md`)
  );
  if (!entry) return null;
  return { name: entry.name, description: entry.description, content: entry.content };
}
