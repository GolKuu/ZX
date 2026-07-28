import type { CharacterId } from '../../data/characters/circleFighters';

export type CharacterMotionProfile = {
  cadence: number;
  bounce: number;
  blend: number;
  reach: number;
  lingerFrames: number;
  trail: 'blocks' | 'slashes' | 'sparks' | 'rings' | 'wisps';
};

export const CHARACTER_MOTION: Record<CharacterId, CharacterMotionProfile> = {
  granite: { cadence: 10.5, bounce: 1.1, blend: .22, reach: .9, lingerFrames: 10, trail: 'blocks' },
  caliber: { cadence: 8.5, bounce: 1.4, blend: .28, reach: 1.05, lingerFrames: 8, trail: 'rings' },
  volt: { cadence: 5.8, bounce: 2.5, blend: .42, reach: 1.18, lingerFrames: 6, trail: 'sparks' },
  nocturne: { cadence: 9.4, bounce: 1.3, blend: .24, reach: 1.08, lingerFrames: 12, trail: 'rings' },
  ragnar: { cadence: 11.2, bounce: .9, blend: .2, reach: 1.14, lingerFrames: 9, trail: 'slashes' },
  marina: { cadence: 8.8, bounce: 2.9, blend: .2, reach: 1.04, lingerFrames: 13, trail: 'wisps' },
  zephyr: { cadence: 6.4, bounce: 3.5, blend: .18, reach: 1.22, lingerFrames: 14, trail: 'wisps' },
  origami: { cadence: 7.3, bounce: 1.7, blend: .36, reach: 1.16, lingerFrames: 8, trail: 'slashes' },
  poro: { cadence: 9.8, bounce: 3.2, blend: .17, reach: .86, lingerFrames: 11, trail: 'rings' },
  fenr: { cadence: 6.8, bounce: 1.8, blend: .39, reach: 1.2, lingerFrames: 7, trail: 'slashes' },
  sylvan: { cadence: 12, bounce: .7, blend: .16, reach: 1.25, lingerFrames: 15, trail: 'blocks' },
  adamant: { cadence: 10, bounce: 1, blend: .23, reach: .98, lingerFrames: 10, trail: 'blocks' },
  vassa: { cadence: 7.9, bounce: 2.6, blend: .2, reach: 1.28, lingerFrames: 13, trail: 'wisps' },
  shira: { cadence: 6.1, bounce: 2.1, blend: .35, reach: 1.3, lingerFrames: 9, trail: 'slashes' },
  pyron: { cadence: 7, bounce: 3, blend: .3, reach: 1.12, lingerFrames: 12, trail: 'sparks' },
};
