'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { PointLight } from 'three';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import type { KombatTheme } from './kombatTheme';

/**
 * A coloured light riding behind each fighter, all match long.
 *
 * This is the single technique that separates a modern 3D fighter's look from a
 * lit blockout. The set is dark and the fighters are dark, so on a static rig
 * they merge into it. A rim that stays behind and slightly above each fighter
 * draws a bright edge down their silhouette wherever they stand, which does two
 * jobs at once: it reads as expensive, and it keeps the player able to find
 * their character in a busy frame. Warm on P1, cool on P2, so the two are
 * telling apart at a glance even mid-combo.
 *
 * Lights are pulled from the sim through refs and never through React state —
 * a store write per frame would re-render the tree mid-combo.
 */
export function FighterRimLights({ theme }: { readonly theme: KombatTheme }) {
  const warm = useRef<PointLight>(null);
  const cool = useRef<PointLight>(null);

  useFrame(() => {
    place(warm.current, 'p1');
    place(cool.current, 'p2');
  });

  return (
    <>
      <pointLight
        ref={warm}
        color={theme.rimWarm}
        decay={2}
        distance={9.5}
        intensity={9}
        position={[-2.4, 2.6, -2.2]}
      />
      <pointLight
        ref={cool}
        color={theme.rimCool}
        decay={2}
        distance={9.5}
        intensity={9}
        position={[2.4, 2.6, -2.2]}
      />
    </>
  );
}

function place(light: PointLight | null, fighterId: 'p1' | 'p2'): void {
  if (light === null) return;
  const fighter = readCombatFighter(fighterId);
  if (fighter === null) return;
  // Behind and above: a rim light in front is a key light, and a second key
  // flattens the very silhouette this is here to carve out.
  light.position.set(
    fighter.position.x / FIXED_SCALE + fighter.facing * -0.9,
    fighter.position.y / FIXED_SCALE + 2.5,
    -2.4,
  );
}
