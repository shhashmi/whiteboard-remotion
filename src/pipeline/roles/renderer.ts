import * as fs from 'fs';
import * as path from 'path';
import type { AnimatorOutput } from './polish';
import { log } from '../logger';

function generateRootTsx(durationInFrames: number): string {
  return `import React from 'react';
import { Composition } from 'remotion';
import { GeneratedVideo } from './GeneratedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GeneratedVideo"
      component={GeneratedVideo}
      durationInFrames={${durationInFrames}}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
`;
}

function generateIndexTsx(): string {
  return `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
`;
}

export function renderToFiles(animatorOutput: AnimatorOutput, outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  log.rendererWriting(outputDir);

  const videoPath = path.join(outputDir, 'GeneratedVideo.tsx');
  fs.writeFileSync(videoPath, animatorOutput.code);
  log.rendererFileWritten('GeneratedVideo.tsx', Buffer.byteLength(animatorOutput.code));

  const rootContent = generateRootTsx(animatorOutput.durationInFrames);
  fs.writeFileSync(path.join(outputDir, 'Root.tsx'), rootContent);
  log.rendererFileWritten('Root.tsx', Buffer.byteLength(rootContent));

  const indexContent = generateIndexTsx();
  fs.writeFileSync(path.join(outputDir, 'index.tsx'), indexContent);
  log.rendererFileWritten('index.tsx', Buffer.byteLength(indexContent));
}
