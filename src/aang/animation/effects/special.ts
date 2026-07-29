import type { EffectLibrary } from './types';

export const SPECIAL_EFFECTS: EffectLibrary = {
  'air-squall': {
    selector: '[data-effect="air"]',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 0px) scale(.15)' },
      { offset: 0.4, opacity: 0 },
      { offset: 0.5, opacity: 1, transform: 'translate(15px, 0px) scale(.9)' },
      { offset: 0.84, opacity: 0, transform: 'translate(150px, 0px) scale(2.3)' },
    ],
  },
  'earth-wall': {
    selector: '[data-effect="wall"]',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translateY(70px) scaleY(.1)' },
      { offset: 0.34, opacity: 0 },
      { offset: 0.46, opacity: 1, transform: 'translateY(0px) scaleY(1)' },
      { offset: 0.86, opacity: 1, transform: 'translateY(0px) scaleY(1)' },
      { offset: 1, opacity: 0, transform: 'translateY(18px) scaleY(.8)' },
    ],
  },
  'water-diagonal': {
    selector: '[data-effect="water"]',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'translate(0px, 22px) rotate(42deg) scaleX(.08)' },
      { offset: 0.38, opacity: 0 },
      { offset: 0.49, opacity: 1, transform: 'translate(5px, 7px) rotate(-42deg) scaleX(1.3)' },
      { offset: 0.82, opacity: 0, transform: 'translate(160px, -90px) rotate(-42deg) scaleX(2.2)' },
    ],
  },
  'element-shift': {
    selector: '[data-effect="elements"]',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'rotate(0deg) scale(.2)' },
      { offset: 0.25, opacity: 0 },
      { offset: 0.48, opacity: 1, transform: 'rotate(140deg) scale(.8)' },
      { offset: 0.72, opacity: 1, transform: 'rotate(300deg) scale(1.15)' },
      { offset: 1, opacity: 0, transform: 'rotate(520deg) scale(.45)' },
    ],
  },
  'elemental-cocoon': {
    selector: '[data-effect="elements"]',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'rotate(0deg) scale(.2)' },
      { offset: 0.15, opacity: 1, transform: 'rotate(50deg) scale(.7)' },
      { offset: 0.48, opacity: 1, transform: 'rotate(260deg) scale(1.4)' },
      { offset: 0.78, opacity: 1, transform: 'rotate(560deg) scale(1.55)' },
      { offset: 1, opacity: 0, transform: 'rotate(760deg) scale(2.4)' },
    ],
  },
  'avatar-state': {
    selector: '[data-effect="avatar"]',
    keyframes: [
      { offset: 0, opacity: 0, transform: 'scale(.1)', filter: 'brightness(1)' },
      { offset: 0.18, opacity: 1, transform: 'scale(.45)', filter: 'brightness(2.4)' },
      { offset: 0.5, opacity: 1, transform: 'scale(1.3)', filter: 'brightness(3)' },
      { offset: 0.82, opacity: 1, transform: 'scale(1.5)', filter: 'brightness(2.5)' },
      { offset: 1, opacity: 0, transform: 'scale(2.2)', filter: 'brightness(1)' },
    ],
  },
};
