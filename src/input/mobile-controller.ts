import type { FighterInput } from '../sim/state.js';

export type MobileControl =
  | 'back'
  | 'forward'
  | 'guard'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'special';

const MOVES: Readonly<Partial<Record<MobileControl, string>>> = {
  light: '5L',
  medium: '5M',
  heavy: '5H',
  special: 'overtake',
};

/**
 * Multi-touch-safe adapter. Movement and guard are held; attacks are queued on
 * the rising edge and consumed once by the fixed-step game loop.
 */
export class MobileInputController {
  private readonly pointerControls = new Map<number, MobileControl>();
  private readonly held = new Set<MobileControl>();
  private queuedMove: string | undefined;

  public press(pointerId: number, control: MobileControl): void {
    const previous = this.pointerControls.get(pointerId);
    if (previous !== undefined) {
      this.release(pointerId);
    }
    this.pointerControls.set(pointerId, control);
    const wasHeld = this.held.has(control);
    this.held.add(control);
    const move = MOVES[control];
    if (!wasHeld && move !== undefined) {
      this.queuedMove = move;
    }
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
    this.queuedMove = undefined;
  }

  public read(): FighterInput {
    const movement = this.readMovement();
    const input: {
      movement: -1 | 0 | 1;
      guard: boolean;
      move?: string;
    } = {
      movement,
      guard: this.held.has('guard'),
    };
    if (this.queuedMove !== undefined) {
      input.move = this.queuedMove;
      this.queuedMove = undefined;
    }
    return input;
  }

  public isPressed(control: MobileControl): boolean {
    return this.held.has(control);
  }

  private readMovement(): -1 | 0 | 1 {
    const back = this.held.has('back');
    const forward = this.held.has('forward');
    if (back === forward) {
      return 0;
    }
    return back ? -1 : 1;
  }
}
