/**
 * Key poses, as bone angles.
 *
 * Degrees, clockwise, 0 pointing down: a limb at 0 hangs, 90 points forward,
 * 180 points up, 270 points back. Authoring in angles rather than pixels is
 * what stops a leg growing between panels.
 */
export const POSE_TABLE = {
  // Base four.
  jab: {
    lean: -6, head: 4, hipX: 2,
    frontArm: 84, frontForearm: 88, backArm: 28, backForearm: 66,
    frontThigh: 22, frontShin: -14, backThigh: -20, backShin: 16,
    braidSweep: -0.25, sashSweep: -0.2,
  },
  elbow: {
    lean: 10, head: -8, hipX: -1,
    frontArm: 128, frontForearm: 214, backArm: -34, backForearm: -58,
    frontThigh: 30, frontShin: -22, backThigh: -26, backShin: 20,
    braidSweep: 0.5, sashSweep: 0.35,
  },
  capoeira: {
    lean: 26, head: -18, hipY: 8,
    frontArm: 150, frontForearm: 168, backArm: -46, backForearm: -30,
    frontThigh: 74, frontShin: 84, backThigh: -34, backShin: 46,
    braidSweep: 0.6, sashSweep: 0.5,
  },
  spin: {
    lean: -18, head: 10, hipY: -4,
    frontArm: 200, frontForearm: 236, backArm: -70, backForearm: -96,
    frontThigh: 104, frontShin: 96, backThigh: -12, backShin: 26,
    braidSweep: 0.75, sashSweep: 0.62,
  },

  // Dual techniques.
  mirrorStrike: {
    lean: -10, head: 6, hipX: 1,
    frontArm: 46, frontForearm: 34, backArm: 92, backForearm: 96,
    frontThigh: 26, frontShin: -18, backThigh: -24, backShin: 18,
    braidSweep: -0.35, sashSweep: -0.3,
  },
  vaultKnee: {
    lean: -14, head: 6, hipY: -12,
    frontArm: 40, frontForearm: 20, backArm: -30, backForearm: -20,
    frontThigh: 156, frontShin: 26, backThigh: 8, backShin: 12,
    braidSweep: -0.1, sashSweep: -0.45,
  },
  acrobat: {
    lean: 62, head: -30, hipY: -14,
    frontArm: 30, frontForearm: 22, backArm: 6, backForearm: 8,
    frontThigh: 128, frontShin: 108, backThigh: 34, backShin: 62,
    braidSweep: 0.9, sashSweep: 0.8,
  },
  butterfly: {
    lean: 84, head: -40, hipY: -22,
    frontArm: 62, frontForearm: 48, backArm: -66, backForearm: -44,
    frontThigh: 118, frontShin: 112, backThigh: 52, backShin: 74,
    braidSweep: 1.2, sashSweep: 1.05,
  },
  reverseButterfly: {
    lean: -78, head: 42, hipY: -20,
    frontArm: -58, frontForearm: -46, backArm: 70, backForearm: 52,
    frontThigh: -112, frontShin: -104, backThigh: -46, backShin: -70,
    braidSweep: -1.15, sashSweep: -1,
  },

  // Wall grammar.
  wallSummon: {
    lean: 8, head: -4, hipY: 5,
    frontArm: 96, frontForearm: 92, backArm: 74, backForearm: 108,
    frontThigh: 34, frontShin: -26, backThigh: -30, backShin: 24,
    braidSweep: 0.15, sashSweep: 0.1,
  },
  wallLaunch: {
    lean: -4, head: 2,
    frontArm: 88, frontForearm: 84, backArm: 24, backForearm: 44,
    frontThigh: 18, frontShin: -12, backThigh: -18, backShin: 14,
    braidSweep: -0.3, sashSweep: -0.25,
  },
  wallRun: {
    lean: 74, head: -34, hipY: -26,
    frontArm: 122, frontForearm: 116, backArm: 36, backForearm: 58,
    frontThigh: 96, frontShin: 22, backThigh: 30, backShin: 84,
    braidSweep: 0.55, sashSweep: 0.7,
  },
  wallDive: {
    lean: 48, head: -22, hipY: -30,
    frontArm: 152, frontForearm: 164, backArm: 128, backForearm: 150,
    frontThigh: 40, frontShin: 22, backThigh: 16, backShin: 30,
    braidSweep: 1, sashSweep: 0.95,
  },
  airVault: {
    lean: 22, head: -12, hipY: -28,
    frontArm: 176, frontForearm: 190, backArm: 166, backForearm: 186,
    frontThigh: 138, frontShin: 44, backThigh: 126, backShin: 52,
    braidSweep: 0.35, sashSweep: 0.5,
  },
  tripleKick: {
    lean: -22, head: 12, hipY: -6,
    frontArm: 212, frontForearm: 240, backArm: -76, backForearm: -102,
    frontThigh: 132, frontShin: 118, backThigh: -8, backShin: 22,
    braidSweep: 0.85, sashSweep: 0.7,
  },

  // Utility.
  throwStart: {
    lean: 4, head: 0, hipX: 2,
    frontArm: 92, frontForearm: 90, backArm: 86, backForearm: 84,
    frontThigh: 24, frontShin: -18, backThigh: -22, backShin: 18,
    braidSweep: -0.15, sashSweep: -0.1,
  },
  antiAir: {
    lean: -20, head: 14, hipY: -8,
    frontArm: 196, frontForearm: 202, backArm: 18, backForearm: 30,
    frontThigh: 46, frontShin: -32, backThigh: -14, backShin: 24,
    braidSweep: -0.5, sashSweep: -0.4,
  },
  sweep: {
    lean: 40, head: -26, hipY: 14,
    frontArm: 160, frontForearm: 176, backArm: -20, backForearm: -12,
    frontThigh: 88, frontShin: 92, backThigh: -48, backShin: 72,
    braidSweep: 0.7, sashSweep: 0.6,
  },

  // Reactions and presentation.
  guardBreak: {
    lean: -24, head: 18, hipY: 4,
    frontArm: -52, frontForearm: -74, backArm: -68, backForearm: -88,
    frontThigh: 34, frontShin: -30, backThigh: -32, backShin: 26,
    braidSweep: -0.7, sashSweep: -0.6,
  },
  launch: {
    lean: -46, head: 26, hipY: -18,
    frontArm: -84, frontForearm: -104, backArm: -96, backForearm: -118,
    frontThigh: -34, frontShin: -48, backThigh: -56, backShin: -30,
    braidSweep: -0.95, sashSweep: -0.85,
  },
  knockdown: {
    lean: 96, head: -44, hipY: 30,
    frontArm: 118, frontForearm: 140, backArm: 96, backForearm: 126,
    frontThigh: 96, frontShin: 118, backThigh: 76, backShin: 104,
    braidSweep: 1.3, sashSweep: 1.2,
  },
  dizzy: {
    lean: 14, head: 24, hipY: 6,
    frontArm: -26, frontForearm: -48, backArm: 26, backForearm: 46,
    frontThigh: 16, frontShin: -20, backThigh: -18, backShin: 22,
    braidSweep: 0.2, sashSweep: 0.15,
  },
  victory: {
    lean: -8, head: 6,
    frontArm: 186, frontForearm: 196, backArm: -22, backForearm: -34,
    frontThigh: 14, frontShin: -10, backThigh: -16, backShin: 12,
    braidSweep: -0.2, sashSweep: -0.15,
  },
  taunt: {
    lean: 6, head: -6,
    frontArm: 108, frontForearm: 138, backArm: -30, backForearm: -46,
    frontThigh: 22, frontShin: -16, backThigh: -20, backShin: 16,
    braidSweep: 0.25, sashSweep: 0.2,
  },
};

/** Panels drawn in the air keep their vertical offset instead of being planted. */
export const AIRBORNE_POSES = new Set([
  'butterfly',
  'reverseButterfly',
  'wallRun',
  'wallDive',
  'airVault',
  'vaultKnee',
  'acrobat',
  'launch',
]);

export const POSE_NAMES = Object.keys(POSE_TABLE);
