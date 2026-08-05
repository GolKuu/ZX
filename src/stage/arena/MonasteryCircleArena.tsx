'use client';

import { ArenaEmbers2D } from './ArenaEmbers2D';
import { MonasteryBackdrop2D } from './MonasteryBackdrop2D';
import { MonasteryCourtyard } from './MonasteryCourtyard';

export function MonasteryCircleArena() {
  return (
    <group>
      <MonasteryBackdrop2D />
      <MonasteryCourtyard />
      <ArenaEmbers2D />
    </group>
  );
}
