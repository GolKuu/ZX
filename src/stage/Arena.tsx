'use client';

import { ArenaBackdrop2D } from './arena/ArenaBackdrop2D';
import { ArenaEmbers2D } from './arena/ArenaEmbers2D';
import { ArenaPlatform2D } from './arena/ArenaPlatform2D';
import { ArenaSunGlow2D } from './arena/ArenaSunGlow2D';
import { RetroGridFloor } from './arena/RetroGridFloor';
import type { ArenaId } from '@/src/data/arenas';
import { RuinedMegacityArena } from './arena/RuinedMegacityArena';

export function Arena({ arenaId }: { readonly arenaId: ArenaId }) {
  if (arenaId === 'ruined-megacity') return <RuinedMegacityArena />;

  return (
    <group>
      <ArenaBackdrop2D />
      <ArenaSunGlow2D />
      <RetroGridFloor />
      <ArenaPlatform2D />
      <ArenaEmbers2D />
    </group>
  );
}
