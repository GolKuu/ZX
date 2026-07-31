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

export const MODIFIER_BUTTONS = [
  'block',
  'dash',
  'taunt',
  'super',
  'ultimate',
] as const;
export type ModifierButton = (typeof MODIFIER_BUTTONS)[number];

/** Physical meme keys reserved for MIM. Other command tables ignore them. */
export const MIM_BUTTONS = ['mimQ', 'mimE', 'mimR', 'mimF'] as const;
export type MimButton = (typeof MIM_BUTTONS)[number];

export type Button = AttackButton | ModifierButton | MimButton;

/** Bit positions. Stable — the buffer stores these as a packed mask. */
export const BUTTON_BIT: Readonly<Record<Button, number>> = {
  lp: 1 << 0,
  hp: 1 << 1,
  lk: 1 << 2,
  hk: 1 << 3,
  block: 1 << 4,
  dash: 1 << 5,
  taunt: 1 << 6,
  super: 1 << 7,
  ultimate: 1 << 8,
  mimQ: 1 << 9,
  mimE: 1 << 10,
  mimR: 1 << 11,
  mimF: 1 << 12,
};

export type ButtonMask = number;

export interface KeyBindings {
  readonly up: string;
  readonly down: string;
  readonly left: string;
  readonly right: string;
  readonly buttons: Readonly<Record<Button, string>>;
}

/**
 * Default layout: W A S D to move, J K I L for the four attack buttons.
 *
 * `up` is the jump key. On a plane it is also the climb key — the 7/8/9
 * diagonals separate "run up the wall" from "kick off it", which is why the
 * direction model needs a real upward key rather than a space bar.
 */
export const DEFAULT_BINDINGS: KeyBindings = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  buttons: {
    lp: 'KeyJ',
    hp: 'KeyI',
    lk: 'KeyK',
    hk: 'KeyL',
    block: 'ShiftLeft',
    dash: 'ControlLeft',
    taunt: 'KeyT',
    super: 'KeyU',
    ultimate: 'KeyO',
    mimQ: 'KeyQ',
    mimE: 'KeyE',
    mimR: 'KeyR',
    mimF: 'KeyF',
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
    dash: 'Numpad0',
    taunt: 'NumpadDecimal',
    super: 'Numpad6',
    ultimate: 'Numpad9',
    mimQ: 'Numpad7',
    mimE: 'Numpad8',
    mimR: 'NumpadDivide',
    mimF: 'NumpadMultiply',
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
  for (
    const button of [
      ...ATTACK_BUTTONS,
      ...MODIFIER_BUTTONS,
      ...MIM_BUTTONS,
    ]
  ) {
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
