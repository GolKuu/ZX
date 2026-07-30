export class CinematicFreeze {
  private remainingFrames = 0;

  public start(frames: number): void {
    if (!Number.isInteger(frames) || frames < 0) {
      throw new Error('Cinematic freeze must use a non-negative frame count');
    }
    this.remainingFrames = Math.max(this.remainingFrames, frames);
  }

  public consume(): boolean {
    if (this.remainingFrames === 0) return false;
    this.remainingFrames -= 1;
    return true;
  }

  public get active(): boolean {
    return this.remainingFrames > 0;
  }

  public reset(): void {
    this.remainingFrames = 0;
  }
}
