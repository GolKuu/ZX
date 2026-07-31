/**
 * Every action MIM owns, in one place.
 *
 * Ids are globally unique across the roster because the engine takes a single
 * flat move table; the command tables in `src/input/` decide who may use what.
 */

export const MIM_NORMAL_IDS = {
  maskJab: 'mim.jab',
  backElbow: 'mim.elbow',
  capoeiraKick: 'mim.capoeira',
  spinningKick: 'mim.spin',
} as const;

export const MIM_DUAL_IDS = {
  mirrorStrike: 'mim.dual.mirror-strike',
  vaultKnee: 'mim.dual.vault-knee',
  acrobatKick: 'mim.dual.acrobat-kick',
  butterflyKick: 'mim.dual.butterfly',
} as const;

export const MIM_UTILITY_IDS = {
  throwStart: 'mim.throw',
  antiAir: 'mim.anti-air',
  sweep: 'mim.sweep',
} as const;

export const MIM_WALL_IDS = {
  invisibleWall: 'mim.wall.invisible',
  wallLaunch: 'mim.wall.launch',
  wallRun: 'mim.wall.run',
} as const;

/** Unlocked by story progress; see `unlocks.ts` for the gate each one sits behind. */
export const MIM_STORY_IDS = {
  wallDive: 'mim.story.wall-dive',
  rearWall: 'mim.story.rear-wall',
  wallShield: 'mim.story.wall-shield',
  tripleKick: 'mim.story.triple-kick',
  airVault: 'mim.story.air-vault',
  reverseButterfly: 'mim.story.reverse-butterfly',
  wallPrison: 'mim.story.wall-prison',
  skyRunner: 'mim.story.sky-runner',
} as const;

export const MIM_SUPER_IDS = {
  mirrorArena: 'mim.super.mirror-arena',
  falseOpening: 'mim.super.false-opening',
  perfectBox: 'mim.ultimate.perfect-box',
} as const;

export type MimNormalId = (typeof MIM_NORMAL_IDS)[keyof typeof MIM_NORMAL_IDS];
export type MimSuperId = (typeof MIM_SUPER_IDS)[keyof typeof MIM_SUPER_IDS];
