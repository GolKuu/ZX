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
  AANG_COMMANDS,
} from './aangCommands.js';

export {
  IDOL_COMMANDS,
} from './idolCommands.js';

export {
  ECHO_COMMANDS,
} from './echoCommands.js';

export {
  CHRONO_COMMANDS,
} from './chronoCommands.js';

export {
  MIM_COMMANDS,
} from './mimCommands.js';

export {
  GLITCH_COMMANDS,
} from './glitchCommands.js';

export {
  DEFAULT_CONTEXT,
  KADE_COMMANDS,
  isGuarding,
  resolveCommand,
  type CommandContext,
  type CommandRow,
  type ResolvedCommand,
} from './command.js';

export { AttackButtonGate } from './attack-gate.js';
