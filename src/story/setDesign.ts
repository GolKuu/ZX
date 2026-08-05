export type StorySetId =
  | 'black-lab'
  | 'neon-citadel'
  | 'iron-foundry'
  | 'red-wastes'
  | 'fracture'
  | 'memory-vault'
  | 'pantheon'
  | 'vessel'
  | 'event-horizon'
  | 'living-dawn';

const CHAPTER_SETS: readonly StorySetId[] = [
  'black-lab',
  'black-lab',
  'neon-citadel',
  'iron-foundry',
  'red-wastes',
  'fracture',
  'memory-vault',
  'pantheon',
  'vessel',
  'event-horizon',
  'living-dawn',
];

export function storySetDesign(chapterIndex: number): StorySetId {
  const index = Math.max(0, Math.min(chapterIndex, CHAPTER_SETS.length - 1));
  return CHAPTER_SETS[index]!;
}

export const STORY_SET_COUNT = CHAPTER_SETS.length;
