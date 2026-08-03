import type { ArenaId } from '../data/arenas.js';
import type { CharacterId } from '../data/characterRoster.js';

export const STORY_PLAYER_CHARACTER_ID = 'glitch' as const;
export const STORY_CAMPAIGN_VERSION = 2;

export type StoryOpponentId =
  | 'corrupted-construct'
  | 'mim'
  | 'lucky'
  | 'titan'
  | 'vorgh'
  | 'fractured-alliance'
  | 'memory-engine-guardian'
  | 'four-architects'
  | 'corrupted-glitch'
  | 'the-fifth'
  | 'zero-form';

export interface StoryChapter {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly titleRu: string;
  readonly opponentId: StoryOpponentId;
  readonly combatOpponentId: CharacterId;
  readonly arenaId: ArenaId;
  readonly unlocks: readonly string[];
  readonly focus: string;
}

export const STORY_CHAPTERS: readonly StoryChapter[] = [
  { id: 'prologue', number: '00', title: 'NO FIXED POSITION', titleRu: 'НЕТ ФИКСИРОВАННОЙ ПОЗИЦИИ', opponentId: 'corrupted-construct', combatOpponentId: 'glitch', arenaId: 'null-circle', unlocks: [], focus: 'Movement · J/K/I/L · guard · throw' },
  { id: 'silent-wall', number: '01', title: 'THE SILENT WALL', titleRu: 'БЕЗМОЛВНАЯ СТЕНА', opponentId: 'mim', combatOpponentId: 'mim', arenaId: 'ruined-megacity', unlocks: ['glitch.spatial-dash', 'glitch.shift-forward'], focus: 'Wall awareness · Spatial Shift' },
  { id: 'winning-version', number: '02', title: 'THE WINNING VERSION', titleRu: 'ПОБЕДНАЯ ВЕРСИЯ', opponentId: 'lucky', combatOpponentId: 'lucky', arenaId: 'storm-dome', unlocks: ['glitch.shift-backward', 'glitch.teleport-strike'], focus: 'Prepared Luck · momentum control' },
  { id: 'last-order', number: '03', title: 'THE LAST ORDER', titleRu: 'ПОСЛЕДНИЙ ПРИКАЗ', opponentId: 'titan', combatOpponentId: 'titan', arenaId: 'storm-dome', unlocks: ['glitch.air-shift'], focus: 'Command-grab range · armour breaks' },
  { id: 'all-the-pain', number: '04', title: 'ALL THE PAIN', titleRu: 'ВСЯ БОЛЬ', opponentId: 'vorgh', combatOpponentId: 'vorgh', arenaId: 'ruined-megacity', unlocks: ['glitch.reality-slice'], focus: 'Rage · Berserk recovery' },
  { id: 'fractured-alliance', number: '05', title: 'FRACTURED ALLIANCE', titleRu: 'РАСКОЛОТЫЙ СОЮЗ', opponentId: 'fractured-alliance', combatOpponentId: 'mim', arenaId: 'null-circle', unlocks: ['glitch.enhanced-spatial-shift'], focus: 'Four corrupted coordinate copies' },
  { id: 'memory-engine', number: '06', title: 'THE MEMORY ENGINE', titleRu: 'ДВИГАТЕЛЬ ПАМЯТИ', opponentId: 'memory-engine-guardian', combatOpponentId: 'titan', arenaId: 'storm-dome', unlocks: ['glitch.super-1'], focus: 'Unstable coordinates · resource control' },
  { id: 'four-laws', number: '07', title: 'FOUR LAWS', titleRu: 'ЧЕТЫРЕ ЗАКОНА', opponentId: 'four-architects', combatOpponentId: 'lucky', arenaId: 'null-circle', unlocks: ['glitch.fourth-god-resonance'], focus: 'Space · matter · probability · energy' },
  { id: 'the-vessel', number: '08', title: 'THE VESSEL', titleRu: 'СОСУД', opponentId: 'corrupted-glitch', combatOpponentId: 'glitch', arenaId: 'null-circle', unlocks: ['glitch.super-2', 'glitch.spatial-cancel'], focus: 'Reclaim Spatial Shift' },
  { id: 'the-fifth', number: '09', title: 'THE FIFTH', titleRu: 'ПЯТЫЙ', opponentId: 'the-fifth', combatOpponentId: 'glitch', arenaId: 'storm-dome', unlocks: ['glitch.ultimate'], focus: 'Use every rival lesson' },
  { id: 'zero-form', number: '10', title: 'ZERO FORM', titleRu: 'НУЛЕВАЯ ФОРМА', opponentId: 'zero-form', combatOpponentId: 'glitch', arenaId: 'ruined-megacity', unlocks: [], focus: 'Living Geometry · final resonance' },
];

export function storyChapter(index: number): StoryChapter {
  return STORY_CHAPTERS[Math.max(0, Math.min(index, STORY_CHAPTERS.length - 1))]!;
}

export function storySelection(index: number): readonly [typeof STORY_PLAYER_CHARACTER_ID, CharacterId] {
  return [STORY_PLAYER_CHARACTER_ID, storyChapter(index).combatOpponentId];
}
