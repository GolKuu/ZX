export interface PhotoImpactPose {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

const REST: PhotoImpactPose = {
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

/**
 * Short whole-body recoil layered over the held hit drawing.
 *
 * The parent group already mirrors the fighter, so negative X always means
 * "away from the opponent" in drawing space. Damage changes the weight, while
 * the damped wave gives a hard first beat and a small return past neutral.
 */
export function photoImpactPose(seconds: number, damage: number): PhotoImpactPose {
  if (seconds < 0) return REST;
  const duration = 0.18 + Math.min(0.16, Math.max(0, damage) / 600);
  if (seconds >= duration) return REST;
  const progress = seconds / duration;
  const weight = Math.min(1.35, 0.58 + Math.max(0, damage) / 105);
  const decay = (1 - progress) ** 2;
  const recoil = Math.sin((0.18 + progress * 1.82) * Math.PI) * decay;
  const compression = Math.sin(progress * Math.PI) * decay;
  return {
    x: -0.2 * weight * recoil,
    y: 0.045 * weight * recoil,
    rotation: 0.13 * weight * recoil,
    scaleX: 1 + 0.075 * weight * compression,
    scaleY: 1 - 0.065 * weight * compression,
  };
}

/** Opacity of one dash echo, ordered from nearest to oldest. */
export function photoDashEchoOpacity(
  dashFrames: number,
  echoIndex: number,
): number {
  if (dashFrames <= 0 || echoIndex < 0) return 0;
  const life = Math.min(1, dashFrames / 4);
  return Math.max(0, (0.3 - echoIndex * 0.075) * life);
}
