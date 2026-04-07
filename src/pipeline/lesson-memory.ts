import * as fs from 'fs';
import * as path from 'path';

interface Lesson {
  category: string;
  description: string;
  topic?: string;
  timestamp: string;
}

const LESSONS_PATH = path.resolve(process.cwd(), 'out', 'lessons.jsonl');
const ISSUE_LINE_RE = /^-\s*\[FRAME\s+\d+\]\s*([A-Z][A-Z /]+?):\s*(.+)$/;

export function recordLessons(critique: string, topic?: string): void {
  const lines = critique.split('\n');
  const lessons: Lesson[] = [];

  for (const line of lines) {
    const match = line.trim().match(ISSUE_LINE_RE);
    if (!match) continue;
    lessons.push({
      category: match[1],
      description: match[2],
      ...(topic && { topic }),
      timestamp: new Date().toISOString(),
    });
  }

  if (lessons.length === 0) return;

  const dir = path.dirname(LESSONS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(LESSONS_PATH, lessons.map((l) => JSON.stringify(l)).join('\n') + '\n');
}

export function loadTopLessons(n = 10): string[] {
  if (!fs.existsSync(LESSONS_PATH)) return [];

  const raw = fs.readFileSync(LESSONS_PATH, 'utf-8').trim();
  if (!raw) return [];

  const entries = raw.split('\n').slice(-500);
  const grouped = new Map<string, { description: string; category: string; count: number; latest: string }>();

  for (const line of entries) {
    let lesson: Lesson;
    try {
      lesson = JSON.parse(line);
    } catch {
      continue;
    }
    const key = `${lesson.category}: ${lesson.description.toLowerCase().trim()}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
      if (lesson.timestamp > existing.latest) {
        existing.latest = lesson.timestamp;
        existing.description = lesson.description;
      }
    } else {
      grouped.set(key, {
        category: lesson.category,
        description: lesson.description,
        count: 1,
        latest: lesson.timestamp,
      });
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest))
    .slice(0, n)
    .map((g) => `- [${g.category}] ${g.description} (seen ${g.count} time${g.count > 1 ? 's' : ''})`);
}

export function formatLessonsForPrompt(lessons: string[]): string {
  if (lessons.length === 0) return '';
  return `COMMON VISUAL MISTAKES TO AVOID (learned from past generations):
${lessons.join('\n')}
Proactively check your output for these issues before finalizing.`;
}
