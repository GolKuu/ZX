'use client';

import { ArenaBackdrop2D } from './arena/ArenaBackdrop2D';
import { ArenaEmbers2D } from './arena/ArenaEmbers2D';
import { ArenaPlatform2D } from './arena/ArenaPlatform2D';
import { ArenaSunGlow2D } from './arena/ArenaSunGlow2D';
import { RetroGridFloor } from './arena/RetroGridFloor';
import { GeminiShadowFight } from './arena/GeminiShadowFight';

export function Arena() {
  return (
    <group>
      <ArenaBackdrop2D />
      <ArenaSunGlow2D />
      <GeminiShadowFight />
      <RetroGridFloor />
      <ArenaPlatform2D />
      <ArenaEmbers2D />
    </group>
  );
}
