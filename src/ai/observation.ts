import type { WorldSnapshot } from '../sim/state.js';

export class ObservationBuffer {
  private history: WorldSnapshot[] = [];

  public constructor(private readonly delayFrames: number) {}

  public push(world: WorldSnapshot): void {
    this.history.push(world);
    if (this.history.length > this.delayFrames + 1) {
      this.history.shift();
    }
  }

  public read(): WorldSnapshot {
    const observed = this.history[0];
    if (observed === undefined) {
      throw new Error('AI observation history is empty');
    }
    return observed;
  }

  public reset(): void {
    this.history = [];
  }
}
