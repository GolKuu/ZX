import type { CharacterId } from './characterRoster';

/**
 * Rigged model per character.
 *
 * Files live in `public/models/` and are **not** in version control — they are
 * downloaded assets (see `docs/ASSET-CCU-820-model-pipeline.md` and
 * `docs/MODEL-CREDITS.md`). A character with no entry, or whose file is missing
 * at runtime, renders the primitive blockout instead, so the build is always
 * playable.
 *
 * Only the mesh and skeleton come from these files. Every clip inside them is
 * ignored; the motion is authored in `src/stage/model/`.
 *
 * There are four distinct meshes for five slots, so `elastic-brawler` shares
 * one. It is separated by palette rather than silhouette for now — a real
 * distinction needs a real asset, not a code change.
 */
export const CHARACTER_MODELS: Partial<Record<CharacterId, string>> = {
  zoro: '/models/blade-phantom.glb',
  aang: '/models/element-sage.glb',
  'void-walker': '/models/void-walker.glb',
  'velocity-king': '/models/velocity-king.glb',
  'elastic-brawler': '/models/element-sage.glb',
};

export function modelUrlFor(characterId: CharacterId): string | null {
  return CHARACTER_MODELS[characterId] ?? null;
}
