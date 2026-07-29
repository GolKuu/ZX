/**
 * Keyboard adapter: DOM key events → one `FighterInput` per simulation frame.
 *
 * Attach/detach own the listeners; `sample` is called once per fixed tick by the
 * game loop. Nothing here runs per animation frame.
 */

import type { FighterInput } from '../sim/state.js';
import {
  DEFAULT_BINDINGS,
  horizontalOf,
  readButtonMask,
  resolveDirection,
  toFacingRelative,
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

export interface KeyboardSourceOptions {
  readonly bindings?: KeyBindings;
  readonly commands: readonly CommandRow[];
  /** Prevent the browser scrolling on arrows and space. */
  readonly preventDefault?: boolean;
}

export class KeyboardInputSource {
  private readonly held = new Set<string>();
  private readonly buffer = new InputBuffer();
  private readonly bindings: KeyBindings;
  private readonly commands: readonly CommandRow[];
  private readonly preventDefault: boolean;
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
  };

  public constructor(options: KeyboardSourceOptions) {
    this.bindings = options.bindings ?? DEFAULT_BINDINGS;
    this.commands = options.commands;
    this.preventDefault = options.preventDefault ?? true;
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
    this.attached = false;
  }

  /**
   * Sample once per simulation frame.
   *
   * `facing` mirrors the direction so authored motions work on both sides.
   */
  public sample(
    facing: -1 | 1,
    context: CommandContext = DEFAULT_CONTEXT,
  ): FighterInput {
    const screenDirection = resolveDirection(this.held, this.bindings);
    const direction = toFacingRelative(screenDirection, facing);
    this.buffer.push(direction, readButtonMask(this.held, this.bindings));

    const guard = isGuarding(this.buffer);
    const command = resolveCommand(this.buffer, this.commands, context);

    return {
      movement: guard ? 0 : horizontalOf(direction),
      guard,
      ...(command === null ? {} : { move: command.moveId }),
    };
  }

  /** Exposed for the input display and for replay capture. */
  public get history(): InputBuffer {
    return this.buffer;
  }

  private isBound(code: string): boolean {
    const { up, down, left, right, buttons } = this.bindings;
    if (code === up || code === down || code === left || code === right) {
      return true;
    }
    return Object.values(buttons).includes(code);
  }
}
