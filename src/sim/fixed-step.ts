export const SIMULATION_FPS = 60;
const STEP_THRESHOLD = 1_000;

export interface FixedStepResult {
  readonly simulatedSteps: number;
  readonly droppedSteps: number;
  readonly interpolationAlpha: number;
}

export class FixedStepRunner<Input> {
  private accumulatedStepUnits = 0;

  public constructor(
    private readonly tick: (input: Input) => void,
    private readonly maximumCatchUpSteps = 5,
  ) {
    if (!Number.isSafeInteger(maximumCatchUpSteps) || maximumCatchUpSteps <= 0) {
      throw new Error('maximumCatchUpSteps must be a positive integer');
    }
  }

  public advance(
    elapsedMilliseconds: number,
    inputForStep: (stepIndex: number) => Input,
  ): FixedStepResult {
    if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0) {
      throw new Error('elapsedMilliseconds must be finite and non-negative');
    }

    this.accumulatedStepUnits += elapsedMilliseconds * SIMULATION_FPS;
    const availableSteps = Math.floor(this.accumulatedStepUnits / STEP_THRESHOLD);
    const simulatedSteps = Math.min(availableSteps, this.maximumCatchUpSteps);
    for (let step = 0; step < simulatedSteps; step += 1) {
      this.tick(inputForStep(step));
    }
    this.accumulatedStepUnits -= simulatedSteps * STEP_THRESHOLD;

    const droppedSteps = Math.floor(this.accumulatedStepUnits / STEP_THRESHOLD);
    if (droppedSteps > 0) {
      this.accumulatedStepUnits -= droppedSteps * STEP_THRESHOLD;
    }

    return {
      simulatedSteps,
      droppedSteps,
      interpolationAlpha: this.accumulatedStepUnits / STEP_THRESHOLD,
    };
  }

  public reset(): void {
    this.accumulatedStepUnits = 0;
  }
}
