/**
 * Kept as the module the rest of the app imports from; the table itself now
 * lives in `src/input/lucky/` where it is generated from the move catalogue.
 */

export {
  LUCKY_COMMANDS,
  LUCKY_INPUT_TUNING,
  LUCKY_JUMP_SUPPRESSING_MOVES,
} from './lucky/commands.js';
export {
  LUCKY_CATALOGUE,
  type LuckyCategory,
  type LuckyCommandSpec,
  type LuckyDirection,
} from './lucky/catalogue.js';
export {
  LUCKY_ATTACK_MASK,
  LUCKY_BUTTONS,
  LUCKY_BUTTON_KEY,
  LUCKY_BUTTON_LIMB,
  LUCKY_BUTTON_SLOT,
  LUCKY_SLOT_BUTTON,
  luckyChordNotation,
  luckyKeysFor,
  type LuckyButton,
  type LuckyLimb,
} from './lucky/buttons.js';
