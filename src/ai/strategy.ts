import type { AiDifficultyProfile, AiStrategy } from './types.js';

export function applyAiStrategy(
  profile: AiDifficultyProfile,
  strategy?: AiStrategy,
): AiDifficultyProfile {
  if (strategy === undefined) return profile;

  const attackShift = strategy.style === 'aggressive'
    ? 14
    : strategy.style === 'defensive' ? -12 : 0;
  const defenseShift = strategy.style === 'defensive'
    ? 12
    : strategy.style === 'aggressive' ? -8 : 0;
  const rangeShift = strategy.range === 'close'
    ? -180
    : strategy.range === 'long' ? 180 : 0;

  return {
    ...profile,
    neutralAttackPercent: clampPercent(profile.neutralAttackPercent + attackShift),
    defensePercent: clampPercent(profile.defensePercent + defenseShift),
    preferredMinimumDistance: Math.max(300, profile.preferredMinimumDistance + rangeShift),
    preferredMaximumDistance: Math.max(650, profile.preferredMaximumDistance + rangeShift),
  };
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}
