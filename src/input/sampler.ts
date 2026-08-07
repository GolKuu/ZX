/**
 * The pure half of reading a player: physical input → one `FighterInput`.
 *
 * Split out of `keyboard.ts` so that live play and Training Mode playback run
 * the *same* code. A replay that re-implemented guarding, dashing and command
 * resolution would eventually disagree with the keyboard about one of them, and
 * the recording would stop being evidence of anything.
 */

import type { FighterInput } from '../sim/state.js';
import type { ButtonMask, Direction } from './bindings.js';
import {
  horizontalOf,
  isCrouching as isCrouchDirection,
  isJumping,
  toFacingRelative,
} from './bindings.js';
import { InputBuffer } from './buffer.js';
import {
  DEFAULT_CONTEXT,
  isGuarding,
  resolveCommand,
  type CommandContext,
  type CommandRow,
} from './command.js';
import { AttackButtonGate } from './attack-gate.js';
import {
  DEFAULT_INPUT_PROFILE,
  DoubleTapDash,
  isDirectionalGuard,
  type InputProfile,
} from './profiles.js';

/** One frame of physical input, in screen space, exactly as the player made it. */
export interface RecordedInputFrame {
  /** Screen-space direction — not yet mirrored by facing. */
  readonly direction: Direction;
  readonly buttons: ButtonMask;
}

export class InputSampler {
  private readonly buffer = new InputBuffer();
  private readonly rawBuffer = new InputBuffer();
  private readonly attackGate = new AttackButtonGate();
  private readonly doubleTapDash = new DoubleTapDash();
  private readonly commands: readonly CommandRow[];
  private readonly sequenceCommands: readonly CommandRow[];
  private readonly profile: InputProfile;
  private sampledFrames = 0;
  private consumedSequencePressFrame = -1;

  public constructor(
    commands: readonly CommandRow[],
    profile: InputProfile = DEFAULT_INPUT_PROFILE,
  ) {
    this.commands = commands.filter((row) => row.attackSequence === undefined);
    this.sequenceCommands = commands.filter((row) => row.attackSequence !== undefined);
    this.profile = profile;
  }

  public sample(
    screenDirection: Direction,
    rawButtons: ButtonMask,
    facing: -1 | 1,
    attacksLocked = false,
    context: CommandContext = DEFAULT_CONTEXT,
  ): FighterInput {
    const direction = toFacingRelative(screenDirection, facing);
    this.rawBuffer.push(direction, rawButtons);
    const buttons = this.attackGate.filter(rawButtons, attacksLocked);
    this.buffer.push(direction, buttons);

    const sequence = attacksLocked
      ? null
      : resolveCommand(this.rawBuffer, this.sequenceCommands, context, {
          leeway: 24,
        });
    const sequencePressFrame = sequence === null
      ? -1
      : this.sampledFrames - sequence.pressedAgo;
    const freshSequence = sequence !== null
      && sequencePressFrame > this.consumedSequencePressFrame
      ? sequence
      : null;
    if (freshSequence !== null) {
      this.consumedSequencePressFrame = sequencePressFrame;
    }
    const regularCommand = resolveCommand(this.buffer, this.commands, context, {
      ...(this.profile.leeway === undefined
        ? {}
        : { leeway: this.profile.leeway }),
      ...(this.profile.settleFrames === undefined
        ? {}
        : { settleFrames: this.profile.settleFrames }),
    });
    const command = freshSequence ?? regularCommand;
    this.sampledFrames += 1;

    // A directional guard yields to any command the player actually committed,
    // so Back+K+L is Lucky Guard rather than a block that swallows the input.
    const guard = this.profile.guard === 'holdBack'
      ? isDirectionalGuard(direction) && command === null
      : isGuarding(this.buffer);
    const dash = guard
      ? 0
      : this.profile.dash === 'doubleTap'
        ? this.doubleTapDash.read(this.buffer, direction)
        : this.readDashPress(direction);
    const walkingGuard = guard && this.profile.guardWhileWalking === true;
    const suppressJump = command !== null
      && this.profile.suppressJumpFor?.has(command.moveId) === true;

    const horizontal = horizontalOf(direction);
    return {
      movement: guard && !walkingGuard ? 0 : horizontal,
      guard,
      ...(walkingGuard ? { guardWhileWalking: true } : {}),
      guardMode: guard && this.buffer.isHeld('super') ? 'pain' : 'normal',
      crouching: isCrouchDirection(direction),
      jump: !guard && !suppressJump && isJumping(direction),
      dash,
      // Mounted controls. The engine ignores these unless a plane is held, so
      // they cost nothing on the ground: up alone climbs, up plus a horizontal
      // kicks off, a bare horizontal steps off.
      wallClimb: isJumping(direction) && horizontal === 0
        ? 1
        : isCrouchDirection(direction)
          ? -1
          : 0,
      wallJump: isJumping(direction) && horizontal !== 0,
      wallExit: isJumping(direction) ? 0 : horizontal,
      ...(command === null ? {} : { move: command.moveId }),
    };
  }

  /** Exposed for the input display and for replay capture. */
  public get history(): InputBuffer {
    return this.buffer;
  }

  public reset(): void {
    this.buffer.clear();
    this.rawBuffer.clear();
    this.attackGate.reset();
    this.doubleTapDash.reset();
    this.sampledFrames = 0;
    this.consumedSequencePressFrame = -1;
  }

  /**
   * Dash is a press, not a hold: only the frame the key goes down starts one.
   * With no direction held the dash goes forward, which is what a player who
   * taps dash out of neutral means.
   */
  private readDashPress(direction: Direction): -1 | 0 | 1 {
    if (this.buffer.framesSincePress('dash') !== 0) {
      return 0;
    }
    const horizontal = horizontalOf(direction);
    return horizontal === 0 ? 1 : horizontal;
  }
}
