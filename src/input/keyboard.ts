/**
 * Keyboard adapter: DOM key events → one `FighterInput` per simulation frame.
 *
 * Attach/detach own the listeners; `sample` is called once per fixed tick by the
 * game loop. Nothing here runs per animation frame.
 *
 * Everything that decides what the input *means* lives in `InputSampler`, which
 * Training Mode playback shares. This file only turns key codes into a
 * direction and a button mask.
 */

import type { FighterInput } from '../sim/state.js';
import {
  DEFAULT_BINDINGS,
  bindingFor,
  readButtonMask,
  resolveDirection,
  type BindableControl,
  type KeyBindings,
} from './bindings.js';
import type { InputBuffer } from './buffer.js';
import { DEFAULT_CONTEXT, type CommandContext, type CommandRow } from './command.js';
import { DEFAULT_INPUT_PROFILE, type InputProfile } from './profiles.js';
import { InputSampler } from './sampler.js';
import type { InputRecorder } from './training.js';

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
  private readonly sampler: InputSampler;
  private bindings: KeyBindings;
  private readonly preventDefault: boolean;
  private recorder: InputRecorder | null = null;
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
    this.sampler.reset();
  };

  public constructor(options: KeyboardSourceOptions) {
    this.bindings = copyBindings(options.bindings ?? DEFAULT_BINDINGS);
    this.preventDefault = options.preventDefault ?? true;
    this.sampler = new InputSampler(
      options.commands,
      options.profile ?? DEFAULT_INPUT_PROFILE,
    );
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
    this.sampler.reset();
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
    const buttons = readButtonMask(held, this.bindings);
    // Recorded before the gate and before facing is applied, so a replay
    // reproduces what the player physically did rather than what the engine
    // happened to allow at the time.
    this.recorder?.capture(screenDirection, buttons);
    return this.sampler.sample(
      screenDirection,
      buttons,
      facing,
      attacksLocked,
      context,
    );
  }

  public updateBindings(bindings: KeyBindings): void {
    this.bindings = copyBindings(bindings);
    this.held.clear();
    this.sampler.reset();
  }

  public setVirtualControls(controls: ReadonlySet<BindableControl>): void {
    this.virtualControls = controls;
  }

  /** Attach a Training Mode recorder, or `null` to stop capturing. */
  public setRecorder(recorder: InputRecorder | null): void {
    this.recorder = recorder;
  }

  /** Exposed for the input display and for replay capture. */
  public get history(): InputBuffer {
    return this.sampler.history;
  }

  public get inputSampler(): InputSampler {
    return this.sampler;
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
