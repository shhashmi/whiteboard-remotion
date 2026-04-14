import { findAsset, getAsset, listAssets } from './tool';
import type { AssetKind } from './types';

function usage(): never {
  console.error(
    `Usage:
  find-asset <concept>            [--kind <kind>] [--tags t1,t2] [--limit N]
  get-asset  <id>
  list-assets                     [--kind <kind>] [--tags t1,t2]`,
  );
  process.exit(2);
}

function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      flags[a.slice(2)] = argv[i + 1] ?? '';
      i++;
    }
  }
  return flags;
}

function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd) usage();

  if (cmd === 'find-asset') {
    const concept = rest.find((x) => !x.startsWith('--'));
    if (!concept) usage();
    const flags = parseFlags(rest);
    const result = findAsset({
      concept,
      kind: (flags.kind as AssetKind | undefined) || undefined,
      tags: flags.tags ? flags.tags.split(',') : undefined,
      limit: flags.limit ? Number(flags.limit) : undefined,
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === 'get-asset') {
    const id = rest[0];
    if (!id) usage();
    const entry = getAsset(id);
    if (!entry) {
      console.error(`No asset with id: ${id}`);
      process.exit(1);
    }
    console.log(JSON.stringify(entry, null, 2));
    return;
  }

  if (cmd === 'list-assets') {
    const flags = parseFlags(rest);
    const entries = listAssets({
      kind: (flags.kind as AssetKind | undefined) || undefined,
      tags: flags.tags ? flags.tags.split(',') : undefined,
    });
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  usage();
}

main();
