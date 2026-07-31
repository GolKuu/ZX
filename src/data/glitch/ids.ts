export const GLITCH_NORMAL_IDS = {
  phaseJab: 'glitch.phase-jab',
  riftElbow: 'glitch.rift-elbow',
  lowVectorSweep: 'glitch.low-vector-sweep',
  breakpointAxe: 'glitch.breakpoint-axe',
  crouchLight: 'glitch.crouch-light',
  crouchMedium: 'glitch.crouch-medium',
  crouchHeavy: 'glitch.crouch-heavy',
} as const;

export const GLITCH_AIR_IDS = {
  light: 'glitch.air-light',
  medium: 'glitch.air-medium',
  heavy: 'glitch.air-heavy',
  launcher: 'glitch.aerial-launcher',
  finisher: 'glitch.air-finisher',
  throw: 'glitch.air-throw',
} as const;

export const GLITCH_UTILITY_IDS = {
  launcher: 'glitch.launcher',
  sweep: 'glitch.sweep',
  antiAir: 'glitch.anti-air',
  throw: 'glitch.throw',
  dualPhase: 'glitch.dual.phase-break',
  dualVector: 'glitch.dual.vector-cross',
} as const;

export const GLITCH_SPECIAL_IDS = {
  spatialDash: 'glitch.spatial-dash',
  shiftForward: 'glitch.shift-forward',
  shiftBackward: 'glitch.shift-backward',
  airShift: 'glitch.air-shift',
  doubleJump: 'glitch.spatial-double-jump',
  riftUppercut: 'glitch.rift-uppercut',
  phaseBreak: 'glitch.phase-break',
  realitySlice: 'glitch.reality-slice',
  teleportStrike: 'glitch.teleport-strike',
  exRiftUppercut: 'glitch.ex.rift-uppercut',
  exPhaseBreak: 'glitch.ex.phase-break',
  exRealitySlice: 'glitch.ex.reality-slice',
  exTeleportStrike: 'glitch.ex.teleport-strike',
} as const;

export const GLITCH_SUPER_IDS = {
  riftSequence: 'glitch.super.rift-sequence',
  realityCollapse: 'glitch.super.reality-collapse',
  fourthGod: 'glitch.ultimate.fourth-god',
  fourthGodSequence: 'glitch.ultimate.fourth-god.sequence',
} as const;

export const GLITCH_MOVE_IDS = {
  ...GLITCH_NORMAL_IDS,
  ...GLITCH_AIR_IDS,
  ...GLITCH_UTILITY_IDS,
  ...GLITCH_SPECIAL_IDS,
} as const;
