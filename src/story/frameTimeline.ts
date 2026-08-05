/** Fixed cadence used by every rendered story-cutscene frame. */
export const STORY_FRAME_RATE = 24;
export const STORY_FRAME_MS = 1_000 / STORY_FRAME_RATE;

export interface StoryRenderFrame {
  readonly index: number;
  readonly timeMs: number;
  readonly progress: number;
}

/**
 * Quantize wall time to the hand-animated 24 FPS story timeline.
 *
 * Keeping this independent from the browser makes the cutscene clock easy to
 * verify and guarantees that a 60/120/144 Hz display sees the same drawings.
 */
export function storyRenderFrame(elapsedMs: number, totalMs: number): StoryRenderFrame {
  const safeTotal = Math.max(STORY_FRAME_MS, totalMs);
  const clamped = Math.max(0, Math.min(elapsedMs, safeTotal));
  const lastFrame = Math.ceil(safeTotal / STORY_FRAME_MS);
  const index = Math.min(lastFrame, Math.floor(clamped / STORY_FRAME_MS));
  const timeMs = Math.min(safeTotal, index * STORY_FRAME_MS);
  return {
    index,
    timeMs,
    progress: Math.min(1, clamped / safeTotal),
  };
}
