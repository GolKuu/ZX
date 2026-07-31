/**
 * MIM's grounded kit, as the rest of the project imports it.
 *
 * The rows themselves live in `src/data/mim/`, split by tier, because the
 * character now carries far more frame data than one file should hold. This
 * module is the stable surface the engine setup and the animation layer use.
 */

import type { MoveFrameData } from '../sim/frame-data.js';
import { MIM_DUAL_MOVES } from './mim/duals.js';
import {
  MIM_DUAL_IDS,
  MIM_NORMAL_IDS,
  MIM_UTILITY_IDS,
} from './mim/ids.js';
import { MIM_NORMAL_MOVES } from './mim/normals.js';
import { MIM_UTILITY_MOVES } from './mim/utility.js';

export const MIM_MOVE_IDS = {
  ...MIM_NORMAL_IDS,
  ...MIM_DUAL_IDS,
  ...MIM_UTILITY_IDS,
} as const;

export const MIM_MOVES: readonly MoveFrameData[] = [
  ...MIM_NORMAL_MOVES,
  ...MIM_DUAL_MOVES,
  ...MIM_UTILITY_MOVES,
];

export { MIM_DUAL_IDS, MIM_NORMAL_IDS, MIM_UTILITY_IDS };
export { MIM_DUAL_MOVES, MIM_NORMAL_MOVES, MIM_UTILITY_MOVES };
