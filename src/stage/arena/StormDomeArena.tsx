'use client';

import { StormDome } from './StormDome';
import { StormSunsetBackdrop } from './StormSunsetBackdrop';
import { StormSunsetFloor } from './StormSunsetFloor';
import { NaturalArenaWalls } from './NaturalArenaWalls';

export function StormDomeArena() {
  return (
    <group>
      <StormDome />
      <StormSunsetBackdrop />
      <StormSunsetFloor />
      <NaturalArenaWalls />
    </group>
  );
}
