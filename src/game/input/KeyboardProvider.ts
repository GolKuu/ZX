import { InputBuffer } from '../core/InputBuffer';
import type { CombatAction, GameAction, PlayerId } from '../core/types';
import type { PlayerInputAssignment } from './InputProfile';

type Binding = { playerId: PlayerId; action: CombatAction };

export class KeyboardProvider {
  private readonly bindings = new Map<string, Binding[]>();
  private attached = false;

  constructor(private readonly buffer: InputBuffer) {}

  configure(assignments: Record<PlayerId, PlayerInputAssignment>) {
    this.bindings.clear();
    Object.values(assignments)
      .filter((assignment) => assignment.device.kind === 'keyboard')
      .forEach((assignment) => {
        const entries = Object.entries(assignment.keyboardProfile.bindings) as [
          GameAction,
          string,
        ][];
        entries.forEach(([action, code]) => {
          this.addBinding(code, assignment.playerId, action);
        });
        if (assignment.keyboardProfile.scheme === 'CLASSIC') {
          Object.entries(assignment.keyboardProfile.classicBindings ?? {}).forEach(
            ([action, code]) => {
              if (code) this.addBinding(code, assignment.playerId, action as CombatAction);
            },
          );
        }
      });
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
    const bindings = this.bindings.get(event.code);
    if (!bindings) return;
    event.preventDefault();
    bindings.forEach(({ playerId, action }) => this.buffer.release(playerId, action));
  };

  private readonly handleBlur = () => this.buffer.clear();

  private addBinding(code: string, playerId: PlayerId, action: CombatAction) {
    const bindings = this.bindings.get(code) ?? [];
    bindings.push({ playerId, action });
    this.bindings.set(code, bindings);
  }
}
