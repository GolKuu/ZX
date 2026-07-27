import type { PlayerControls } from '../config/defaultControls';
import type { GameAction, PlayerId } from '../core/types';
import { InputBuffer } from '../core/InputBuffer';

type Binding = { playerId: PlayerId; action: GameAction };

export class KeyboardProvider {
  private readonly bindings = new Map<string, Binding[]>();
  private attached = false;

  constructor(
    controls: PlayerControls,
    private readonly buffer: InputBuffer,
  ) {
    (Object.entries(controls) as [PlayerId, PlayerControls[PlayerId]][]).forEach(
      ([playerId, playerControls]) => {
        (Object.entries(playerControls) as [GameAction, string][]).forEach(([action, code]) => {
          const bindings = this.bindings.get(code) ?? [];
          bindings.push({ playerId, action });
          this.bindings.set(code, bindings);
        });
      },
    );
  }

  attach() {
    if (this.attached) return;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    this.attached = true;
  }

  detach() {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.buffer.clear();
    this.attached = false;
  }

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    const bindings = this.bindings.get(event.code);
    if (!bindings) return;
    event.preventDefault();
    bindings.forEach(({ playerId, action }) => this.buffer.press(playerId, action));
  };

  private readonly handleKeyUp = (event: KeyboardEvent) => {
    this.bindings
      .get(event.code)
      ?.forEach(({ playerId, action }) => this.buffer.release(playerId, action));
  };

  private readonly handleBlur = () => this.buffer.clear();
}
