/**
 * The in-game move list, generated from the command catalogue.
 *
 * Both notations are produced from the same row that the matcher uses, so the
 * printed command and the accepted command cannot drift apart. The keyboard
 * column is written for a right-facing Lucky because that is what a player sees
 * on player one's side; the relative column is the side-independent truth.
 */

import type { MotionId } from '../motion.js';
import { LUCKY_CATALOGUE, type LuckyCommandSpec } from './catalogue.js';
import { luckyChordNotation } from './buttons.js';

export interface LuckyMoveListEntry {
  readonly moveId: string;
  readonly name: string;
  /** e.g. `S, S+D, D+I` — what to press while facing right. */
  readonly keyboard: string;
  /** e.g. `Down, Down-Forward, Forward + I` — side-independent. */
  readonly relative: string;
  readonly category: LuckyCommandSpec['category'];
  readonly limb: LuckyCommandSpec['limb'];
  readonly cost: string;
  readonly description: string;
}

/** Keyboard spelling of each motion, facing right. */
const MOTION_KEYS: Readonly<Record<MotionId, string>> = {
  none: '',
  qcf: 'S, S+D, D',
  qcb: 'S, S+A, A',
  qcf2: 'S, S+D, D, S, S+D, D',
  qcb2: 'S, S+A, A, S, S+A, A',
  hcf: 'A, S+A, S, S+D, D',
  hcb: 'D, S+D, S, S+A, A',
  dp: 'D, S, S+D',
  rdp: 'A, S, S+A',
  dd: 'S, S',
  ff: 'D, D',
  bb: 'A, A',
  chargeBackForward: 'hold A 40f, D',
  chargeDownUp: 'hold S 40f, W',
};

/** Facing-relative spelling of each motion. */
const MOTION_RELATIVE: Readonly<Record<MotionId, string>> = {
  none: '',
  qcf: 'Down, Down-Forward, Forward',
  qcb: 'Down, Down-Back, Back',
  qcf2: 'Down, Down-Forward, Forward ×2',
  qcb2: 'Down, Down-Back, Back ×2',
  hcf: 'Back, Down-Back, Down, Down-Forward, Forward',
  hcb: 'Forward, Down-Forward, Down, Down-Back, Back',
  dp: 'Forward, Down, Down-Forward',
  rdp: 'Back, Down, Down-Back',
  dd: 'Down, Down',
  ff: 'Forward, Forward',
  bb: 'Back, Back',
  chargeBackForward: 'hold Back 40f, Forward',
  chargeDownUp: 'hold Down 40f, Up',
};

const DIRECTION_KEYS = {
  forward: 'D',
  back: 'A',
  down: 'S',
  up: 'W',
} as const;

const DIRECTION_RELATIVE = {
  forward: 'Forward',
  back: 'Back',
  down: 'Down',
  up: 'Up',
} as const;

export function luckyKeyboardNotation(spec: LuckyCommandSpec): string {
  const chord = luckyChordNotation(spec.buttons);
  const motion = MOTION_KEYS[spec.motion];
  const direction = spec.direction === undefined
    ? ''
    : DIRECTION_KEYS[spec.direction];
  const press = direction === '' ? chord : `${direction}+${chord}`;
  const air = spec.stance === 'air' ? ' (in air)' : '';
  return motion === '' ? `${press}${air}` : `${motion}+${chord}${air}`;
}

export function luckyRelativeNotation(spec: LuckyCommandSpec): string {
  const chord = luckyChordNotation(spec.buttons);
  const motion = MOTION_RELATIVE[spec.motion];
  const direction = spec.direction === undefined
    ? ''
    : DIRECTION_RELATIVE[spec.direction];
  const press = direction === '' ? chord : `${direction} + ${chord}`;
  const air = spec.stance === 'air' ? ' (in air)' : '';
  return motion === '' ? `${press}${air}` : `${motion} + ${chord}${air}`;
}

function costOf(spec: LuckyCommandSpec): string {
  const parts: string[] = [];
  if (spec.luckCost !== undefined) parts.push(`${String(spec.luckCost)} Luck`);
  if (spec.luckRequired !== undefined) {
    parts.push(`Luck ${String(spec.luckRequired)}+`);
  }
  if (spec.meterCost !== undefined) {
    parts.push(`${String(spec.meterCost)}% energy`);
  }
  if (spec.requiresUltimate === true) parts.push('Ultimate ready');
  return parts.length === 0 ? '—' : parts.join(', ');
}

export const LUCKY_MOVE_LIST: readonly LuckyMoveListEntry[] = LUCKY_CATALOGUE
  .map((spec) => ({
    moveId: spec.moveId,
    name: spec.name,
    keyboard: luckyKeyboardNotation(spec),
    relative: luckyRelativeNotation(spec),
    category: spec.category,
    limb: spec.limb,
    cost: costOf(spec),
    description: spec.description,
  }));

/**
 * The movement commands, which are directions rather than catalogue rows.
 *
 * They still belong in the move list: a player who cannot find "how do I dash"
 * has an undocumented command, which the brief counts as a defect.
 */
export const LUCKY_MOVEMENT_LIST: readonly LuckyMoveListEntry[] = [
  movement('Walk Forward', 'D', 'Forward', 'Advance.'),
  movement('Walk Backward', 'A', 'Back', 'Retreat, and guard while doing it.'),
  movement('Crouch', 'S', 'Down', 'Duck under highs.'),
  movement('Neutral Jump', 'W', 'Up', 'Straight up.'),
  movement('Forward Jump', 'W+D', 'Up-Forward', 'Jump in.'),
  movement('Back Jump', 'W+A', 'Up-Back', 'Jump away.'),
  movement('Forward Dash', 'D, D', 'Forward, Forward', 'Double-tap Forward.'),
  movement('Back Dash', 'A, A', 'Back, Back', 'Double-tap Back.'),
  movement(
    'Standing Block',
    'hold A',
    'hold Back',
    'Holding Back guards; there is no block button.',
  ),
  movement(
    'Crouching Block',
    'hold S+A',
    'hold Down-Back',
    'Guards lows. Highs go over it.',
  ),
  movement(
    'Perfect Block',
    'tap A on impact',
    'tap Back on impact',
    'Tapping Back inside the three-frame window reduces block stun and pays '
    + 'a little Luck.',
  ),
];

function movement(
  name: string,
  keyboard: string,
  relative: string,
  description: string,
): LuckyMoveListEntry {
  return {
    moveId: `lucky.movement.${name.toLowerCase().replace(/ /gu, '-')}`,
    name,
    keyboard,
    relative,
    category: 'movement',
    limb: 'none',
    cost: '—',
    description,
  };
}
