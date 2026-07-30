'use client';

import { useEffect, useMemo } from 'react';
import { createCelGradient } from '@/src/render/celGradient';
import { createToonMaterial } from '@/src/render/toonMaterial';
import { ArenaEnergyGlyphs } from './arena/ArenaEnergyGlyphs';
import { ArenaPlatform } from './arena/ArenaPlatform';
import { FloatingDebris } from './arena/FloatingDebris';
import { LightShafts } from './arena/LightShafts';
import { RuinedMegacity } from './arena/RuinedMegacity';
import { StormDome } from './arena/StormDome';
import { VoidRift } from './arena/VoidRift';

export function Arena() {
  const gradient = useMemo(() => createCelGradient(), []);
  const stoneMaterial = useMemo(
    () =>
      // Darker and less rimmed than it was: under the old flat ambient this
      // stone needed help to be visible at all, but the new rig lights it
      // properly and at the old values the ruins came forward and started
      // competing with the fighters for attention.
      createToonMaterial({
        color: '#171227',
        // The one caller that stays *rendered*. The ruins and the disc are lit
        // scenery — flattening them to two palette bands would erase the form
        // the three-point rig exists to describe, and the stage would stop
        // sitting behind the fighters in depth.
        flatten: 0,
        gradientMap: gradient,
        shadowTint: '#391858',
        shadowStrength: 0.9,
        rimColor: '#a65ee1',
        rimStrength: 0.26,
      }),
    [gradient],
  );

  useEffect(
    () => () => {
      gradient.dispose();
      stoneMaterial.dispose();
    },
    [gradient, stoneMaterial],
  );

  return (
    <group>
      <StormDome />
      <VoidRift />
      <LightShafts />
      <RuinedMegacity ruinMaterial={stoneMaterial} />
      <ArenaPlatform stoneMaterial={stoneMaterial} />
      <ArenaEnergyGlyphs />
      <FloatingDebris material={stoneMaterial} />
    </group>
  );
}
