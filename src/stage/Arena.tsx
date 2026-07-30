'use client';

import { useEffect, useMemo } from 'react';
import { createCelGradient } from '@/src/render/celGradient';
import { createToonMaterial } from '@/src/render/toonMaterial';
import { ArenaEnergyGlyphs } from './arena/ArenaEnergyGlyphs';
import { ArenaAtmosphericField } from './arena/ArenaAtmosphericField';
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
        color: '#14182a',
        flatten: 0,
        gradientMap: gradient,
        shadowTint: '#07101d',
        shadowStrength: 0.92,
        rimColor: '#5f9fd4',
        rimStrength: 0.22,
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
      <ArenaAtmosphericField />
      <RuinedMegacity ruinMaterial={stoneMaterial} />
      <ArenaPlatform stoneMaterial={stoneMaterial} />
      <ArenaEnergyGlyphs />
      <FloatingDebris material={stoneMaterial} />
    </group>
  );
}
