import type { WorldSnapshot } from '../sim/state.js';

export class ReactionHistory {
  private snapshots: WorldSnapshot[] = [];

  public constructor(private readonly delayFrames: number) {
    if (!Number.isSafeInteger(delayFrames) || delayFrames < 0) {
      throw new Error('AI reaction delay must be a non-negative integer');
    }
  }

  public remember(world: WorldSnapshot): void {
    this.snapshots.push(world);
    if (this.snapshots.length > this.delayFrames + 1) {
      this.snapshots.shift();
    }
  }

  public observed(): WorldSnapshot {
    const snapshot = this.snapshots[0];
    if (snapshot === undefined) {
      throw new Error('AI observation history is empty');
    }
    return snapshot;
  }

  public reset(): void {
    this.snapshots = [];
  }
}
