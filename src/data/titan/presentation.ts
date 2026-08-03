export type TitanSoundEvent =
  | 'servo'
  | 'piston'
  | 'metalImpact'
  | 'reactorPulse'
  | 'armourCrack'
  | 'groundRupture'
  | 'grabLock'
  | 'throwRelease';

export interface TitanPresentation {
  readonly name: string;
  readonly vfx: readonly string[];
  readonly sounds: readonly TitanSoundEvent[];
  readonly camera: 'none' | 'shake' | 'impact' | 'cinematic';
}

export const TITAN_PRESENTATION: Readonly<Record<string, TitanPresentation>> = {
  'titan.normal.piston-hammer': {
    name: 'Right Piston', vfx: ['pixel-impact'], sounds: ['servo', 'piston'], camera: 'none',
  },
  'titan.normal.bulkhead-backfist': {
    name: 'Left Bulkhead', vfx: ['pixel-impact'], sounds: ['servo', 'metalImpact'], camera: 'none',
  },
  'titan.normal.seismic-stomp': {
    name: 'Right Seismic Stomp', vfx: ['pixel-dust-wave'], sounds: ['groundRupture'], camera: 'shake',
  },
  'titan.normal.siege-ram': {
    name: 'Left Siege Kick', vfx: ['pixel-armour-trail'], sounds: ['servo', 'metalImpact'], camera: 'impact',
  },
  'titan.special.armour-charge': {
    name: 'Armour Charge', vfx: ['reactor-wake', 'armour-sparks'],
    sounds: ['reactorPulse', 'servo'], camera: 'shake',
  },
  'titan.special.reactor-breaker': {
    name: 'Reactor Breaker', vfx: ['reactor-flare', 'plate-fragments'],
    sounds: ['reactorPulse', 'armourCrack'], camera: 'impact',
  },
  'titan.super.continental-slam': {
    name: 'Continental Slam', vfx: ['grab-lock', 'fault-line'],
    sounds: ['grabLock', 'groundRupture'], camera: 'cinematic',
  },
  'titan.super.siege-engine': {
    name: 'Siege Engine', vfx: ['reactor-overdrive', 'armour-shell'],
    sounds: ['reactorPulse', 'servo'], camera: 'cinematic',
  },
  'titan.ultimate.world-anchor': {
    name: 'World Anchor', vfx: ['anchor-ring', 'arena-fracture'],
    sounds: ['grabLock', 'groundRupture', 'throwRelease'], camera: 'cinematic',
  },
};

export const TITAN_BLOCK_STATES = [
  'stand-start', 'stand-hold', 'stand-light-impact', 'stand-heavy-impact',
  'stand-release', 'crouch-start', 'crouch-hold', 'crouch-light-impact',
  'crouch-heavy-impact', 'crouch-release', 'chip-reaction', 'guard-crush',
  'guard-break', 'throw-escape', 'perfect-block', 'armour-block',
  'block-stun-recovery',
] as const;
