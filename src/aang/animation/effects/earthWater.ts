import type { EffectLibrary } from './types';

const earth = '[data-effect="earth"]';
const water = '[data-effect="water"]';

export const EARTH_WATER_EFFECTS: EffectLibrary = {
  'earth-elbow': {
    selector: earth,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 8px) scale(.25)' },
      { offset: 0.4, opacity: 0 },
      { offset: 0.48, opacity: 1, transform: 'translate(15px, 8px) scale(.75)' },
      { offset: 0.7, opacity: 0, transform: 'translate(55px, 8px) scale(1.25)' },
    ],
  },
  'earth-spike': {
    selector: earth,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(44px, 58px) scaleY(.05)' },
      { offset: 0.42, opacity: 0 },
      { offset: 0.52, opacity: 1, transform: 'translate(44px, 4px) scaleY(1.4)' },
      { offset: 0.86, opacity: 0, transform: 'translate(44px, 14px) scaleY(1)' },
    ],
  },
  'earth-low': {
    selector: earth,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 55px) scale(.2)' },
      { offset: 0.38, opacity: 0 },
      { offset: 0.46, opacity: 1, transform: 'translate(12px, 48px) scale(.8)' },
      { offset: 0.76, opacity: 0, transform: 'translate(85px, 22px) scale(1.4)' },
    ],
  },
  'earth-sweep': {
    selector: earth,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 50px) rotate(-12deg) scale(.3)' },
      { offset: 0.42, opacity: 0 },
      { offset: 0.52, opacity: 1, transform: 'translate(12px, 43px) rotate(8deg) scale(1)' },
      { offset: 0.82, opacity: 0, transform: 'translate(112px, 30px) rotate(28deg) scale(1.8)' },
    ],
  },
  'water-whip': {
    selector: water,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 0px) scaleX(.12)' },
      { offset: 0.35, opacity: 0 },
      { offset: 0.45, opacity: 1, transform: 'translate(8px, 0px) scaleX(1)' },
      { offset: 0.74, opacity: 0, transform: 'translate(76px, -6px) scaleX(1.55)' },
    ],
  },
  'water-double': {
    selector: water,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(-8px, 0px) rotate(-28deg) scale(.35)' },
      { offset: 0.4, opacity: 0 },
      { offset: 0.5, opacity: 1, transform: 'translate(5px, 0px) rotate(5deg) scale(1.15)' },
      { offset: 0.82, opacity: 0, transform: 'translate(120px, -4px) rotate(30deg) scale(1.7)' },
    ],
  },
  'water-low': {
    selector: water,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 48px) scaleX(.12)' },
      { offset: 0.38, opacity: 0 },
      { offset: 0.47, opacity: 1, transform: 'translate(8px, 48px) scaleX(1)' },
      { offset: 0.8, opacity: 0, transform: 'translate(135px, 48px) scaleX(1.9)' },
    ],
  },
  'water-crescent': {
    selector: water,
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 5px) rotate(-60deg) scale(.25)' },
      { offset: 0.4, opacity: 0 },
      { offset: 0.52, opacity: 1, transform: 'translate(10px, -4px) rotate(5deg) scale(1)' },
      { offset: 0.84, opacity: 0, transform: 'translate(120px, -12px) rotate(40deg) scale(1.75)' },
    ],
  },
};
