import type { StoryCastId } from './cast.js';

export type GodCastId = Extract<StoryCastId, `architect-${string}`>;
export type GodMotion = 'orbit' | 'forge' | 'shuffle' | 'surge';
export type GodSilhouette = 'cathedral' | 'bastion' | 'oracle' | 'lancer';

export interface StoryGodModelSpec {
  readonly id: GodCastId;
  readonly motion: GodMotion;
  readonly silhouette: GodSilhouette;
}

export const STORY_GOD_MODELS: readonly StoryGodModelSpec[] = [
  { id: 'architect-space', motion: 'orbit', silhouette: 'cathedral' },
  { id: 'architect-matter', motion: 'forge', silhouette: 'bastion' },
  { id: 'architect-probability', motion: 'shuffle', silhouette: 'oracle' },
  { id: 'architect-energy', motion: 'surge', silhouette: 'lancer' },
];

const GOD_BY_ID = new Map(STORY_GOD_MODELS.map((model) => [model.id, model]));

export function isGodCastId(id: StoryCastId): id is GodCastId {
  return GOD_BY_ID.has(id as GodCastId);
}

export function storyGodModel(id: GodCastId): StoryGodModelSpec {
  return GOD_BY_ID.get(id)!;
}
