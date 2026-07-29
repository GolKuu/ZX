import type { AangMotion } from '../types';
import { resetPose } from './pose';

export const AIR_MOTIONS: Readonly<Record<string, AangMotion>> = {
  'air-lp': {
    durationMs: 520,
    effect: 'air-palm',
    reaction: 'push',
    poses: [
      resetPose(0),
      {
        at: 0.2,
        transforms: {
          body: 'translate(-4px, 0px) rotate(-4deg)',
          frontArm: 'translate(-5px, 0px) rotate(-58deg)',
          backArm: 'translate(5px, 0px) rotate(52deg)',
        },
      },
      {
        at: 0.34,
        transforms: {
          body: 'translate(8px, 0px) rotate(4deg)',
          frontArm: 'translate(8px, -2px) rotate(64deg)',
          backArm: 'translate(10px, 2px) rotate(76deg)',
        },
      },
      resetPose(1),
    ],
  },
  'air-hp': {
    durationMs: 900,
    effect: 'air-arc',
    reaction: 'push',
    poses: [
      resetPose(0),
      {
        at: 0.26,
        transforms: {
          body: 'translate(-5px, 1px) rotate(-10deg)',
          frontArm: 'rotate(-78deg)',
          backArm: 'rotate(-54deg)',
          staff: 'translate(-8px, -2px) rotate(-78deg)',
        },
      },
      {
        at: 0.48,
        transforms: {
          body: 'translate(7px, 0px) rotate(8deg)',
          frontArm: 'rotate(58deg)',
          backArm: 'rotate(38deg)',
          staff: 'translate(12px, -5px) rotate(82deg)',
        },
      },
      resetPose(1),
    ],
  },
  'air-lk': {
    durationMs: 610,
    effect: 'air-low',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.22,
        transforms: {
          body: 'translate(-3px, 2px) rotate(-5deg)',
          frontLeg: 'translate(-2px, 0px) rotate(-30deg)',
        },
      },
      {
        at: 0.38,
        transforms: {
          body: 'translate(3px, 1px) rotate(3deg)',
          frontLeg: 'translate(15px, -2px) rotate(72deg)',
        },
      },
      resetPose(1),
    ],
  },
  'air-hk': {
    durationMs: 1040,
    effect: 'air-launch',
    reaction: 'launch',
    poses: [
      resetPose(0),
      {
        at: 0.2,
        transforms: {
          root: 'translate(0px, -10px) rotate(-14deg)',
          frontLeg: 'rotate(-45deg)',
          backLeg: 'rotate(38deg)',
        },
      },
      {
        at: 0.43,
        transforms: {
          root: 'translate(12px, -35px) rotate(170deg)',
          frontLeg: 'translate(10px, 0px) rotate(88deg)',
          backLeg: 'translate(-7px, 0px) rotate(-64deg)',
        },
      },
      {
        at: 0.62,
        transforms: {
          root: 'translate(18px, -28px) rotate(360deg)',
          frontLeg: 'translate(17px, 0px) rotate(94deg)',
        },
      },
      resetPose(1),
    ],
  },
};
