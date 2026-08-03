/**
 * Composite objectives.
 *
 * `sequence` feeds frames to one child at a time, which is what makes "block,
 * *then* punish" different from "block and punish in any order". `all` feeds
 * every child every frame. Final trials use `all` so a player is not forced
 * into an arbitrary order the fight does not dictate.
 */

import type { Detector } from './detector.js';
import type { ObjectiveProgress } from './types.js';

export class SequenceDetector implements Detector {
  private index = 0;

  public constructor(public readonly children: readonly Detector[]) {}

  public observe(frame: Parameters<Detector['observe']>[0]): void {
    const current = this.children[this.index];
    if (current === undefined) return;
    current.observe(frame);
    if (current.progress.status === 'satisfied') {
      this.index += 1;
    }
  }

  public get progress(): ObjectiveProgress {
    const failed = this.children.find(
      (child) => child.progress.status === 'failed',
    );
    if (failed !== undefined) return failed.progress;
    const done = this.index >= this.children.length;
    const current = this.children[this.index]?.progress;
    return {
      status: done ? 'satisfied' : 'pending',
      count: this.index,
      target: this.children.length,
      ...(current?.failureKey === undefined
        ? {}
        : { failureKey: current.failureKey }),
      ...(current?.failureValues === undefined
        ? {}
        : { failureValues: current.failureValues }),
    };
  }

  /** Which child is currently being asked for, for the step readout. */
  public get activeIndex(): number {
    return Math.min(this.index, this.children.length - 1);
  }

  public reset(): void {
    this.index = 0;
    for (const child of this.children) child.reset();
  }
}

export class AllDetector implements Detector {
  public constructor(public readonly children: readonly Detector[]) {}

  public observe(frame: Parameters<Detector['observe']>[0]): void {
    for (const child of this.children) {
      if (child.progress.status !== 'satisfied') child.observe(frame);
    }
  }

  public get progress(): ObjectiveProgress {
    const failed = this.children.find(
      (child) => child.progress.status === 'failed',
    );
    if (failed !== undefined) return failed.progress;
    const satisfied = this.children.filter(
      (child) => child.progress.status === 'satisfied',
    ).length;
    const pending = this.children.find(
      (child) => child.progress.status !== 'satisfied',
    )?.progress;
    return {
      status: satisfied === this.children.length ? 'satisfied' : 'pending',
      count: satisfied,
      target: this.children.length,
      ...(pending?.failureKey === undefined
        ? {}
        : { failureKey: pending.failureKey }),
      ...(pending?.failureValues === undefined
        ? {}
        : { failureValues: pending.failureValues }),
    };
  }

  public reset(): void {
    for (const child of this.children) child.reset();
  }
}
