/**
 * Key poses, as bone angles.
 *
 * Degrees, clockwise, 0 pointing down: a limb at 0 hangs, 90 points forward,
 * 180 points up, 270 points back. Authoring in angles rather than pixels is
 * what stops a leg growing between panels.
 */
export const POSE_TABLE = {
  // The stance everything returns to: torso turned, weight forward, lead hand
  // measuring the gap, rear hand open and ready to build.
  idle: {
    lean: 4, head: -2, hipX: 1, hipY: 2,
    frontArm: 58, frontForearm: 74, backArm: -18, backForearm: 44,
    frontThigh: 26, frontShin: -20, backThigh: -24, backShin: 22,
    braidSweep: 0.1, sashSweep: 0.05,
  },

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

  // --- Locomotion -----------------------------------------------------------
  idleSettle: {
    lean: 5, head: -1, hipX: 1, hipY: 3,
    frontArm: 55, frontForearm: 78, backArm: -15, backForearm: 40,
    frontThigh: 24, frontShin: -18, backThigh: -22, backShin: 20,
    braidSweep: 0.14, sashSweep: 0.09,
  },
  idleRise: {
    lean: 3, head: -3, hipX: 1, hipY: 0,
    frontArm: 61, frontForearm: 70, backArm: -21, backForearm: 48,
    frontThigh: 28, frontShin: -22, backThigh: -26, backShin: 24,
    braidSweep: 0.06, sashSweep: 0.02,
  },
  idleShiftBack: {
    lean: 7, head: 1, hipX: -2, hipY: 2,
    frontArm: 50, frontForearm: 82, backArm: -10, backForearm: 36,
    frontThigh: 18, frontShin: -14, backThigh: -30, backShin: 28,
    braidSweep: 0.2, sashSweep: 0.16,
  },
  walkPass: {
    lean: 4, head: -2, hipY: 1,
    frontArm: 34, frontForearm: 60, backArm: -8, backForearm: 30,
    frontThigh: 6, frontShin: -6, backThigh: -6, backShin: 8,
    braidSweep: 0.08, sashSweep: 0.04,
  },
  walkReach: {
    lean: 6, head: -3, hipY: 2,
    frontArm: 18, frontForearm: 52, backArm: 12, backForearm: 40,
    frontThigh: 34, frontShin: -12, backThigh: -32, backShin: 30,
    braidSweep: 0.16, sashSweep: 0.12,
  },
  walkReachBack: {
    lean: 6, head: -3, hipY: 2,
    frontArm: 46, frontForearm: 68, backArm: -26, backForearm: 22,
    frontThigh: -30, frontShin: 26, backThigh: 32, backShin: -12,
    braidSweep: 0.16, sashSweep: 0.12,
  },
  runReach: {
    lean: 16, head: -8, hipY: -2,
    frontArm: 62, frontForearm: 118, backArm: -54, backForearm: -20,
    frontThigh: 62, frontShin: -34, backThigh: -48, backShin: 74,
    braidSweep: 0.42, sashSweep: 0.36,
  },
  runReachBack: {
    lean: 16, head: -8, hipY: -2,
    frontArm: -50, frontForearm: -16, backArm: 66, backForearm: 120,
    frontThigh: -46, frontShin: 70, backThigh: 60, backShin: -32,
    braidSweep: 0.42, sashSweep: 0.36,
  },
  runPass: {
    lean: 18, head: -9, hipY: -5,
    frontArm: 10, frontForearm: 74, backArm: -6, backForearm: 60,
    frontThigh: 10, frontShin: 6, backThigh: -8, backShin: 12,
    braidSweep: 0.5, sashSweep: 0.44,
  },
  dashForward: {
    lean: 26, head: -14, hipY: 6,
    frontArm: 96, frontForearm: 132, backArm: -62, backForearm: -30,
    frontThigh: 58, frontShin: -40, backThigh: -52, backShin: 62,
    braidSweep: 0.62, sashSweep: 0.58,
  },
  dashBack: {
    lean: -18, head: 10, hipY: -4,
    frontArm: -34, frontForearm: 18, backArm: -46, backForearm: 6,
    frontThigh: -44, frontShin: 52, backThigh: 30, backShin: -22,
    braidSweep: -0.55, sashSweep: -0.5,
  },
  crouch: {
    lean: 20, head: -12, hipY: 20,
    frontArm: 44, frontForearm: 96, backArm: -12, backForearm: 54,
    frontThigh: 62, frontShin: -84, backThigh: -58, backShin: 80,
    braidSweep: 0.24, sashSweep: 0.3,
  },
  turn: {
    lean: -2, head: 12, hipX: -1,
    frontArm: 30, frontForearm: 58, backArm: 24, backForearm: 52,
    frontThigh: 10, frontShin: -8, backThigh: -12, backShin: 10,
    braidSweep: -0.4, sashSweep: -0.34,
  },

  // --- Air ------------------------------------------------------------------
  jumpCrouch: {
    lean: 24, head: -14, hipY: 16,
    frontArm: 6, frontForearm: 40, backArm: -14, backForearm: 26,
    frontThigh: 52, frontShin: -72, backThigh: -48, backShin: 68,
    braidSweep: 0.1, sashSweep: 0.14,
  },
  jumpRise: {
    lean: -8, head: 6, hipY: -14,
    frontArm: -36, frontForearm: -10, backArm: -48, backForearm: -22,
    frontThigh: 30, frontShin: -46, backThigh: -14, backShin: -20,
    braidSweep: -0.6, sashSweep: -0.66,
  },
  jumpApex: {
    lean: 4, head: -2, hipY: -18,
    frontArm: 22, frontForearm: 66, backArm: -20, backForearm: 44,
    frontThigh: 56, frontShin: -58, backThigh: -18, backShin: -28,
    braidSweep: 0.05, sashSweep: -0.1,
  },
  fall: {
    lean: 12, head: -6, hipY: -16,
    frontArm: 58, frontForearm: 104, backArm: 34, backForearm: 84,
    frontThigh: 34, frontShin: -30, backThigh: -26, backShin: 12,
    braidSweep: 0.7, sashSweep: 0.78,
  },
  land: {
    lean: 22, head: -12, hipY: 15,
    frontArm: 62, frontForearm: 112, backArm: -30, backForearm: 30,
    frontThigh: 56, frontShin: -70, backThigh: -50, backShin: 66,
    braidSweep: -0.3, sashSweep: -0.36,
  },
  airTurn: {
    lean: 6, head: 14, hipY: -16,
    frontArm: 84, frontForearm: 40, backArm: -78, backForearm: -34,
    frontThigh: 44, frontShin: -40, backThigh: -34, backShin: 30,
    braidSweep: -0.5, sashSweep: -0.44,
  },

  // --- Defence --------------------------------------------------------------
  blockStand: {
    lean: 10, head: -4, hipX: -1,
    frontArm: 118, frontForearm: 188, backArm: 92, backForearm: 172,
    frontThigh: 20, frontShin: -18, backThigh: -26, backShin: 24,
    braidSweep: 0.12, sashSweep: 0.08,
  },
  blockCrouch: {
    lean: 22, head: -12, hipY: 20,
    frontArm: 120, frontForearm: 190, backArm: 96, backForearm: 176,
    frontThigh: 62, frontShin: -84, backThigh: -58, backShin: 80,
    braidSweep: 0.2, sashSweep: 0.24,
  },
  blockAir: {
    lean: 8, head: -4, hipY: -18,
    frontArm: 124, frontForearm: 192, backArm: 100, backForearm: 178,
    frontThigh: 52, frontShin: -54, backThigh: -20, backShin: -24,
    braidSweep: 0.1, sashSweep: -0.06,
  },
  guardImpact: {
    lean: -6, head: 6, hipX: -3,
    frontArm: 132, frontForearm: 202, backArm: 104, backForearm: 186,
    frontThigh: 14, frontShin: -12, backThigh: -34, backShin: 32,
    braidSweep: -0.34, sashSweep: -0.3,
  },
  parry: {
    lean: -4, head: 4,
    frontArm: 104, frontForearm: 46, backArm: 60, backForearm: 118,
    frontThigh: 22, frontShin: -18, backThigh: -24, backShin: 20,
    braidSweep: -0.2, sashSweep: -0.16,
  },
  throwEscape: {
    lean: -12, head: 8,
    frontArm: 96, frontForearm: 66, backArm: 88, backForearm: 60,
    frontThigh: 18, frontShin: -14, backThigh: -30, backShin: 26,
    braidSweep: -0.3, sashSweep: -0.26,
  },

  // --- Damage ---------------------------------------------------------------
  hitHigh: {
    lean: -22, head: 22, hipX: -3,
    frontArm: -40, frontForearm: -12, backArm: -54, backForearm: -26,
    frontThigh: 12, frontShin: -14, backThigh: -28, backShin: 26,
    braidSweep: -0.6, sashSweep: -0.5,
  },
  hitLow: {
    lean: 24, head: -16, hipY: 10,
    frontArm: 66, frontForearm: 124, backArm: 40, backForearm: 96,
    frontThigh: 40, frontShin: -50, backThigh: -36, backShin: 44,
    braidSweep: 0.4, sashSweep: 0.34,
  },
  hitMedium: {
    lean: -16, head: 16, hipX: -2, hipY: 4,
    frontArm: -22, frontForearm: 12, backArm: -36, backForearm: -4,
    frontThigh: 18, frontShin: -22, backThigh: -30, backShin: 30,
    braidSweep: -0.48, sashSweep: -0.4,
  },
  hitHeavy: {
    lean: -34, head: 26, hipX: -5, hipY: 2,
    frontArm: -66, frontForearm: -34, backArm: -78, backForearm: -48,
    frontThigh: 6, frontShin: -10, backThigh: -40, backShin: 38,
    braidSweep: -0.8, sashSweep: -0.7,
  },
  hitAir: {
    lean: -30, head: 20, hipY: -20,
    frontArm: -70, frontForearm: -40, backArm: -84, backForearm: -56,
    frontThigh: -20, frontShin: -30, backThigh: -46, backShin: -16,
    braidSweep: -0.85, sashSweep: -0.78,
  },
  wallHit: {
    lean: -40, head: 28, hipX: -4, hipY: -8,
    frontArm: -88, frontForearm: -60, backArm: -100, backForearm: -72,
    frontThigh: -6, frontShin: -24, backThigh: -50, backShin: -8,
    braidSweep: -1, sashSweep: -0.9,
  },
  getUp: {
    lean: 46, head: -26, hipY: 22,
    frontArm: 130, frontForearm: 158, backArm: 30, backForearm: 78,
    frontThigh: 70, frontShin: -78, backThigh: 40, backShin: 84,
    braidSweep: 0.9, sashSweep: 0.8,
  },
  defeat: {
    lean: 92, head: -40, hipY: 32,
    frontArm: 104, frontForearm: 128, backArm: 86, backForearm: 112,
    frontThigh: 88, frontShin: 104, backThigh: 70, backShin: 96,
    braidSweep: 1.25, sashSweep: 1.15,
  },

  // --- Wall states ----------------------------------------------------------
  wallApproach: {
    lean: 20, head: -10, hipY: -12,
    frontArm: 128, frontForearm: 140, backArm: 42, backForearm: 70,
    frontThigh: 74, frontShin: -46, backThigh: -20, backShin: 28,
    braidSweep: 0.4, sashSweep: 0.46,
  },
  wallContact: {
    lean: 54, head: -26, hipY: -18,
    frontArm: 116, frontForearm: 108, backArm: 88, backForearm: 96,
    frontThigh: 86, frontShin: -20, backThigh: 22, backShin: 66,
    braidSweep: 0.48, sashSweep: 0.6,
  },
  wallRunA: {
    lean: 78, head: -36, hipY: -28,
    frontArm: 134, frontForearm: 124, backArm: 30, backForearm: 52,
    frontThigh: 104, frontShin: 18, backThigh: 26, backShin: 92,
    braidSweep: 0.58, sashSweep: 0.74,
  },
  wallRunB: {
    lean: 76, head: -34, hipY: -26,
    frontArm: 40, frontForearm: 62, backArm: 130, backForearm: 120,
    frontThigh: 28, frontShin: 88, backThigh: 100, backShin: 20,
    braidSweep: 0.52, sashSweep: 0.68,
  },
  wallPause: {
    lean: 70, head: -32, hipY: -22,
    frontArm: 112, frontForearm: 96, backArm: 96, backForearm: 88,
    frontThigh: 78, frontShin: 40, backThigh: 64, backShin: 56,
    braidSweep: 0.44, sashSweep: 0.56,
  },
  wallJump: {
    lean: 34, head: -12, hipY: -24,
    frontArm: -30, frontForearm: 4, backArm: -46, backForearm: -18,
    frontThigh: 118, frontShin: 30, backThigh: 12, backShin: -14,
    braidSweep: 0.2, sashSweep: 0.34,
  },
  wallExitForward: {
    lean: 30, head: -14, hipY: -20,
    frontArm: 70, frontForearm: 106, backArm: 24, backForearm: 58,
    frontThigh: 88, frontShin: 10, backThigh: 4, backShin: 24,
    braidSweep: 0.5, sashSweep: 0.6,
  },
  wallExitBack: {
    lean: -26, head: 16, hipY: -20,
    frontArm: -54, frontForearm: -22, backArm: -66, backForearm: -34,
    frontThigh: -40, frontShin: 40, backThigh: 26, backShin: -18,
    braidSweep: -0.7, sashSweep: -0.62,
  },

  // --- Presentation ---------------------------------------------------------
  intro: {
    lean: -4, head: 8,
    frontArm: 150, frontForearm: 176, backArm: -14, backForearm: 26,
    frontThigh: 12, frontShin: -10, backThigh: -14, backShin: 12,
    braidSweep: -0.15, sashSweep: -0.1,
  },
  awakening: {
    lean: -16, head: 18, hipY: -6,
    frontArm: 166, frontForearm: 186, backArm: 194, backForearm: 208,
    frontThigh: 18, frontShin: -14, backThigh: -20, backShin: 16,
    braidSweep: -0.55, sashSweep: -0.7,
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
