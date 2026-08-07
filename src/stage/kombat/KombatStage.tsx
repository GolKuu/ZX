'use client';

import type { ArenaId } from '@/src/data/arenas';
import { useRenderStore } from '@/src/store/renderStore';
import { KombatBraziers } from './KombatBraziers';
import { KombatBackdropCore } from './KombatBackdropCore';
import { KombatColonnade } from './KombatColonnade';
import { KombatEmbers } from './KombatEmbers';
import { KombatFloor } from './KombatFloor';
import { KombatGroundMist } from './KombatGroundMist';
import { KombatHorizon } from './KombatHorizon';
import { KombatLightShafts } from './KombatLightShafts';
import { KombatSky } from './KombatSky';
import { KombatTerrace } from './KombatTerrace';
import { useKombatSurfaces } from './kombatMaterials';
import { kombatTheme } from './kombatTheme';

/**
 * The arena, assembled — a room built out of geometry standing in real depth.
 *
 * Draw order runs back to front by construction: dome, distant ridges, arcade
 * and columns, platform, then the atmospherics that sit between all of it and
 * the camera. Every arena shares this build and differs only by theme, so a
 * lighting or staging fix lands in all three at once instead of being
 * re-authored per stage.
 *
 * The low graphics preset drops the two volumetric passes. They are the only
 * fill-rate-heavy things here, and everything that defines the stage — its
 * shape, its stone, its fire — survives.
 */
export function KombatStage({ arenaId }: { readonly arenaId: ArenaId }) {
  const theme = kombatTheme(arenaId);
  const surfaces = useKombatSurfaces(theme);
  const graphicsPreset = useRenderStore((state) => state.graphicsPreset);
  const volumetrics = graphicsPreset !== 'low';

  return (
    <group>
      <KombatSky theme={theme} />
      <KombatHorizon theme={theme} />
      <KombatBackdropCore theme={theme} />
      <KombatColonnade surfaces={surfaces} />
      <KombatTerrace surfaces={surfaces} />
      <KombatFloor surfaces={surfaces} theme={theme} />
      <KombatBraziers surfaces={surfaces} theme={theme} />
      {volumetrics ? <KombatLightShafts theme={theme} /> : null}
      <KombatGroundMist theme={theme} />
      <KombatEmbers theme={theme} />
    </group>
  );
}
