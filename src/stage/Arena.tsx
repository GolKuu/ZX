'use client';

import { ArenaBackdrop2D } from './arena/ArenaBackdrop2D';
import { ArenaEmbers2D } from './arena/ArenaEmbers2D';
import { ArenaPlatform2D } from './arena/ArenaPlatform2D';

export function Arena() {
  return (
    <group>
      <ArenaBackdrop2D />
      <ArenaEmbers2D />
      <ArenaPlatform2D />
    </group>
  );
}
