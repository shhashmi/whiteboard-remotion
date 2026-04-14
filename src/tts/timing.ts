/** Convert frame count to milliseconds. */
export function framesToMs(frames: number, fps = 30): number {
  return (frames / fps) * 1000;
}

/** Convert milliseconds to a rounded frame count. */
export function msToFrames(ms: number, fps = 30): number {
  return Math.round((ms / 1000) * fps);
}
