import type { EffectLibrary } from './types';

const air = '[data-effect="air"]';
const fire = '[data-effect="fire"]';

export const AIR_FIRE_EFFECTS: EffectLibrary = {
  'air-palm': {
    selector: air,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 0px) scale(.2)' },
      { offset: 0.3, opacity: 0 },
      { offset: 0.38, opacity: 1, transform: 'translate(10px, 0px) scale(.55)' },
      { offset: 0.7, opacity: 0, transform: 'translate(95px, 0px) scale(1.4)' },
    ],
  },
  'air-arc': {
    selector: air,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(-8px, 0px) rotate(-35deg) scale(.5)' },
      { offset: 0.42, opacity: 0 },
      { offset: 0.5, opacity: 1, transform: 'translate(5px, 0px) rotate(-12deg) scale(1)' },
      { offset: 0.82, opacity: 0, transform: 'translate(125px, 0px) rotate(25deg) scale(1.8)' },
    ],
  },
  'air-low': {
    selector: air,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 48px) scale(.2)' },
      { offset: 0.34, opacity: 0 },
      { offset: 0.42, opacity: 1, transform: 'translate(12px, 48px) scale(.6)' },
      { offset: 0.72, opacity: 0, transform: 'translate(72px, 48px) scale(1.25)' },
    ],
  },
  'air-launch': {
    selector: air,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(4px, 18px) rotate(0deg) scale(.4)' },
      { offset: 0.36, opacity: 0 },
      { offset: 0.48, opacity: 1, transform: 'translate(12px, 8px) rotate(120deg) scale(1)' },
      { offset: 0.76, opacity: 0, transform: 'translate(30px, -42px) rotate(300deg) scale(1.65)' },
    ],
  },
  'fire-jab': {
    selector: fire,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 0px) scale(.2)' },
      { offset: 0.32, opacity: 0 },
      { offset: 0.38, opacity: 1, transform: 'translate(10px, 0px) scale(.8)' },
      { offset: 0.64, opacity: 0, transform: 'translate(52px, 0px) scale(1.4)' },
    ],
  },
  'fire-blade': {
    selector: fire,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, -36px) rotate(-82deg) scale(.5)' },
      { offset: 0.4, opacity: 0 },
      { offset: 0.5, opacity: 1, transform: 'translate(8px, -12px) rotate(22deg) scale(1.15)' },
      { offset: 0.76, opacity: 0, transform: 'translate(35px, 35px) rotate(54deg) scale(1.55)' },
    ],
  },
  'fire-low': {
    selector: fire,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 48px) scale(.3)' },
      { offset: 0.38, opacity: 0 },
      { offset: 0.46, opacity: 1, transform: 'translate(8px, 48px) scale(.75)' },
      { offset: 0.76, opacity: 0, transform: 'translate(105px, 48px) scaleX(2)' },
    ],
  },
  'fire-column': {
    selector: fire,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(20px, 26px) scale(.35)' },
      { offset: 0.43, opacity: 0 },
      { offset: 0.5, opacity: 1, transform: 'translate(34px, 14px) rotate(86deg) scale(1)' },
      { offset: 0.78, opacity: 0, transform: 'translate(78px, -46px) rotate(86deg) scale(2)' },
    ],
  },
};
