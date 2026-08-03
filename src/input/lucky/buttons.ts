/**
 * Lucky's semantic button layer.
 *
 * The engine's four attack slots are historically named `lp`/`hp`/`lk`/`hk`
 * ("light punch", "heavy kick", …). Those names are a lie for Lucky: the brief
 * assigns roles to the *physical keys* J K I L, and the default layout binds
 * them in an order that does not match the slot names —
 *
 *   KeyJ → lp    KeyK → lk    KeyI → hp    KeyL → hk
 *
 * so authoring a Lucky move against `hp` while thinking "heavy punch" would
 * silently put an arm attack on the I key, which the brief forbids. Every Lucky
 * command is therefore authored against `LuckyButton` and translated here once.
 *
 * The limb table is the machine-checkable half of the rule "J and K must never
 * trigger kicks; I and L must never trigger punches". `tests/lucky-input.test.mjs`
 * walks the whole command table through it.
 */

import type { AttackButton, Button, KeyBindings } from '../bindings.js';
import { BUTTON_BIT, DEFAULT_BINDINGS } from '../bindings.js';

/** The four attack keys, named as the player sees them. */
export const LUCKY_BUTTONS = ['J', 'K', 'I', 'L'] as const;
export type LuckyButton = (typeof LUCKY_BUTTONS)[number];

/** Physical key each role maps to under the default layout. */
export const LUCKY_BUTTON_KEY: Readonly<Record<LuckyButton, string>> = {
  J: 'KeyJ',
  K: 'KeyK',
  I: 'KeyI',
  L: 'KeyL',
};

/** Engine attack slot each role commits through. */
export const LUCKY_BUTTON_SLOT: Readonly<Record<LuckyButton, AttackButton>> = {
  J: 'lp',
  K: 'lk',
  I: 'hp',
  L: 'hk',
};

/** Reverse lookup, so a resolved command can be reported in player notation. */
export const LUCKY_SLOT_BUTTON: Readonly<Record<AttackButton, LuckyButton>> = {
  lp: 'J',
  lk: 'K',
  hp: 'I',
  hk: 'L',
};

/**
 * Which part of the body a button is allowed to attack with.
 *
 * `upper` covers fists, palms, elbows and shoulders; `leg` covers knees, shins,
 * heels and feet. A move whose limb disagrees with its committing button is a
 * hard failure, not a style note.
 */
export type LuckyLimb = 'upper' | 'leg';

export const LUCKY_BUTTON_LIMB: Readonly<Record<LuckyButton, LuckyLimb>> = {
  J: 'upper',
  K: 'upper',
  I: 'leg',
  L: 'leg',
};

/** Bit mask covering exactly the four Lucky attack slots. */
export const LUCKY_ATTACK_MASK = LUCKY_BUTTONS.reduce(
  (mask, button) => mask | BUTTON_BIT[LUCKY_BUTTON_SLOT[button]],
  0,
);

/** Every engine button Lucky is allowed to reference. Nothing else may appear. */
export const LUCKY_ALLOWED_BUTTONS: readonly Button[] = LUCKY_BUTTONS.map(
  (button) => LUCKY_BUTTON_SLOT[button],
);

export function luckySlots(
  buttons: readonly LuckyButton[],
): readonly AttackButton[] {
  return buttons.map((button) => LUCKY_BUTTON_SLOT[button]);
}

export function luckyChordMask(buttons: readonly LuckyButton[]): number {
  return buttons.reduce(
    (mask, button) => mask | BUTTON_BIT[LUCKY_BUTTON_SLOT[button]],
    0,
  );
}

/**
 * The physical keys a chord occupies, for the keyboard-ghosting audit.
 *
 * Reported by `tests/lucky-input.test.mjs` so a four-key chord that a cheap
 * membrane keyboard cannot register is caught as a documentation duty rather
 * than discovered by a player.
 */
export function luckyKeysFor(
  buttons: readonly LuckyButton[],
  bindings: KeyBindings = DEFAULT_BINDINGS,
): readonly string[] {
  return buttons.map((button) => bindings.buttons[LUCKY_BUTTON_SLOT[button]]);
}

/** Player-facing notation, e.g. `['J','K','I']` → `"J+K+I"`. */
export function luckyChordNotation(buttons: readonly LuckyButton[]): string {
  return buttons.join('+');
}
