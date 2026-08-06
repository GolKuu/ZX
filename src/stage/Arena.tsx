'use client';

import { ArenaBackdrop2D } from './arena/ArenaBackdrop2D';
import { ArenaEmbers2D } from './arena/ArenaEmbers2D';
import { ArenaPlatform2D } from './arena/ArenaPlatform2D';
import { ArenaSunGlow2D } from './arena/ArenaSunGlow2D';
import { RetroGridFloor } from './arena/RetroGridFloor';
import type { ArenaId } from '@/src/data/arenas';
import { RuinedMegacityArena } from './arena/RuinedMegacityArena';
import { MonasteryCircleArena } from './arena/MonasteryCircleArena';
import { NaturalArenaWalls } from './arena/NaturalArenaWalls';
import { StormDomeArena } from './arena/StormDomeArena';
import { CinematicArenaFX } from './arena/CinematicArenaFX';
import { ArenaAtmosphericField } from './arena/ArenaAtmosphericField';

export function Arena({ arenaId }: { readonly arenaId: ArenaId }) {
  if (arenaId === 'null-circle') return <><MonasteryCircleArena /><CinematicArenaFX arenaId={arenaId} /><ArenaAtmosphericField /></>;
  if (arenaId === 'ruined-megacity') return <><RuinedMegacityArena /><CinematicArenaFX arenaId={arenaId} /><ArenaAtmosphericField /></>;
  if (arenaId === 'storm-dome') return <><StormDomeArena /><CinematicArenaFX arenaId={arenaId} /><ArenaAtmosphericField /></>;

  return (
    <group>
      <ArenaBackdrop2D />
      <ArenaSunGlow2D />
      <RetroGridFloor />
      <ArenaPlatform2D />
      <NaturalArenaWalls />
      <ArenaEmbers2D />
      <CinematicArenaFX arenaId={arenaId} />
      <ArenaAtmosphericField />
    </group>
  );
}
