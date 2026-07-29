import type { AangMotion } from '../types';
import { resetPose } from './pose';

export const EARTH_MOTIONS: Readonly<Record<string, AangMotion>> = {
  'earth-lp': {
    durationMs: 820,
    effect: 'earth-elbow',
    reaction: 'push',
    poses: [
      resetPose(0),
      {
        at: 0.26,
        transforms: {
          body: 'translate(-5px, 2px) rotate(-4deg)',
          frontArm: 'translate(-4px, 1px) rotate(-72deg)',
        },
      },
      {
        at: 0.45,
        transforms: {
          body: 'translate(9px, 1px) rotate(8deg)',
          frontArm: 'translate(12px, 2px) rotate(48deg)',
        },
      },
      {
        at: 0.7,
        transforms: { root: 'translate(-14px, 0px) rotate(0deg)' },
      },
      resetPose(1),
    ],
  },
  'earth-hp': {
    durationMs: 1120,
    effect: 'earth-spike',
    reaction: 'launch',
    poses: [
      resetPose(0),
      {
        at: 0.3,
        transforms: {
          body: 'translate(0px, 8px) rotate(7deg)',
          frontArm: 'translate(0px, -5px) rotate(-110deg)',
          backArm: 'translate(0px, -5px) rotate(105deg)',
        },
      },
      {
        at: 0.48,
        transforms: {
          body: 'translate(3px, 14px) rotate(2deg)',
          frontArm: 'translate(2px, 8px) rotate(28deg)',
          backArm: 'translate(2px, 8px) rotate(-26deg)',
        },
      },
      resetPose(1),
    ],
  },
  'earth-lk': {
    durationMs: 760,
    effect: 'earth-low',
    reaction: 'flinch',
    poses: [
      resetPose(0),
      {
        at: 0.28,
        transforms: {
          body: 'translate(0px, -4px) rotate(-2deg)',
          frontLeg: 'translate(0px, -8px) rotate(-8deg)',
        },
      },
      {
        at: 0.42,
        transforms: {
          body: 'translate(0px, 6px) rotate(2deg)',
          frontLeg: 'translate(0px, 7px) rotate(3deg)',
        },
      },
      resetPose(1),
    ],
  },
  'earth-hk': {
    durationMs: 1080,
    effect: 'earth-sweep',
    reaction: 'knockdown',
    poses: [
      resetPose(0),
      {
        at: 0.28,
        transforms: {
          body: 'translate(-4px, 11px) rotate(-10deg)',
          frontLeg: 'rotate(-48deg)',
          frontArm: 'rotate(-32deg)',
        },
      },
      {
        at: 0.5,
        transforms: {
          body: 'translate(8px, 12px) rotate(12deg)',
          frontLeg: 'translate(19px, 7px) rotate(94deg)',
          backLeg: 'rotate(-14deg)',
        },
      },
      resetPose(1),
    ],
  },
};
