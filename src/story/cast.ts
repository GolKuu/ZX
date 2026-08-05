import type { CharacterId } from '../data/characterRoster.js';
import { storyChapter, type StoryOpponentId } from './campaign.js';

/**
 * Who stands opposite Glitch in a cutscene.
 *
 * The stage used to draw one generic slab for every antagonist, so the chapter
 * about MIM, the chapter about the Memory Engine and the chapter about the four
 * gods all showed the same rectangle. Every opponent the campaign names is cast
 * here instead, with the build and the colours it is drawn from — roster
 * fighters keep the palette they fight in, the gods get their own.
 */

export type StoryCastId =
  | CharacterId
  | 'construct'
  | 'memory-engine'
  | 'vessel'
  | 'the-fifth'
  | 'architect-space'
  | 'architect-matter'
  | 'architect-probability'
  | 'architect-energy';

/** Proportions the figure is drawn at. */
export type CastBuild = 'fighter' | 'colossus' | 'construct' | 'god' | 'void';

/** The one prop or feature that says which character this is at a glance. */
export type CastSignature =
  | 'mask' | 'cards' | 'plates' | 'claws' | 'circuit'
  | 'core' | 'ring' | 'frame' | 'block' | 'die' | 'bolt' | 'rift';

export interface StoryCastMember {
  readonly id: StoryCastId;
  readonly name: string;
  readonly nameRu: string;
  readonly build: CastBuild;
  readonly signature: CastSignature;
  /** Lit side of the body. */
  readonly coat: string;
  /** Shaded side, which is what gives the silhouette its volume. */
  readonly shade: string;
  /** Eye, emblem and rim light — the colour the character reads as. */
  readonly accent: string;
}

const CAST = {
  mim: { id: 'mim', name: 'MIM', nameRu: 'МИМ', build: 'fighter', signature: 'mask', coat: '#6f35cf', shade: '#2b145f', accent: '#ffd52a' },
  lucky: { id: 'lucky', name: 'LUCKY', nameRu: 'ЛАКИ', build: 'fighter', signature: 'cards', coat: '#1d5c43', shade: '#081b13', accent: '#e5bc4e' },
  titan: { id: 'titan', name: 'TITAN', nameRu: 'ТИТАН', build: 'colossus', signature: 'plates', coat: '#3d474e', shade: '#12171a', accent: '#ff7a18' },
  vorgh: { id: 'vorgh', name: 'VORGH', nameRu: 'ВОРГ', build: 'fighter', signature: 'claws', coat: '#5a191a', shade: '#090405', accent: '#ff6a1a' },
  glitch: { id: 'glitch', name: 'GLITCH', nameRu: 'ГЛИТЧ', build: 'fighter', signature: 'circuit', coat: '#2a3763', shade: '#0a0f20', accent: '#6af4e8' },
  construct: { id: 'construct', name: 'CONSTRUCT', nameRu: 'КОНСТРУКТ', build: 'construct', signature: 'core', coat: '#17414f', shade: '#08202a', accent: '#6af4e8' },
  'memory-engine': { id: 'memory-engine', name: 'MEMORY ENGINE', nameRu: 'ДВИГАТЕЛЬ ПАМЯТИ', build: 'construct', signature: 'ring', coat: '#14413a', shade: '#06211d', accent: '#7ad9ff' },
  vessel: { id: 'vessel', name: 'THE VESSEL', nameRu: 'СОСУД', build: 'fighter', signature: 'rift', coat: '#3a1550', shade: '#0d0318', accent: '#e54fff' },
  'the-fifth': { id: 'the-fifth', name: 'THE FIFTH', nameRu: 'ПЯТЫЙ', build: 'void', signature: 'rift', coat: '#1a0426', shade: '#05010a', accent: '#e54fff' },
  'architect-space': { id: 'architect-space', name: 'SPACE', nameRu: 'ПРОСТРАНСТВО', build: 'god', signature: 'frame', coat: '#25306e', shade: '#0a0f2a', accent: '#7f8bff' },
  'architect-matter': { id: 'architect-matter', name: 'MATTER', nameRu: 'МАТЕРИЯ', build: 'god', signature: 'block', coat: '#4a3316', shade: '#150d04', accent: '#ffb36b' },
  'architect-probability': { id: 'architect-probability', name: 'PROBABILITY', nameRu: 'ВЕРОЯТНОСТЬ', build: 'god', signature: 'die', coat: '#14412f', shade: '#04150e', accent: '#6affb0' },
  'architect-energy': { id: 'architect-energy', name: 'ENERGY', nameRu: 'ЭНЕРГИЯ', build: 'god', signature: 'bolt', coat: '#4d1234', shade: '#16040e', accent: '#ff5ad6' },
} as const satisfies Readonly<Record<StoryCastId, StoryCastMember>>;

export interface StoryCast {
  readonly members: readonly StoryCastMember[];
  /** The Fifth's colours bleed through the whole line-up. */
  readonly corrupted: boolean;
}

/**
 * The four rivals appear twice: corrupted in chapter 05, and standing with
 * Glitch of their own will in chapter 10. Same four figures, opposite meaning.
 */
const RIVALS = ['mim', 'lucky', 'titan', 'vorgh'] as const satisfies readonly StoryCastId[];

const ARCHITECTS = [
  'architect-space',
  'architect-matter',
  'architect-probability',
  'architect-energy',
] as const satisfies readonly StoryCastId[];

const CHAPTER_CAST: Readonly<Record<StoryOpponentId, StoryCast>> = {
  'corrupted-construct': cast(['construct']),
  mim: cast(['mim']),
  lucky: cast(['lucky']),
  titan: cast(['titan']),
  vorgh: cast(['vorgh']),
  'fractured-alliance': cast(RIVALS, true),
  'memory-engine-guardian': cast(['memory-engine']),
  'four-architects': cast(ARCHITECTS),
  'corrupted-glitch': cast(['vessel'], true),
  'the-fifth': cast(['the-fifth'], true),
  'zero-form': cast(RIVALS),
};

function cast(ids: readonly StoryCastId[], corrupted = false): StoryCast {
  return { members: ids.map((id) => CAST[id]), corrupted };
}

export function storyCast(chapterIndex: number): StoryCast {
  return CHAPTER_CAST[storyChapter(chapterIndex).opponentId];
}

export function castMember(id: StoryCastId): StoryCastMember {
  return CAST[id];
}

export function isRosterCastMember(member: StoryCastMember): member is StoryCastMember & { readonly id: CharacterId } {
  return member.id === 'mim'
    || member.id === 'glitch'
    || member.id === 'lucky'
    || member.id === 'titan'
    || member.id === 'vorgh';
}

export const STORY_CAST_IDS: readonly StoryCastId[] = Object.keys(CAST) as StoryCastId[];
