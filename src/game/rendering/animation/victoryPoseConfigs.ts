import type { CharacterId } from '../../data/characters/circleFighters';

export type VictoryPoseConfig = {
  frontArm: number;
  backArm: number;
  frontLeg: number;
  backLeg: number;
  rotation: number;
  head: number;
  bounce: number;
  sway: number;
  scale: number;
};

export const VICTORY_POSES: Record<CharacterId, VictoryPoseConfig> = {
  granite: {
    frontArm: -2.55, backArm: 2.35, frontLeg: -0.12, backLeg: 0.14,
    rotation: -0.04, head: -0.08, bounce: 2, sway: 0.5, scale: 1.1,
  },
  caliber: {
    frontArm: -1.5, backArm: 0.35, frontLeg: -0.2, backLeg: 0.16,
    rotation: -0.09, head: 0.15, bounce: 1, sway: 1.2, scale: 1.06,
  },
  volt: {
    frontArm: -2.3, backArm: 2.3, frontLeg: -0.55, backLeg: 0.5,
    rotation: 0.08, head: -0.12, bounce: 8, sway: 2.5, scale: 1.08,
  },
  nocturne: {
    frontArm: -2.05, backArm: -1.85, frontLeg: 0.22, backLeg: -0.18,
    rotation: -0.08, head: 0.2, bounce: 3, sway: 1.5, scale: 1.12,
  },
  ragnar: {
    frontArm: -2.6, backArm: 2.6, frontLeg: -0.12, backLeg: 0.12,
    rotation: 0, head: -0.22, bounce: 2, sway: 0.7, scale: 1.16,
  },
  marina: {
    frontArm: -1.85, backArm: 1.85, frontLeg: -0.3, backLeg: 0.3,
    rotation: 0.05, head: -0.08, bounce: 5, sway: 4, scale: 1.08,
  },
  zephyr: {
    frontArm: -2.7, backArm: -0.55, frontLeg: -0.75, backLeg: 0.6,
    rotation: -0.16, head: 0.18, bounce: 12, sway: 5, scale: 1.05,
  },
  origami: {
    frontArm: -1.25, backArm: 1.25, frontLeg: -0.25, backLeg: 0.25,
    rotation: 0.02, head: 0, bounce: 4, sway: 1, scale: 1.12,
  },
  poro: {
    frontArm: -2.2, backArm: 2.2, frontLeg: -0.4, backLeg: 0.4,
    rotation: 0, head: 0, bounce: 10, sway: 2, scale: 1.14,
  },
  fenr: {
    frontArm: -0.75, backArm: 0.75, frontLeg: -0.7, backLeg: 0.5,
    rotation: -0.2, head: -0.28, bounce: 5, sway: 3, scale: 1.1,
  },
  sylvan: {
    frontArm: -2.8, backArm: 2.8, frontLeg: -0.08, backLeg: 0.08,
    rotation: 0, head: -0.1, bounce: 1, sway: 0.4, scale: 1.14,
  },
  adamant: {
    frontArm: -2.45, backArm: 0.45, frontLeg: -0.18, backLeg: 0.18,
    rotation: -0.05, head: 0.08, bounce: 3, sway: 1, scale: 1.08,
  },
  vassa: {
    frontArm: -1.7, backArm: 1.1, frontLeg: 0.55, backLeg: -0.55,
    rotation: 0.14, head: -0.18, bounce: 4, sway: 5, scale: 1.09,
  },
  shira: {
    frontArm: -2.4, backArm: -1.75, frontLeg: -0.7, backLeg: 0.5,
    rotation: -0.1, head: 0.15, bounce: 7, sway: 3, scale: 1.08,
  },
  pyron: {
    frontArm: -2.65, backArm: 2.05, frontLeg: -0.32, backLeg: 0.24,
    rotation: 0.06, head: -0.16, bounce: 6, sway: 2, scale: 1.13,
  },
};
