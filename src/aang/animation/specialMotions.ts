import type { AangMotion } from '../types';
import { resetPose } from './pose';

export const SPECIAL_MOTIONS: Readonly<Record<string, AangMotion>> = {
  'air-squall': {
    durationMs: 1180,
    effect: 'air-squall',
    reaction: 'wall',
    poses: [
      resetPose(0),
      {
        at: 0.25,
        transforms: {
          body: 'translate(-6px, 0px) rotate(-8deg)',
          frontArm: 'rotate(-92deg)',
          backArm: 'rotate(88deg)',
          staff: 'translate(-8px, 0px) rotate(-64deg)',
        },
      },
      {
        at: 0.48,
        transforms: {
          body: 'translate(9px, 0px) rotate(7deg)',
          frontArm: 'translate(12px, 0px) rotate(70deg)',
          backArm: 'translate(10px, 0px) rotate(82deg)',
          staff: 'translate(14px, -2px) rotate(76deg)',
        },
      },
      resetPose(1),
    ],
  },
  'earth-wall': {
    durationMs: 1400,
    effect: 'earth-wall',
    reaction: 'none',
    poses: [
      resetPose(0),
      {
        at: 0.24,
        transforms: {
          body: 'translate(0px, -5px) rotate(-4deg)',
          frontLeg: 'translate(0px, -9px) rotate(-6deg)',
        },
      },
      {
        at: 0.38,
        transforms: {
          body: 'translate(0px, 6px) rotate(4deg)',
          frontLeg: 'translate(0px, 7px) rotate(3deg)',
          frontArm: 'rotate(22deg)',
        },
      },
      {
        at: 0.78,
        transforms: { body: 'translate(-4px, 0px) rotate(-2deg)' },
      },
      resetPose(1),
    ],
  },
  'water-diagonal': {
    durationMs: 1260,
    effect: 'water-diagonal',
    reaction: 'launch',
    poses: [
      resetPose(0),
      {
        at: 0.24,
        transforms: {
          body: 'translate(-4px, 3px) rotate(-9deg)',
          frontArm: 'translate(-3px, 4px) rotate(42deg)',
        },
      },
      {
        at: 0.47,
        transforms: {
          body: 'translate(7px, -2px) rotate(9deg)',
          frontArm: 'translate(10px, -8px) rotate(-128deg)',
          backArm: 'rotate(38deg)',
        },
      },
      resetPose(1),
    ],
  },
};
