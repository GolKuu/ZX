/**
 * Keyboard adapter: DOM key events → one `FighterInput` per simulation frame.
 *
 * Attach/detach own the listeners; `sample` is called once per fixed tick by the
 * game loop. Nothing here runs per animation frame.
 */

import type { FighterInput } from '../sim/state.js';
import {
  DEFAULT_BINDINGS,
  bindingFor,
  horizontalOf,
  isCrouching as isCrouchDirection,
  isJumping,
  readButtonMask,
  resolveDirection,
  toFacingRelative,
  type Direction,
  type BindableControl,
  type KeyBindings,
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

export interface KeyboardSourceOptions {
  readonly bindings?: KeyBindings;
  readonly commands: readonly CommandRow[];
  /** Prevent the browser scrolling on arrows and space. */
  readonly preventDefault?: boolean;
  /** How guard and dash are read. Defaults to the dedicated-button scheme. */
  readonly profile?: InputProfile;
}

export class KeyboardInputSource {
  private readonly held = new Set<string>();
  private virtualControls: ReadonlySet<BindableControl> = new Set();
  private readonly buffer = new InputBuffer();
  private readonly attackGate = new AttackButtonGate();
  private readonly doubleTapDash = new DoubleTapDash();
  private bindings: KeyBindings;
  private readonly commands: readonly CommandRow[];
  private readonly preventDefault: boolean;
  private readonly profile: InputProfile;
  private attached = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return;
    }
    if (this.isBound(event.code)) {
      this.held.add(event.code);
      if (this.preventDefault) {
        event.preventDefault();
      }
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (this.held.delete(event.code) && this.preventDefault) {
      event.preventDefault();
    }
  };

  /** Releasing everything on blur avoids a key sticking down forever. */
  private readonly onBlur = (): void => {
    this.held.clear();
    this.attackGate.reset();
    this.doubleTapDash.reset();
  };

  public constructor(options: KeyboardSourceOptions) {
    this.bindings = copyBindings(options.bindings ?? DEFAULT_BINDINGS);
    this.commands = options.commands;
    this.preventDefault = options.preventDefault ?? true;
    this.profile = options.profile ?? DEFAULT_INPUT_PROFILE;
  }

  public attach(target: EventTarget = globalThis): void {
    if (this.attached) {
      return;
    }
    target.addEventListener('keydown', this.onKeyDown as EventListener);
    target.addEventListener('keyup', this.onKeyUp as EventListener);
    target.addEventListener('blur', this.onBlur);
    this.attached = true;
  }

  public detach(target: EventTarget = globalThis): void {
    if (!this.attached) {
      return;
    }
    target.removeEventListener('keydown', this.onKeyDown as EventListener);
    target.removeEventListener('keyup', this.onKeyUp as EventListener);
    target.removeEventListener('blur', this.onBlur);
    this.held.clear();
    this.buffer.clear();
    this.attackGate.reset();
    this.doubleTapDash.reset();
    this.attached = false;
  }

  /**
   * Sample once per simulation frame.
   *
   * `facing` mirrors the direction so authored motions work on both sides.
   */
  public sample(
    facing: -1 | 1,
    attacksLocked = false,
    context: CommandContext = DEFAULT_CONTEXT,
  ): FighterInput {
    const held = this.readHeldKeys();
    const screenDirection = resolveDirection(held, this.bindings);
    const direction = toFacingRelative(screenDirection, facing);
    const buttons = this.attackGate.filter(
      readButtonMask(held, this.bindings),
      attacksLocked,
    );
    this.buffer.push(direction, buttons);

    const command = resolveCommand(this.buffer, this.commands, context, {
      ...(this.profile.leeway === undefined
        ? {}
        : { leeway: this.profile.leeway }),
      ...(this.profile.settleFrames === undefined
        ? {}
        : { settleFrames: this.profile.settleFrames }),
    });
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

  public updateBindings(bindings: KeyBindings): void {
    this.bindings = copyBindings(bindings);
    this.held.clear();
    this.buffer.clear();
    this.attackGate.reset();
    this.doubleTapDash.reset();
  }

  public setVirtualControls(controls: ReadonlySet<BindableControl>): void {
    this.virtualControls = controls;
  }

  /** Exposed for the input display and for replay capture. */
  public get history(): InputBuffer {
    return this.buffer;
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

  private isBound(code: string): boolean {
    const { up, down, left, right, buttons } = this.bindings;
    if (code === up || code === down || code === left || code === right) {
      return true;
    }
    return Object.values(buttons).includes(code);
  }

  private readHeldKeys(): ReadonlySet<string> {
    if (this.virtualControls.size === 0) {
      return this.held;
    }
    const held = new Set(this.held);
    for (const control of this.virtualControls) {
      held.add(bindingFor(this.bindings, control));
    }
    return held;
  }
}

function copyBindings(bindings: KeyBindings): KeyBindings {
  return {
    up: bindings.up,
    down: bindings.down,
    left: bindings.left,
    right: bindings.right,
    buttons: { ...bindings.buttons },
  };
}
