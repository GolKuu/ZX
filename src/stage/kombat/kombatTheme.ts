import type { ArenaId } from '@/src/data/arenas';

/**
 * Art direction for the cinematic 3D stage, one entry per arena.
 *
 * The reference is a modern 3D fighter: a dark room, one hard key, coloured
 * rims that separate the fighters from the set, and every piece of dressing
 * built as geometry standing in real depth rather than painted on a plane.
 * Everything downstream — sky, stone, fire, mist, lighting — reads its colours
 * from here, so an arena is re-lit by editing one row.
 */
export interface KombatTheme {
  /** Zenith and horizon of the sky dome. */
  readonly skyTop: string;
  readonly skyHorizon: string;
  /** Distance fog: the single strongest depth cue on the stage. */
  readonly fog: string;
  readonly fogNear: number;
  readonly fogFar: number;
  /** Architecture: lit face and shadow face of the stone. */
  readonly stone: string;
  readonly stoneShadow: string;
  /** Fighting platform. */
  readonly floor: string;
  readonly floorLine: string;
  readonly floorEdge: string;
  /** Three-point rig. */
  readonly key: string;
  readonly rimWarm: string;
  readonly rimCool: string;
  readonly bounce: string;
  /** Practicals: fire, embers, ground haze. */
  readonly fire: string;
  readonly fireCore: string;
  readonly ember: string;
  readonly mist: string;
  /** Distant light source hanging in the sky. */
  readonly beacon: string;
}

const TEMPLE: KombatTheme = {
  skyTop: '#03060d', skyHorizon: '#14202e',
  fog: '#0a1119', fogNear: 11, fogFar: 46,
  stone: '#3b3a3c', stoneShadow: '#0d0e12',
  floor: '#14161b', floorLine: '#c8892f', floorEdge: '#ff6a2a',
  key: '#dfe8ff', rimWarm: '#ff8a3c', rimCool: '#5fb9ff', bounce: '#2a3550',
  fire: '#ff7a1e', fireCore: '#ffd98a', ember: '#ff9c42', mist: '#5f7591',
  beacon: '#cfe2ff',
};

const STORM: KombatTheme = {
  skyTop: '#020610', skyHorizon: '#0d2740',
  fog: '#07131f', fogNear: 10, fogFar: 44,
  stone: '#2f3a45', stoneShadow: '#080d14',
  floor: '#0e161d', floorLine: '#57d4ff', floorEdge: '#8f6bff',
  key: '#d8ecff', rimWarm: '#a97bff', rimCool: '#54d8ff', bounce: '#1b3348',
  fire: '#49b7ff', fireCore: '#d6f4ff', ember: '#7fd8ff', mist: '#4d7ea0',
  beacon: '#9fd8ff',
};

const CITY: KombatTheme = {
  skyTop: '#0a0308', skyHorizon: '#33131a',
  fog: '#150910', fogNear: 10, fogFar: 42,
  stone: '#38302f', stoneShadow: '#0f090c',
  floor: '#150f12', floorLine: '#ff5a45', floorEdge: '#ff2f6a',
  key: '#ffd9bc', rimWarm: '#ff5b3c', rimCool: '#6fa8ff', bounce: '#3a1c26',
  fire: '#ff4a22', fireCore: '#ffcf7a', ember: '#ff7038', mist: '#8a5566',
  beacon: '#ff9c6a',
};

const THEMES: Record<ArenaId, KombatTheme> = {
  'null-circle': TEMPLE,
  'storm-dome': STORM,
  'ruined-megacity': CITY,
};

export function kombatTheme(arenaId: ArenaId): KombatTheme {
  return THEMES[arenaId];
}
