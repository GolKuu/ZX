import { TICKS_PER_SECOND } from '../config/balanceConfig';
import { cloneSnapshot } from '../core/cloneSnapshot';
import type { SimulationSnapshot } from '../core/types';
import { INTERPOLATION_DELAY_TICKS } from './protocol';

type TimedSnapshot = {
  snapshot: SimulationSnapshot;
  receivedAt: number;
};

export class SnapshotInterpolator {
  private snapshots: TimedSnapshot[] = [];

  add(snapshot: SimulationSnapshot, receivedAt = performance.now()) {
    this.snapshots.push({ snapshot: cloneSnapshot(snapshot), receivedAt });
    this.snapshots = this.snapshots
      .sort((first, second) => first.snapshot.tick - second.snapshot.tick)
      .slice(-24);
  }

  sample(now = performance.now()) {
    const latest = this.snapshots.at(-1);
    if (!latest) return null;
    const elapsedTicks = (now - latest.receivedAt) / 1_000 * TICKS_PER_SECOND;
    const targetTick = latest.snapshot.tick + elapsedTicks - INTERPOLATION_DELAY_TICKS;
    const before = [...this.snapshots]
      .reverse()
      .find((item) => item.snapshot.tick <= targetTick) ?? this.snapshots[0];
    const after = this.snapshots.find((item) => item.snapshot.tick >= targetTick) ?? latest;
    if (!before || !after || before.snapshot.tick === after.snapshot.tick) {
      return cloneSnapshot(before?.snapshot ?? latest.snapshot);
    }
    const alpha = Math.min(1, Math.max(
      0,
      (targetTick - before.snapshot.tick) /
      (after.snapshot.tick - before.snapshot.tick),
    ));
    const output = cloneSnapshot(before.snapshot);
    for (const id of ['player1', 'player2'] as const) {
      const first = before.snapshot.fighters[id];
      const second = after.snapshot.fighters[id];
      output.fighters[id] = {
        ...output.fighters[id],
        x: linear(first.x, second.x, alpha),
        y: linear(first.y, second.y, alpha),
        velocityX: linear(first.velocityX, second.velocityX, alpha),
        velocityY: linear(first.velocityY, second.velocityY, alpha),
      };
    }
    return output;
  }

  clear() {
    this.snapshots = [];
  }
}

function linear(from: number, to: number, alpha: number) {
  return from + (to - from) * alpha;
}
