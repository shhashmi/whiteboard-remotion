import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { ASSET_REGISTRY } from './registry';

const OUT = resolve(__dirname, 'index.json');

function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: ASSET_REGISTRY.length,
        assets: ASSET_REGISTRY,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Wrote ${ASSET_REGISTRY.length} assets to ${OUT}`);
}

main();
