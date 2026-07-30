import {
  ATTACK_BUTTONS,
  BUTTON_BIT,
  type ButtonMask,
} from './bindings.js';

/** Every button that commits a move. Block and dash stay outside the gate. */
const ATTACK_INPUT_MASK = [
  ...ATTACK_BUTTONS,
  'super' as const,
  'ultimate' as const,
  'taunt' as const,
].reduce((mask, button) => mask | BUTTON_BIT[button], 0);

/**
 * Drops attacks made while a fighter cannot act.
 *
 * A held attack stays suppressed after the lock opens. The player must release
 * it before a new press can be accepted, so holding or mashing cannot queue the
 * next move behind an animation.
 */
export class AttackButtonGate {
  private suppressedUntilRelease = false;

  public filter(buttons: ButtonMask, attacksLocked: boolean): ButtonMask {
    const attackHeld = (buttons & ATTACK_INPUT_MASK) !== 0;

    if (!attackHeld) {
      this.suppressedUntilRelease = false;
    } else if (attacksLocked) {
      this.suppressedUntilRelease = true;
    }

    return attacksLocked || this.suppressedUntilRelease
      ? buttons & ~ATTACK_INPUT_MASK
      : buttons;
  }

  public reset(): void {
    this.suppressedUntilRelease = false;
  }
}
