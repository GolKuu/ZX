import type { CharacterId } from './characterRoster';

/**
 * Rigged model per character.
 *
 * Files live in `public/models/` and are **not** in version control — they are
 * downloaded or purchased assets (see `docs/ASSET-CCU-820-model-pipeline.md`).
 * A character with no entry, or whose file is missing at runtime, renders the
 * primitive blockout instead, so the build is always playable.
 *
 * Only the mesh and skeleton come from these files. Every clip inside them is
 * ignored; the motion is authored in `src/stage/model/modelPose.ts` against the
 * simulation's frame data.
 */
export const CHARACTER_MODELS: Partial<Record<CharacterId, string>> = {
  'void-walker': '/models/void-walker.glb',
  zoro: '/models/blade-phantom.glb',
  aang: '/models/element-sage.glb',
};

export function modelUrlFor(characterId: CharacterId): string | null {
  return CHARACTER_MODELS[characterId] ?? null;
}
