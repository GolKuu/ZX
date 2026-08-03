import type { AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';
import { MIM_NORMAL_IDS } from './mim/ids.js';

export const MIM_AI_LOADOUT: AiLoadout = {
  neutral: [
    { moveId: MIM_NORMAL_IDS.maskJab, minimumDistance: 0, maximumDistance: fixed(1.15), weight: 36, cue: 'flash-jab' },
    { moveId: MIM_NORMAL_IDS.backElbow, minimumDistance: fixed(0.45), maximumDistance: fixed(1.3), weight: 28, cue: 'cane-hook' },
    { moveId: MIM_NORMAL_IDS.capoeiraKick, minimumDistance: fixed(0.62), maximumDistance: fixed(1.55), weight: 22, cue: 'low-ribbon' },
    { moveId: MIM_NORMAL_IDS.spinningKick, minimumDistance: fixed(0.72), maximumDistance: fixed(1.62), weight: 14, cue: 'curtain-drop' },
  ],
  whiffPunishes: [
    { moveId: MIM_NORMAL_IDS.backElbow, minimumDistance: 0, maximumDistance: fixed(1.32), weight: 58, cue: 'hook-punish' },
    { moveId: MIM_NORMAL_IDS.spinningKick, minimumDistance: fixed(0.62), maximumDistance: fixed(1.62), weight: 42, cue: 'heel-punish' },
  ],
  combos: [
    { moves: [MIM_NORMAL_IDS.maskJab, MIM_NORMAL_IDS.backElbow, MIM_NORMAL_IDS.spinningKick] },
    { moves: [MIM_NORMAL_IDS.maskJab, MIM_NORMAL_IDS.capoeiraKick, MIM_NORMAL_IDS.spinningKick] },
  ],
};
