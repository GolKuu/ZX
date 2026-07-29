import type { AangMotion } from '../types';
import { resetPose } from './pose';

export const FIRE_MOTIONS: Readonly<Record<string, AangMotion>> = {
  'fire-lp': {
    durationMs: 560,
    effect: 'fire-jab',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.2,
        transforms: {
          body: 'translate(-3px, 0px) rotate(-4deg)',
          frontArm: 'translate(-2px, 0px) rotate(-48deg)',
        },
      },
      {
        at: 0.36,
        transforms: {
          body: 'translate(7px, 0px) rotate(4deg)',
          frontArm: 'translate(14px, 0px) rotate(76deg) scaleX(1.14)',
        },
      },
      resetPose(1),
    ],
  },
  'fire-hp': {
    durationMs: 860,
    effect: 'fire-blade',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.28,
        transforms: {
          body: 'translate(-4px, 0px) rotate(-8deg)',
          frontArm: 'translate(0px, -8px) rotate(-150deg)',
        },
      },
      {
        at: 0.48,
        transforms: {
          body: 'translate(7px, 5px) rotate(9deg)',
          frontArm: 'translate(8px, 4px) rotate(34deg)',
          frontLeg: 'rotate(12deg)',
        },
      },
      resetPose(1),
    ],
  },
  'fire-lk': {
    durationMs: 680,
    effect: 'fire-low',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.24,
        transforms: {
          body: 'translate(-4px, 3px) rotate(-7deg)',
          frontLeg: 'rotate(-38deg)',
        },
      },
      {
        at: 0.42,
        transforms: {
          body: 'translate(5px, 4px) rotate(6deg)',
          frontLeg: 'translate(14px, 2px) rotate(82deg)',
        },
      },
      resetPose(1),
    ],
  },
  'fire-hk': {
    durationMs: 940,
    effect: 'fire-column',
    reaction: 'wall',
    poses: [
      resetPose(0),
      {
        at: 0.25,
        transforms: {
          body: 'translate(-5px, 2px) rotate(-8deg)',
          frontLeg: 'translate(-2px, -2px) rotate(-62deg)',
          frontArm: 'rotate(-28deg)',
        },
      },
      {
        at: 0.48,
        transforms: {
          body: 'translate(7px, 0px) rotate(5deg)',
          frontLeg: 'translate(22px, -9px) rotate(90deg) scaleX(1.12)',
          backLeg: 'rotate(-8deg)',
        },
      },
      resetPose(1),
    ],
  },
};
