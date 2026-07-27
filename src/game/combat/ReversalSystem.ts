export class ReversalSystem {
  isValid(wakeupTick: number, inputTick: number) {
    return Math.abs(wakeupTick - inputTick) <= 1;
  }
}
