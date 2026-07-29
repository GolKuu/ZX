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
      createToonMaterial({
        color: '#211a32',
        gradientMap: gradient,
        shadowTint: '#431d65',
        shadowStrength: 0.9,
        rimColor: '#a65ee1',
        rimStrength: 0.42,
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
