type RateWindow = {
  startedAt: number;
  attempts: number;
};

export class ApiRateLimiter {
  private readonly windows = new Map<string, RateWindow>();

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
  ) {}

  allow(key: string, now = Date.now()) {
    const current = this.windows.get(key);
    if (!current || now - current.startedAt >= this.windowMs) {
      this.windows.set(key, { startedAt: now, attempts: 1 });
      this.prune(now);
      return true;
    }
    current.attempts += 1;
    return current.attempts <= this.maxAttempts;
  }

  private prune(now: number) {
    if (this.windows.size < 2_000) return;
    this.windows.forEach((window, key) => {
      if (now - window.startedAt >= this.windowMs) this.windows.delete(key);
    });
  }
}
