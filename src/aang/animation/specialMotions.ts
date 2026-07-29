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
