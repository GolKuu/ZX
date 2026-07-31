/**
 * MIM's two supers and her ultimate.
 *
 * The ids keep the shape the meter and cinematic layers already expect; the
 * rows live in `src/data/mim/supers.ts` and `src/data/mim/ultimate.ts`.
 */

import { MIM_SUPER_IDS } from './mim/ids.js';

export const MIM_SUPER_MOVE_IDS = {
  mirrorArena: MIM_SUPER_IDS.mirrorArena,
  falseOpening: MIM_SUPER_IDS.falseOpening,
  perfectBox: MIM_SUPER_IDS.perfectBox,
} as const;

export {
  MIM_FALSE_OPENING_COUNTER,
  MIM_LEVEL_ONE_COST,
  MIM_LEVEL_THREE_COST,
  MIM_SUPER_MOVES,
  mimSuperCostForMove,
  mimSuperKindForMove,
  type MimSuperKind,
} from './mim/supers.js';

export { MIM_PERFECT_BOX_SEQUENCE } from './mim/ultimate.js';
