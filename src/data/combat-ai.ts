import type { AiLoadout } from '../ai/types.js';
import { fixed } from '../sim/math.js';

export const KADE_AI_LOADOUT: AiLoadout = {
  neutral: [
    {
      moveId: '2L',
      minimumDistance: 0,
      maximumDistance: fixed(1.12),
      weight: 28,
      cue: 'low',
    },
    {
      moveId: '5L',
      minimumDistance: 0,
      maximumDistance: fixed(1.18),
      weight: 35,
      cue: 'quick',
    },
    {
      moveId: '5M',
      minimumDistance: fixed(0.7),
      maximumDistance: fixed(1.35),
      weight: 24,
      cue: 'mid',
    },
    {
      moveId: '2M',
      minimumDistance: fixed(0.72),
      maximumDistance: fixed(1.42),
      weight: 13,
      cue: 'sweep',
    },
    {
      moveId: 'overtake',
      minimumDistance: fixed(1.35),
      maximumDistance: fixed(2.25),
      weight: 10,
      cue: 'special',
    },
  ],
  whiffPunishes: [
    {
      moveId: '5M',
      minimumDistance: 0,
      maximumDistance: fixed(1.38),
      weight: 45,
      cue: 'counter',
    },
    {
      moveId: '5H',
      minimumDistance: fixed(0.65),
      maximumDistance: fixed(1.52),
      weight: 35,
      cue: 'heavy-counter',
    },
    {
      moveId: 'overtake',
      minimumDistance: fixed(1.2),
      maximumDistance: fixed(2.3),
      weight: 20,
      cue: 'special-counter',
    },
  ],
  combos: [
    { moves: ['2L', '5L', '5M', '5H', 'overtake'] },
    { moves: ['5L', '5M', '5H', 'overtake'] },
    { moves: ['5M', '5H', 'overtake'] },
    { moves: ['2M', 'overtake'] },
  ],
};
