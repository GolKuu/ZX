export class DeterministicRandom {
  private state: number;

  public constructor(seed: number) {
    if (!Number.isSafeInteger(seed)) {
      throw new Error('AI seed must be a safe integer');
    }
    this.state = seed >>> 0;
    if (this.state === 0) {
      this.state = 0x6d2b79f5;
    }
  }

  public integer(maximumExclusive: number): number {
    if (!Number.isSafeInteger(maximumExclusive) || maximumExclusive <= 0) {
      throw new Error('maximumExclusive must be a positive integer');
    }
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state % maximumExclusive;
  }

  public percent(): number {
    return this.integer(100);
  }
}
