import { GLITCH_SPECIAL_IDS as S } from './ids.js';

export type GlitchStoryChapter = 'awakening' | 'fracture' | 'fourth-god';

export const GLITCH_STORY_UNLOCKS: Readonly<
  Record<GlitchStoryChapter, readonly string[]>
> = {
  awakening: [S.spatialDash, S.shiftForward, S.shiftBackward],
  fracture: [S.airShift, S.teleportStrike, S.realitySlice],
  'fourth-god': [
    S.exRiftUppercut,
    S.exPhaseBreak,
    S.exRealitySlice,
    S.exTeleportStrike,
  ],
};

export function unlockedGlitchMoves(
  chapters: ReadonlySet<GlitchStoryChapter>,
): ReadonlySet<string> {
  return new Set(
    [...chapters].flatMap((chapter) => GLITCH_STORY_UNLOCKS[chapter]),
  );
}
