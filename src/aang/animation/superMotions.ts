import type { AangMotion } from '../types';
import { resetPose } from './pose';

export const SUPER_MOTIONS: Readonly<Record<string, AangMotion>> = {
  'element-shift': {
    durationMs: 1900,
    effect: 'element-shift',
    reaction: 'none',
    poses: [
      resetPose(0),
      {
        at: 0.2,
        transforms: {
          root: 'translate(0px, 5px) rotate(0deg)',
          frontArm: 'rotate(-35deg)',
          backArm: 'rotate(30deg)',
        },
      },
      {
        at: 0.55,
        transforms: {
          root: 'translate(0px, -4px) rotate(0deg)',
          frontArm: 'rotate(24deg)',
          backArm: 'rotate(-22deg)',
        },
      },
      resetPose(1),
    ],
  },
  'elemental-cocoon': {
    durationMs: 2700,
    effect: 'elemental-cocoon',
    reaction: 'wall',
    poses: [
      resetPose(0),
      {
        at: 0.2,
        transforms: {
          root: 'translate(0px, -8px) rotate(0deg)',
          frontArm: 'rotate(-66deg)',
          backArm: 'rotate(62deg)',
          frontLeg: 'rotate(-20deg)',
          backLeg: 'rotate(18deg)',
        },
      },
      {
        at: 0.5,
        transforms: {
          root: 'translate(0px, -33px) rotate(0deg)',
          frontArm: 'rotate(-104deg)',
          backArm: 'rotate(100deg)',
          frontLeg: 'rotate(-38deg)',
          backLeg: 'rotate(34deg)',
        },
      },
      {
        at: 0.78,
        transforms: { root: 'translate(0px, -28px) rotate(0deg)' },
      },
      resetPose(1),
    ],
  },
  'avatar-state': {
    durationMs: 3100,
    effect: 'avatar-state',
    reaction: 'none',
    poses: [
      resetPose(0),
      {
        at: 0.18,
        transforms: {
          root: 'translate(0px, 2px) rotate(0deg) scale(0.98)',
          frontArm: 'rotate(-42deg)',
          backArm: 'rotate(38deg)',
        },
      },
      {
        at: 0.48,
        transforms: {
          root: 'translate(0px, -42px) rotate(0deg) scale(1.04)',
          frontArm: 'rotate(-118deg)',
          backArm: 'rotate(112deg)',
          frontLeg: 'rotate(-26deg)',
          backLeg: 'rotate(24deg)',
        },
      },
      {
        at: 0.82,
        transforms: { root: 'translate(0px, -36px) rotate(0deg) scale(1.04)' },
      },
      resetPose(1),
    ],
  },
};
