'use client';

import type { ArenaId } from '@/src/data/arenas';
import { KombatStage } from './kombat/KombatStage';

/**
 * The stage every arena is built from.
 *
 * Each arena used to assemble its own pile of flat quads — a painted backdrop,
 * a painted floor, a painted skyline — which meant three separate stages to keep
 * looking right, and none of them survived a camera move. There is now one 3D
 * stage, themed per arena, so the camera is free and a staging fix lands in all
 * three at once.
 */
export function Arena({ arenaId }: { readonly arenaId: ArenaId }) {
  return <KombatStage arenaId={arenaId} />;
}
