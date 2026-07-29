import type { AangMotion } from '../types';
import { resetPose } from './pose';

export const WATER_MOTIONS: Readonly<Record<string, AangMotion>> = {
  'water-lp': {
    durationMs: 680,
    effect: 'water-whip',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.24,
        transforms: {
          body: 'translate(-3px, 0px) rotate(-5deg)',
          frontArm: 'translate(-4px, 0px) rotate(-64deg)',
        },
      },
      {
        at: 0.42,
        transforms: {
          body: 'translate(5px, 0px) rotate(4deg)',
          frontArm: 'translate(10px, -2px) rotate(72deg)',
        },
      },
      resetPose(1),
    ],
  },
  'water-hp': {
    durationMs: 920,
    effect: 'water-double',
    reaction: 'push',
    poses: [
      resetPose(0),
      {
        at: 0.25,
        transforms: {
          body: 'translate(-5px, 0px) rotate(-9deg)',
          frontArm: 'rotate(-76deg)',
          backArm: 'rotate(70deg)',
        },
      },
      {
        at: 0.5,
        transforms: {
          body: 'translate(8px, 0px) rotate(9deg)',
          frontArm: 'translate(9px, 0px) rotate(72deg)',
          backArm: 'translate(8px, 0px) rotate(94deg)',
        },
      },
      resetPose(1),
    ],
  },
  'water-lk': {
    durationMs: 760,
    effect: 'water-low',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.24,
        transforms: {
          body: 'translate(-3px, 4px) rotate(-6deg)',
          frontLeg: 'rotate(-28deg)',
        },
      },
      {
        at: 0.43,
        transforms: {
          body: 'translate(4px, 3px) rotate(4deg)',
          frontLeg: 'translate(8px, 4px) rotate(58deg)',
        },
      },
      resetPose(1),
    ],
  },
  'water-hk': {
    durationMs: 980,
    effect: 'water-crescent',
    reaction: 'push',
    poses: [
      resetPose(0),
      {
        at: 0.26,
        transforms: {
          body: 'translate(-3px, 0px) rotate(-14deg)',
          frontLeg: 'rotate(-46deg)',
          frontArm: 'rotate(-35deg)',
        },
      },
      {
        at: 0.5,
        transforms: {
          root: 'translate(7px, -3px) rotate(18deg)',
          frontLeg: 'translate(16px, -4px) rotate(104deg)',
        },
      },
      resetPose(1),
    ],
  },
};
