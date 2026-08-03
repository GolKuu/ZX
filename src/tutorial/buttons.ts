/**
 * The four attack buttons, named the way the player sees them.
 *
 * The engine's attack slots are called `lp`/`hp`/`lk`/`hk`, and under the
 * default layout those names are actively misleading: `hp` is bound to the I
 * key, which the control standard assigns to a *leg* attack, and `lk` is bound
 * to K, which is an *upper-body* attack. `src/input/lucky/buttons.ts` documents
 * the same trap for Lucky. Authoring a lesson against the slot names would
 * therefore print "heavy punch" next to a kick.
 *
 * So the Tutorial speaks only in `PlayerButton`, and the mapping to slots is
 * *derived from the live bindings* rather than restated — if someone rebinds
 * the layout, the lesson text follows instead of lying.
 */

import {
  ATTACK_BUTTONS,
  BUTTON_BIT,
  DEFAULT_BINDINGS,
  type AttackButton,
  type ButtonMask,
  type KeyBindings,
} from '../input/bindings.js';

/** The four attack keys as the control standard names them. */
export const PLAYER_BUTTONS = ['J', 'K', 'I', 'L'] as const;
export type PlayerButton = (typeof PLAYER_BUTTONS)[number];

const PHYSICAL_KEY: Readonly<Record<PlayerButton, string>> = {
  J: 'KeyJ',
  K: 'KeyK',
  I: 'KeyI',
  L: 'KeyL',
};

/**
 * Which part of the body a button attacks with, per the control standard:
 * J and K are upper body, I and L are legs.
 *
 * `tests/tutorial-buttons.test.mjs` walks every character's standing normals
 * through this table and reports disagreements, so a lesson can never quietly
 * teach that a button does something the move data contradicts.
 */
export type Limb = 'upper' | 'leg';

export const BUTTON_LIMB: Readonly<Record<PlayerButton, Limb>> = {
  J: 'upper',
  K: 'upper',
  I: 'leg',
  L: 'leg',
};

/** Rough weight the control standard assigns each button. */
export const BUTTON_WEIGHT: Readonly<Record<PlayerButton, 'fast' | 'heavy'>> = {
  J: 'fast',
  K: 'heavy',
  I: 'fast',
  L: 'heavy',
};

/**
 * Engine slot a player button commits through, resolved against the bindings in
 * force. Throws rather than guessing: a layout with no key on an attack slot is
 * a configuration bug the Tutorial must not paper over.
 */
export function slotFor(
  button: PlayerButton,
  bindings: KeyBindings = DEFAULT_BINDINGS,
): AttackButton {
  const key = PHYSICAL_KEY[button];
  const slot = ATTACK_BUTTONS.find(
    (candidate) => bindings.buttons[candidate] === key,
  );
  if (slot === undefined) {
    throw new Error(`No attack slot is bound to ${key} (button ${button})`);
  }
  return slot;
}

/** Reverse lookup, so a resolved command can be reported in player notation. */
export function buttonForSlot(
  slot: AttackButton,
  bindings: KeyBindings = DEFAULT_BINDINGS,
): PlayerButton {
  const button = PLAYER_BUTTONS.find(
    (candidate) => bindings.buttons[slot] === PHYSICAL_KEY[candidate],
  );
  if (button === undefined) {
    throw new Error(`Attack slot "${slot}" is not on a tutorial button`);
  }
  return button;
}

/** The physical key a button sits on, for the on-screen prompt. */
export function keyFor(
  button: PlayerButton,
  bindings: KeyBindings = DEFAULT_BINDINGS,
): string {
  return bindings.buttons[slotFor(button, bindings)];
}

export function chordMask(
  buttons: readonly PlayerButton[],
  bindings: KeyBindings = DEFAULT_BINDINGS,
): ButtonMask {
  return buttons.reduce(
    (mask, button) => mask | BUTTON_BIT[slotFor(button, bindings)],
    0,
  );
}

/** `['J','K']` → `"J+K"`, the notation every instruction uses. */
export function chordNotation(buttons: readonly PlayerButton[]): string {
  return buttons.join('+');
}

/** The shared chords the control standard defines for the whole roster. */
export const SHARED_CHORDS = {
  dualHand: ['J', 'K'],
  dualLeg: ['I', 'L'],
  throw: ['J', 'I'],
  mechanic: ['K', 'L'],
  superOne: ['J', 'K', 'I'],
  superTwo: ['K', 'I', 'L'],
  ultimate: ['J', 'K', 'I', 'L'],
} as const satisfies Readonly<Record<string, readonly PlayerButton[]>>;

export type SharedChordId = keyof typeof SHARED_CHORDS;
