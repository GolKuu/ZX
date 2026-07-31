import type { BindableControl } from './bindings.js';

export type MobileControl = BindableControl;

/**
 * Multi-touch-safe button state. The keyboard adapter consumes this state, so
 * touch controls follow the same command buffer and character move tables.
 */
export class MobileInputController {
  private readonly pointerControls = new Map<number, MobileControl>();
  private readonly held = new Set<MobileControl>();

  public press(pointerId: number, control: MobileControl): void {
    const previous = this.pointerControls.get(pointerId);
    if (previous !== undefined) {
      this.release(pointerId);
    }
    this.pointerControls.set(pointerId, control);
    this.held.add(control);
  }

  public release(pointerId: number): void {
    const control = this.pointerControls.get(pointerId);
    if (control === undefined) {
      return;
    }
    this.pointerControls.delete(pointerId);
    if (![...this.pointerControls.values()].includes(control)) {
      this.held.delete(control);
    }
  }

  public releaseAll(): void {
    this.pointerControls.clear();
    this.held.clear();
  }

  public read(): ReadonlySet<MobileControl> {
    return this.held;
  }

  public isPressed(control: MobileControl): boolean {
    return this.held.has(control);
  }
}
