import { FIXED_STEP_SECONDS } from '../config/balanceConfig';

export class FixedStepLoop {
  private accumulatorSeconds = 0;

  constructor(
    private readonly stepSeconds = FIXED_STEP_SECONDS,
    private readonly maxFrameSeconds = 0.25,
  ) {}

  advance(deltaSeconds: number, simulate: (stepSeconds: number) => void) {
    this.accumulatorSeconds += Math.min(Math.max(deltaSeconds, 0), this.maxFrameSeconds);
    let steps = 0;

    while (this.accumulatorSeconds >= this.stepSeconds) {
      simulate(this.stepSeconds);
      this.accumulatorSeconds -= this.stepSeconds;
      steps += 1;
    }

    return steps;
  }

  reset() {
    this.accumulatorSeconds = 0;
  }

  get interpolationAlpha() {
    return this.accumulatorSeconds / this.stepSeconds;
  }
}
