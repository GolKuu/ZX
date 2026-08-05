import { STORY_CAMPAIGN_VERSION, STORY_CHAPTERS, STORY_PLAYER_CHARACTER_ID } from './campaign.js';

export const STORY_SAVE_KEY = 'yzx.glitch-story.v2';

export interface StorySave {
  readonly campaignVersion: number;
  readonly playableCharacterId: typeof STORY_PLAYER_CHARACTER_ID;
  readonly chapterIndex: number;
  readonly sceneId: string;
  readonly checkpoint: string;
  readonly completedBattles: readonly string[];
  readonly unlockedTechniques: readonly string[];
  readonly storyFlags: Readonly<Record<string, boolean>>;
  readonly relationshipStates: Readonly<Record<string, number>>;
  readonly memoryDiscoveries: readonly string[];
  readonly endingEligibility: readonly string[];
  readonly subtitleSettings: {
    readonly language: 'en' | 'ru';
    readonly autoAdvance: boolean;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const strings = (value: unknown): readonly string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

export function newStorySave(): StorySave {
  return {
    campaignVersion: STORY_CAMPAIGN_VERSION,
    playableCharacterId: STORY_PLAYER_CHARACTER_ID,
    chapterIndex: 0,
    sceneId: 'prologue-awakening',
    checkpoint: 'prologue-safe-entry',
    completedBattles: [],
    unlockedTechniques: [],
    storyFlags: {},
    relationshipStates: { mim: 0, lucky: 0, titan: 0, vorgh: 0 },
    memoryDiscoveries: [],
    endingEligibility: ['stable-prison', 'unbound-world'],
    // A cutscene plays itself. Auto-advance off is the reading mode a player
    // opts into, not the state the campaign opens in.
    subtitleSettings: { language: 'en', autoAdvance: true },
  };
}

export function migrateStorySave(value: unknown): StorySave {
  const fresh = newStorySave();
  if (!isRecord(value)) return fresh;
  const rawChapter = typeof value.chapterIndex === 'number' ? value.chapterIndex : 0;
  const chapterIndex = Math.max(0, Math.min(Math.trunc(rawChapter), STORY_CHAPTERS.length - 1));
  const subtitle = isRecord(value.subtitleSettings) ? value.subtitleSettings : {};
  return {
    ...fresh,
    campaignVersion: STORY_CAMPAIGN_VERSION,
    playableCharacterId: STORY_PLAYER_CHARACTER_ID,
    chapterIndex,
    sceneId: typeof value.sceneId === 'string' ? value.sceneId : fresh.sceneId,
    checkpoint: typeof value.checkpoint === 'string' ? value.checkpoint : storySafeCheckpoint(chapterIndex),
    completedBattles: strings(value.completedBattles),
    unlockedTechniques: strings(value.unlockedTechniques),
    storyFlags: isRecord(value.storyFlags) ? booleanRecord(value.storyFlags) : fresh.storyFlags,
    relationshipStates: isRecord(value.relationshipStates) ? numberRecord(value.relationshipStates) : fresh.relationshipStates,
    memoryDiscoveries: strings(value.memoryDiscoveries),
    endingEligibility: strings(value.endingEligibility),
    subtitleSettings: {
      language: subtitle.language === 'ru' ? 'ru' : 'en',
      autoAdvance: subtitle.autoAdvance !== false,
    },
  };
}

const booleanRecord = (value: Record<string, unknown>): Record<string, boolean> =>
  Object.fromEntries(Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));

const numberRecord = (value: Record<string, unknown>): Record<string, number> =>
  Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'));

export const storySafeCheckpoint = (chapterIndex: number): string =>
  `${STORY_CHAPTERS[chapterIndex]?.id ?? 'prologue'}-safe-entry`;

export function completeStoryBattle(save: StorySave): StorySave {
  const chapter = STORY_CHAPTERS[save.chapterIndex]!;
  const nextIndex = Math.min(save.chapterIndex + 1, STORY_CHAPTERS.length - 1);
  return migrateStorySave({
    ...save,
    chapterIndex: nextIndex,
    sceneId: `${STORY_CHAPTERS[nextIndex]!.id}-opening`,
    checkpoint: storySafeCheckpoint(nextIndex),
    completedBattles: [...new Set([...save.completedBattles, chapter.id])],
    unlockedTechniques: [...new Set([...save.unlockedTechniques, ...chapter.unlocks])],
  });
}
