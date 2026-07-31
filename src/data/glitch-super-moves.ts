import { GLITCH_SUPER_IDS } from './glitch/ids.js';

export {
  GLITCH_LEVEL_ONE_COST,
  GLITCH_LEVEL_THREE_COST,
  GLITCH_SUPER_MOVES,
  glitchSuperCostForMove,
  glitchSuperKindForMove,
  type GlitchSuperKind,
} from './glitch/supers.js';

/** Legacy UI names map onto the production move names. */
export const GLITCH_SUPER_MOVE_IDS = {
  error: GLITCH_SUPER_IDS.riftSequence,
  critical: GLITCH_SUPER_IDS.realityCollapse,
  patchNotes: GLITCH_SUPER_IDS.fourthGod,
} as const;

export const GLITCH_CINEMATIC_FRAMES = {
  error: 93,
  critical: 84,
  patchNotes: 39,
} as const;

/** Initial simulation freeze; the authored move continues after this beat. */
export const GLITCH_CINEMATIC_FREEZE_FRAMES = {
  error: 12,
  critical: 16,
  patchNotes: 24,
} as const;
