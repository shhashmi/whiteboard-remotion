/**
 * One-time generator: scans src/shared/icons/*.tsx, emits AssetEntry literals
 * for the asset-index registry. Output goes to stdout — pipe or paste into
 * src/asset-index/registry.ts inside the ASSET_REGISTRY array.
 *
 *   npx ts-node scripts/generate-icon-registry.ts > /tmp/icon-entries.ts
 *
 * Re-run safely: output is deterministic (sorted by file then by source-line).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const ICONS_DIR = join(__dirname, '..', 'src', 'shared', 'icons');

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  abstract: ['concept', 'idea', 'symbol'],
  actions: ['action', 'interaction', 'verb'],
  business: ['business', 'metric', 'report'],
  communication: ['communication', 'messaging', 'signal'],
  finance: ['finance', 'money', 'currency'],
  flow: ['flow', 'process', 'pipeline'],
  nature: ['nature', 'natural', 'environment'],
  objects: ['object', 'item', 'thing'],
  people: ['person', 'human', 'figure'],
  places: ['place', 'location', 'building'],
  science: ['science', 'scientific', 'research'],
  status: ['status', 'state', 'feedback'],
  structure: ['structure', 'architecture', 'layout'],
  technology: ['technology', 'tech', 'device'],
  transport: ['transport', 'vehicle', 'movement'],
};

interface IconOverride {
  concepts?: string[];
  description?: string;
  extraTags?: string[];
  propsSchema?: Record<string, unknown>;
}

const ICON_OVERRIDES: Record<string, IconOverride> = {
  // ─── from out/asset-gaps.jsonl ───────────────────────────────────────────
  RobotHead: {
    concepts: ['robot', 'AI agent', 'android', 'autonomous bot', 'machine intelligence'],
    description: 'Hand-drawn robot head — use for AI/agent concepts.',
    extraTags: ['agents'],
  },
  NetworkGraph: {
    concepts: ['network', 'nodes connected', 'graph', 'mesh', 'topology', 'connected nodes'],
    description: 'Hand-drawn network of connected nodes.',
  },
  BrainIcon: {
    concepts: ['brain', 'thinking', 'intelligence', 'cognition', 'mind', 'reasoning'],
    description: 'Hand-drawn brain — use for thinking, intelligence, cognition.',
  },
  GearIcon: {
    concepts: ['gear', 'settings', 'process', 'mechanism', 'configuration', 'cogwheel'],
    description: 'Hand-drawn gear — use for settings, process, mechanism.',
  },
  TeamGroup: {
    concepts: ['team', 'group', 'collaboration', 'people working together', 'crew'],
    description: 'Hand-drawn team of people — use for collaboration, group work.',
  },
  CheckCircleIcon: {
    concepts: ['checkmark', 'success', 'done', 'verified', 'approved', 'confirmed'],
    description: 'Hand-drawn check inside a circle — use for success, verification.',
  },
  WarningTriangle: {
    concepts: ['warning', 'alert', 'caution', 'limitation', 'danger', 'risk'],
    description: 'Hand-drawn warning triangle — use for alerts, cautions, limitations.',
  },
  ChatbotIcon: {
    concepts: ['chat', 'message', 'conversation', 'chatbot', 'communication', 'assistant'],
    description: 'Hand-drawn chatbot avatar — use for chat, messaging.',
  },
  SpeechBubble: {
    concepts: ['speech', 'message', 'dialog', 'communication', 'quote', 'comment'],
    description: 'Hand-drawn speech bubble — use for dialog, comments, quotes.',
  },
  EnvelopeIcon: {
    concepts: ['envelope', 'mail', 'email', 'message', 'communication', 'inbox'],
    description: 'Hand-drawn envelope — use for mail, email, messages.',
  },
  PersonIcon: {
    concepts: ['person', 'user', 'individual', 'human figure', 'standing person'],
    description: 'Hand-drawn standing person — use for user, individual.',
  },
  Lightbulb: {
    concepts: ['lightbulb', 'idea', 'insight', 'eureka', 'innovation', 'inspiration'],
    description: 'Hand-drawn lightbulb — use for ideas, insights, innovation.',
  },
  FlowChain: {
    concepts: ['flow', 'arrow chain', 'direction', 'sequence', 'pipeline', 'connected steps'],
    description: 'Hand-drawn chain of flow arrows — use for sequences, pipelines.',
  },
  CycleArrow: {
    concepts: ['cycle', 'loop', 'arrow', 'recurring', 'iteration', 'circular flow'],
    description: 'Hand-drawn circular arrow — use for cycles, loops, iteration.',
  },
};

function camelToWords(name: string): string {
  // RobotHead → "robot head", USBPlugIcon → "usb plug icon"
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .trim();
}

function deriveConcepts(name: string, category: string): string[] {
  const words = camelToWords(name);
  const stripped = words.replace(/\s*icon\s*$/i, '').trim();
  const concepts = new Set<string>();
  if (stripped) concepts.add(stripped);
  if (stripped !== words) concepts.add(words);
  for (const syn of CATEGORY_SYNONYMS[category] ?? []) concepts.add(syn);
  return Array.from(concepts);
}

interface PropDecl {
  name: string;
  required: boolean;
  tsType: string;
}

interface IconExport {
  name: string;
  category: string;
  filePath: string;
  line: number;
  props: PropDecl[];
}

// Map a TypeScript type expression (right-hand side of a property declaration)
// to a JSON-schema fragment. Returns `{}` (any) for unknown shapes so we never
// over-constrain.
function tsTypeToJsonSchema(tsType: string): Record<string, unknown> {
  const t = tsType.trim().replace(/;\s*$/, '').trim();
  if (t === 'number') return { type: 'number' };
  if (t === 'string') return { type: 'string' };
  if (t === 'boolean') return { type: 'boolean' };
  if (t === 'number[]') return { type: 'array', items: { type: 'number' } };
  if (t === 'string[]') return { type: 'array', items: { type: 'string' } };
  // Union of string literals: 'a' | 'b' | 'c'
  if (/^'[^']+'(?:\s*\|\s*'[^']+')+$/.test(t)) {
    const values = [...t.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    return { type: 'string', enum: values };
  }
  return {};
}

// Parse the body of an `interface FooProps { ... }` block into a list of
// property declarations. Handles required (`name: type;`) and optional
// (`name?: type;`) forms.
function parseInterfaceBody(body: string): PropDecl[] {
  const props: PropDecl[] = [];
  const propRe = /^\s*(\w+)(\??):\s*([^;\n]+);?\s*$/;
  for (const rawLine of body.split('\n')) {
    const line = rawLine.replace(/\/\/.*$/, '');
    const m = line.match(propRe);
    if (!m) continue;
    const [, name, optional, tsType] = m;
    props.push({ name, required: optional !== '?', tsType: tsType.trim() });
  }
  return props;
}

function scanFile(absPath: string): IconExport[] {
  const category = basename(absPath, '.tsx');
  const filePath = `src/shared/icons/${category}.tsx`;
  const src = readFileSync(absPath, 'utf8');
  const lines = src.split('\n');
  const out: IconExport[] = [];
  const exportRe = /^export const (\w+):\s*React\.FC<(\w+)>/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(exportRe);
    if (!m) continue;
    const [, name, propsType] = m;
    // NOTE: regex uses [^}] which would break on nested object types like
    // `{ style: { color: string } }`. No icon currently has that, but if you
    // add one, switch to a brace-balanced parser.
    const propsBlock = src.match(new RegExp(`interface ${propsType}\\s*\\{([^}]*)\\}`));
    const propsBody = propsBlock?.[1] ?? '';
    out.push({
      name,
      category,
      filePath,
      line: i + 1,
      props: parseInterfaceBody(propsBody),
    });
  }
  return out;
}

function buildPropsSchema(icon: IconExport): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const p of icon.props) {
    properties[p.name] = tsTypeToJsonSchema(p.tsType);
    if (p.required) required.push(p.name);
  }
  return { type: 'object', required, properties };
}

function emitEntry(icon: IconExport, id: string): string {
  const override = ICON_OVERRIDES[icon.name] ?? {};
  const concepts = override.concepts ?? deriveConcepts(icon.name, icon.category);
  const description =
    override.description ?? `Hand-drawn ${camelToWords(icon.name).replace(/\s*icon\s*$/i, '')} icon.`;
  const tags = ['icon', icon.category, ...(override.extraTags ?? [])];
  const schema = override.propsSchema ?? buildPropsSchema(icon);
  return [
    `  {`,
    `    id: ${JSON.stringify(id)},`,
    `    kind: 'icon',`,
    `    name: ${JSON.stringify(icon.name)},`,
    `    importPath: '@/shared/icons',`,
    `    filePath: ${JSON.stringify(icon.filePath)},`,
    `    concepts: ${JSON.stringify(concepts)},`,
    `    tags: ${JSON.stringify(tags)},`,
    `    description: ${JSON.stringify(description)},`,
    `    propsSchema: ${JSON.stringify(schema, null, 6).replace(/\n/g, '\n    ')},`,
    `  },`,
  ].join('\n');
}

function main() {
  const files = readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith('.tsx'))
    .sort()
    .map((f) => join(ICONS_DIR, f));

  const all: IconExport[] = [];
  for (const f of files) all.push(...scanFile(f));

  const overrideKeys = new Set(Object.keys(ICON_OVERRIDES));
  const found = new Set(all.map((i) => i.name));
  for (const k of overrideKeys) {
    if (!found.has(k)) console.error(`WARN: override defined for unknown icon "${k}"`);
  }

  const out: string[] = [
    `// === BEGIN auto-generated icon entries (${all.length} icons) ===`,
    `// Generated by scripts/generate-icon-registry.ts on ${new Date().toISOString()}`,
  ];
  all.forEach((icon, i) => {
    out.push(emitEntry(icon, `I${i + 1}`));
  });
  out.push(`// === END auto-generated icon entries ===`);

  process.stdout.write(out.join('\n') + '\n');
  console.error(`Emitted ${all.length} icon entries.`);
}

main();
