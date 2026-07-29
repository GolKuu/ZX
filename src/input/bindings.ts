/**
 * Keyboard bindings and the facing-relative direction model.
 *
 * This module is DOM-adjacent but pure: it maps a set of held physical keys to
 * a numpad direction and a button mask. It never touches `window`.
 */

/** Numpad notation. 5 is neutral. */
export type Direction = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const ATTACK_BUTTONS = ['lp', 'hp', 'lk', 'hk'] as const;
export type AttackButton = (typeof ATTACK_BUTTONS)[number];

export const MODIFIER_BUTTONS = ['block', 'special'] as const;
export type ModifierButton = (typeof MODIFIER_BUTTONS)[number];

export type Button = AttackButton | ModifierButton;

/** Bit positions. Stable — the buffer stores these as a packed mask. */
export const BUTTON_BIT: Readonly<Record<Button, number>> = {
  lp: 1 << 0,
  hp: 1 << 1,
  lk: 1 << 2,
  hk: 1 << 3,
  block: 1 << 4,
  special: 1 << 5,
};

export type ButtonMask = number;

export interface KeyBindings {
  readonly up: string;
  readonly down: string;
  readonly left: string;
  readonly right: string;
  readonly buttons: Readonly<Record<Button, string>>;
}

/** Default layout, per the Phase 3 brief. */
export const DEFAULT_BINDINGS: KeyBindings = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  buttons: {
    lp: 'KeyJ',
    hp: 'KeyK',
    lk: 'KeyL',
    hk: 'KeyU',
    block: 'KeyI',
    special: 'KeyO',
  },
};

/** Player two, so local versus works without a pad. */
export const PLAYER_TWO_BINDINGS: KeyBindings = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  buttons: {
    lp: 'Numpad1',
    hp: 'Numpad2',
    lk: 'Numpad3',
    hk: 'Numpad4',
    block: 'Numpad5',
    special: 'Numpad6',
  },
};

/**
 * Collapse held keys to a numpad direction in *screen* space.
 *
 * Opposing horizontals cancel to neutral, which is the least surprising SOCD
 * resolution and the only one that cannot produce an input the player did not
 * make.
 */
export function resolveDirection(
  held: ReadonlySet<string>,
  bindings: KeyBindings,
): Direction {
  const left = held.has(bindings.left);
  const right = held.has(bindings.right);
  const up = held.has(bindings.up);
  const down = held.has(bindings.down);

  const horizontal = left === right ? 0 : right ? 1 : -1;
  const vertical = up === down ? 0 : up ? 1 : -1;

  return toDirection(horizontal, vertical);
}

export function toDirection(horizontal: number, vertical: number): Direction {
  const row = vertical > 0 ? 6 : vertical < 0 ? 0 : 3;
  const column = horizontal > 0 ? 3 : horizontal < 0 ? 1 : 2;
  return (row + column) as Direction;
}

/**
 * Convert a screen-space direction to a facing-relative one, so a quarter-circle
 * forward is authored once and works on both sides of the screen.
 */
export function toFacingRelative(
  direction: Direction,
  facing: -1 | 1,
): Direction {
  if (facing === 1) {
    return direction;
  }
  const mirrored: Readonly<Record<Direction, Direction>> = {
    1: 3,
    2: 2,
    3: 1,
    4: 6,
    5: 5,
    6: 4,
    7: 9,
    8: 8,
    9: 7,
  };
  return mirrored[direction];
}

export function readButtonMask(
  held: ReadonlySet<string>,
  bindings: KeyBindings,
): ButtonMask {
  let mask = 0;
  for (const button of [...ATTACK_BUTTONS, ...MODIFIER_BUTTONS]) {
    if (held.has(bindings.buttons[button])) {
      mask |= BUTTON_BIT[button];
    }
  }
  return mask;
}

export function hasButton(mask: ButtonMask, button: Button): boolean {
  return (mask & BUTTON_BIT[button]) !== 0;
}

/** True when the direction contains a downward component. */
export function isCrouching(direction: Direction): boolean {
  return direction === 1 || direction === 2 || direction === 3;
}

/** True when the direction contains an upward component. */
export function isJumping(direction: Direction): boolean {
  return direction === 7 || direction === 8 || direction === 9;
}

/** −1 back, 0 neutral, 1 forward, in facing-relative space. */
export function horizontalOf(direction: Direction): -1 | 0 | 1 {
  if (direction === 3 || direction === 6 || direction === 9) {
    return 1;
  }
  if (direction === 1 || direction === 4 || direction === 7) {
    return -1;
  }
  return 0;
}
