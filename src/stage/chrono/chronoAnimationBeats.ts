export interface ChronoAnimationBeats {
  readonly anticipation: number;
  readonly attack: number;
  readonly impact: number;
  readonly recovery: number;
}

/**
 * Five readable beats without touching simulation frames:
 * idle -> anticipation -> attack -> impact -> recovery -> idle.
 */
export function chronoAnimationBeats(
  progress: number,
): ChronoAnimationBeats {
  if (progress < 0.34) {
    return {
      anticipation: smooth(progress / 0.34),
      attack: 0,
      impact: 0,
      recovery: 0,
    };
  }
  if (progress < 0.5) {
    return {
      anticipation: 1 - smooth((progress - 0.34) / 0.16),
      attack: smooth((progress - 0.34) / 0.16),
      impact: 0,
      recovery: 0,
    };
  }
  if (progress < 0.62) {
    const impact = smooth((progress - 0.5) / 0.12);
    return {
      anticipation: 0,
      attack: 1,
      impact: Math.sin(impact * Math.PI),
      recovery: 0,
    };
  }
  const recovery = smooth((progress - 0.62) / 0.38);
  return {
    anticipation: 0,
    attack: 1 - recovery,
    impact: 0,
    recovery,
  };
}

function smooth(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}
