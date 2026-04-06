# Whiteboard Remotion

Animated whiteboard-style explainer videos built with [Remotion](https://www.remotion.dev/).

## Prerequisites

- Node.js (v18+)
- npm

## Setup

```bash
npm install
```

## How to Create a Video from a Folder

Each video lives in its own folder under `src/`. The existing example is `src/studymaterial/`. Follow these steps to create a new video from a folder:

### 1. Create a new folder

```
src/
  your-video-name/
    index.tsx        # Entry point — registers the Root component
    Root.tsx         # Defines the Composition (resolution, fps, duration)
    YourVideo.tsx    # Main video component — assembles scenes
    scenes.tsx       # Individual scene components
    components.tsx   # Custom drawing/animation components (optional)
```

### 2. Set up the entry point (`index.tsx`)

```tsx
import { registerRoot } from 'remotion';
import { Root } from './Root';

registerRoot(Root);
```

### 3. Define the composition (`Root.tsx`)

```tsx
import React from 'react';
import { Composition } from 'remotion';
import { YourVideo } from './YourVideo';

export const Root: React.FC = () => (
  <Composition
    id="YourVideo"
    component={YourVideo}
    durationInFrames={3600}  // 120 seconds at 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);
```

### 4. Build scenes (`scenes.tsx`)

Use the shared components from `src/shared/components.tsx` (e.g., `AnimatedPath`, `SketchCircle`, `Scene`, `Lightbulb`, `GearIcon`) or create your own in a local `components.tsx`.

Each scene is a React component that renders within a frame range:

```tsx
import { Scene } from './components';

export const Scene1: React.FC = () => (
  <Scene startFrame={0} endFrame={300}>
    {/* Your animated content here */}
  </Scene>
);
```

### 5. Assemble in the main video component (`YourVideo.tsx`)

```tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Scene1, Scene2 } from './scenes';

export const YourVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#fefefe' }}>
    <Scene1 />
    <Scene2 />
  </AbsoluteFill>
);
```

### 6. Preview in Remotion Studio

```bash
npx remotion studio src/your-video-name/index.tsx
```

This opens a browser-based preview where you can scrub through frames and inspect your video.

### 7. Render the final video

```bash
npx remotion render src/your-video-name/index.tsx YourVideo out/your-video.mp4
```

Render options:

| Flag | Description |
|------|-------------|
| `--crf=15` | Higher quality (lower CRF = bigger file) |
| `--crf=28` | Faster preview quality |
| `--codec=h264` | Default codec |

Example for high quality:

```bash
npx remotion render src/your-video-name/index.tsx YourVideo out/your-video-hq.mp4 --crf=15
```

## Render Commands by Folder

### studymaterial (Agentic AI Explainer)
```bash
npx remotion studio src/studymaterial/index.tsx
npx remotion render src/studymaterial/index.tsx AgenticAIExplainer out/studymaterial.mp4
```

### whiteboard-explainer
```bash
npx remotion studio src/index.tsx
npx remotion render src/index.tsx WhiteboardExplainer out/whiteboard-explainer.mp4
```

### cfpb-riskcheck (CFPB Compliance RiskCheck)
```bash
npx remotion studio src/index.tsx
npx remotion render src/index.tsx CFPBRiskCheck out/cfpb-riskcheck.mp4
```

> `whiteboard-explainer` and `cfpb-riskcheck` are both registered in `src/Root.tsx` and share the same entry point (`src/index.tsx`). `studymaterial` has its own entry point.

## Existing npm Scripts

| Script | Description |
|--------|-------------|
| `npm run studio` | Open Remotion Studio for `studymaterial` |
| `npm run render` | Render study material video |
| `npm run render:preview` | Quick preview render (CRF 28) |
| `npm run render:hq` | High quality render (CRF 15) |

## Project Structure

```
src/
  shared/
    components.tsx       # Reusable animation primitives (AnimatedPath, SketchCircle, etc.)
  studymaterial/         # Agentic AI explainer (own entry point)
    index.tsx
    Root.tsx
    AgenticAIExplainer.tsx
    scenes.tsx
    components.tsx
  whiteboard-explainer/  # Whiteboard-style explainer (registered in src/Root.tsx)
    WhiteboardExplainer.tsx
    scenes.tsx
  cfpb-riskcheck/        # CFPB Compliance RiskCheck corporate video (registered in src/Root.tsx)
    CFPBExplainer.tsx
    components.tsx
    background.tsx
    styles.ts
    scenes/
      Scene01_LogoIntro.tsx
      Scene02_CFPBScatter.tsx
      Scene03_ProblemStatement.tsx
      Scene04_ExpandingFlow.tsx
      Scene05_ProductIntro.tsx
      Scene06_CloudToComputer.tsx
      Scene07_Timeline.tsx
      Scene08_ChecklistLaptop.tsx
      Scene09_BenefitsList.tsx
      Scene10_Closing.tsx
```
