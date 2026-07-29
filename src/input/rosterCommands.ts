/**
 * Command tables for the two new roster slots.
 *
 * Notation from the brief maps onto the four-button scheme as:
 *   P = punch → `lp` or `hp`      K = kick → `lk` or `hk`
 *
 * A `+ P` command therefore becomes two rows, one per punch button. Rows are
 * cheap; branching in the resolver is not (rule R6).
 *
 * Order matters. Rows are matched top-down, so the longest motion for a given
 * button must come first — a half-circle back contains a quarter-circle back,
 * and whichever row is listed first wins.
 */

import type { CommandRow } from './command.js';

/* ------------------------------------------------------------------ */
/* Velocity King — Kade Ruven (rushdown / frame trap)                  */
/* ------------------------------------------------------------------ */

export const VELOCITY_KING_COMMANDS: readonly CommandRow[] = [
  // Command Throw [Half-Circle Back + LP+LK].
  // Listed first: HCB contains QCB, and LP alone is a normal.
  {
    moveId: 'vk.throw',
    motion: 'hcb',
    button: 'lp',
    alsoPressed: ['lk'],
    stance: 'any',
  },
  {
    moveId: 'vk.throw',
    motion: 'hcb',
    button: 'lk',
    alsoPressed: ['lp'],
    stance: 'any',
  },

  // Projection Sorcery [QCF + K].
  { moveId: 'vk.projection', motion: 'qcf', button: 'lk', stance: 'any' },
  { moveId: 'vk.projection', motion: 'qcf', button: 'hk', stance: 'any' },

  // Shared normals. The character's identity is the passive and the dash, not
  // a bespoke normal set.
  { moveId: '2L', motion: 'none', button: 'lp', stance: 'crouching' },
  { moveId: '2M', motion: 'none', button: 'lk', stance: 'crouching' },
  { moveId: '5L', motion: 'none', button: 'lp', stance: 'standing' },
  { moveId: '5M', motion: 'none', button: 'lk', stance: 'standing' },
  { moveId: '5H', motion: 'none', button: 'hp', stance: 'standing' },
  { moveId: '2M', motion: 'none', button: 'hk', stance: 'any' },
];

/* ------------------------------------------------------------------ */
/* Elastic Brawler — Tamsin Oduya (mid-range / stance)                 */
/* ------------------------------------------------------------------ */

export const ELASTIC_BRAWLER_COMMANDS: readonly CommandRow[] = [
  // Gear Shift [Down, Down + P+K]. First — `dd` shares buttons with everything.
  {
    moveId: 'eb.gear',
    motion: 'dd',
    button: 'lp',
    alsoPressed: ['lk'],
    stance: 'any',
  },
  {
    moveId: 'eb.gear',
    motion: 'dd',
    button: 'hp',
    alsoPressed: ['hk'],
    stance: 'any',
  },

  // Axe [QCB + K] — overhead.
  { moveId: 'eb.axe', motion: 'qcb', button: 'lk', stance: 'any' },
  { moveId: 'eb.axe', motion: 'qcb', button: 'hk', stance: 'any' },

  // Pistol [QCF + P].
  { moveId: 'eb.pistol', motion: 'qcf', button: 'lp', stance: 'any' },
  { moveId: 'eb.pistol', motion: 'qcf', button: 'hp', stance: 'any' },

  // Shared normals.
  { moveId: '2L', motion: 'none', button: 'lp', stance: 'crouching' },
  { moveId: '2M', motion: 'none', button: 'lk', stance: 'crouching' },
  { moveId: '5L', motion: 'none', button: 'lp', stance: 'standing' },
  { moveId: '5M', motion: 'none', button: 'lk', stance: 'standing' },
  { moveId: '5H', motion: 'none', button: 'hp', stance: 'standing' },
  { moveId: '2M', motion: 'none', button: 'hk', stance: 'any' },
];
