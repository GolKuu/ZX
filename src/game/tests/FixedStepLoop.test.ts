import { describe, expect, it, vi } from 'vitest';
import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { FixedStepLoop } from '../core/FixedStepLoop';

describe('FixedStepLoop', () => {
  it('runs exactly one simulation step per 1/60 second', () => {
    const simulate = vi.fn();
    const loop = new FixedStepLoop();

    expect(loop.advance(FIXED_STEP_SECONDS * 3 + 0.000_001, simulate)).toBe(3);
    expect(simulate).toHaveBeenCalledTimes(3);
    expect(simulate).toHaveBeenCalledWith(FIXED_STEP_SECONDS);
  });

  it('limits long browser frames to avoid a spiral of death', () => {
    const simulate = vi.fn();
    const loop = new FixedStepLoop();

    expect(loop.advance(10, simulate)).toBe(15);
  });
});
