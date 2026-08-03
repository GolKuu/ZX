/**
 * DOM-free surface of the input layer.
 *
 * Everything re-exported here is pure and deterministic, so it compiles into the
 * simulation test build and can be driven from a replay without a browser.
 * `keyboard.ts` is deliberately absent — it is the only module that touches DOM.
 */

export {
  ATTACK_BUTTONS,
  BUTTON_BIT,
  DEFAULT_BINDINGS,
  MIM_BUTTONS,
  MODIFIER_BUTTONS,
  PLAYER_TWO_BINDINGS,
  hasButton,
  horizontalOf,
  isCrouching,
  isJumping,
  readButtonMask,
  resolveDirection,
  toDirection,
  toFacingRelative,
  type AttackButton,
  type Button,
  type ButtonMask,
  type Direction,
  type KeyBindings,
  type MimButton,
  type ModifierButton,
} from './bindings.js';

export {
  BUFFER_CAPACITY,
  INPUT_LEEWAY_FRAMES,
  InputBuffer,
  type InputFrame,
} from './buffer.js';

export { detectMotion, matchesMotion, type MotionId } from './motion.js';

export {
  MIM_COMMANDS,
} from './mimCommands.js';

export {
  GLITCH_COMMANDS,
} from './glitchCommands.js';

export { VORGH_COMMANDS } from './vorghCommands.js';

export { TITAN_COMMANDS } from './titanCommands.js';

export {
  LUCKY_ATTACK_MASK,
  LUCKY_BUTTONS,
  LUCKY_BUTTON_KEY,
  LUCKY_BUTTON_LIMB,
  LUCKY_BUTTON_SLOT,
  LUCKY_CATALOGUE,
  LUCKY_COMMANDS,
  LUCKY_INPUT_TUNING,
  LUCKY_JUMP_SUPPRESSING_MOVES,
  LUCKY_SLOT_BUTTON,
  luckyChordNotation,
  luckyKeysFor,
  type LuckyButton,
  type LuckyCategory,
  type LuckyCommandSpec,
  type LuckyDirection,
  type LuckyLimb,
} from './luckyCommands.js';

export {
  DEFAULT_INPUT_PROFILE,
  DoubleTapDash,
  LUCKY_INPUT_PROFILE,
  isDirectionalGuard,
  type InputProfile,
} from './profiles.js';

export { commandsFor, profileFor } from './characterProfile.js';

export {
  LUCKY_MOVEMENT_LIST,
  LUCKY_MOVE_LIST,
  luckyKeyboardNotation,
  luckyRelativeNotation,
  type LuckyMoveListEntry,
} from './lucky/moveList.js';

export {
  InputSampler,
  type RecordedInputFrame,
} from './sampler.js';

export {
  DIRECTION_GLYPH,
  InputRecorder,
  ReplayInputSource,
  luckyButtonMask,
  readInputHistory,
  type InputHistoryEntry,
} from './training.js';

export {
  DEFAULT_CONTEXT,
  KADE_COMMANDS,
  isGuarding,
  resolveCommand,
  type CommandContext,
  type CommandResolutionOptions,
  type CommandRow,
  type ResolvedCommand,
} from './command.js';

export { AttackButtonGate } from './attack-gate.js';
