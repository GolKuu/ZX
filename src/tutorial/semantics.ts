/**
 * Semantic directions — the vocabulary the Tutorial teaches instead of raw keys.
 *
 * The brief's hard rule is "do not teach Forward as permanently equal to D".
 * Everything here is therefore derived from the *runtime* facing through the
 * engine's own `toFacingRelative`, so a lesson that says "walk Forward" keeps
 * meaning the same thing after the fighters switch sides. `tests/tutorial-input.test.mjs`
 * drives this both ways round to prove it.
 */

import {
  DEFAULT_BINDINGS,
  horizontalOf,
  isCrouching,
  isJumping,
  toFacingRelative,
  type Direction,
  type KeyBindings,
} from '../input/bindings.js';

export type SemanticDirection =
  | 'neutral'
  | 'forward'
  | 'back'
  | 'up'
  | 'down'
  | 'downForward'
  | 'downBack'
  | 'upForward'
  | 'upBack';

/**
 * Facing-relative numpad → semantic name.
 *
 * Authored as a table rather than derived from `horizontalOf` + `isCrouching`
 * so the eight diagonals are stated once and cannot drift apart.
 */
const BY_RELATIVE: Readonly<Record<Direction, SemanticDirection>> = {
  1: 'downBack',
  2: 'down',
  3: 'downForward',
  4: 'back',
  5: 'neutral',
  6: 'forward',
  7: 'upBack',
  8: 'up',
  9: 'upForward',
};

/** Screen-space direction plus facing → what the player should call it. */
export function semanticOf(
  screenDirection: Direction,
  facing: -1 | 1,
): SemanticDirection {
  return BY_RELATIVE[toFacingRelative(screenDirection, facing)];
}

/** The reverse: a semantic direction as a facing-relative numpad digit. */
export function relativeOf(semantic: SemanticDirection): Direction {
  const found = (Object.keys(BY_RELATIVE) as unknown as Direction[]).find(
    (digit) => BY_RELATIVE[digit] === semantic,
  );
  if (found === undefined) {
    throw new Error(`Unknown semantic direction "${semantic}"`);
  }
  return found;
}

/**
 * Which physical keys currently produce a semantic direction.
 *
 * This is what the on-screen prompt reads, which is why it takes `facing`:
 * "Forward" is the D key on the left side of the screen and the A key on the
 * right, and the prompt has to say so or the lesson teaches a falsehood.
 */
export function keysForSemantic(
  semantic: SemanticDirection,
  facing: -1 | 1,
  bindings: KeyBindings = DEFAULT_BINDINGS,
): readonly string[] {
  const relative = relativeOf(semantic);
  const keys: string[] = [];
  const horizontal = horizontalOf(relative);
  if (horizontal !== 0) {
    // Forward in facing-relative space is +x on the screen only when facing
    // right; mirroring here is the whole point of the function.
    const screenRight = horizontal === 1 ? facing === 1 : facing === -1;
    keys.push(screenRight ? bindings.right : bindings.left);
  }
  if (isJumping(relative)) keys.push(bindings.up);
  if (isCrouching(relative)) keys.push(bindings.down);
  return keys;
}

/** True when the player is currently holding exactly this semantic direction. */
export function matchesSemantic(
  screenDirection: Direction,
  facing: -1 | 1,
  semantic: SemanticDirection,
): boolean {
  return semanticOf(screenDirection, facing) === semantic;
}

/**
 * Looser test used by movement objectives: "is there a Forward component?"
 *
 * Walking forward while crouch-blocking is still walking forward, so a step
 * that only cares about the horizontal must not demand a bare 6.
 */
export function hasSemanticComponent(
  screenDirection: Direction,
  facing: -1 | 1,
  component: 'forward' | 'back' | 'up' | 'down',
): boolean {
  const relative = toFacingRelative(screenDirection, facing);
  if (component === 'forward') return horizontalOf(relative) === 1;
  if (component === 'back') return horizontalOf(relative) === -1;
  if (component === 'up') return isJumping(relative);
  return isCrouching(relative);
}

export const SEMANTIC_GLYPH: Readonly<Record<SemanticDirection, string>> = {
  neutral: '·',
  forward: '→',
  back: '←',
  up: '↑',
  down: '↓',
  downForward: '↘',
  downBack: '↙',
  upForward: '↗',
  upBack: '↖',
};
