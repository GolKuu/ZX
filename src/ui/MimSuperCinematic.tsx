'use client';

import { useRenderStore } from '@/src/store/renderStore';
import { MimAltF4Cinematic } from './MimAltF4Cinematic';
import { MimHeroCinematic } from './MimHeroCinematic';
import { MimPrankCinematic } from './MimPrankCinematic';

export type MimCinematicSide = 'p1' | 'p2';

export function MimSuperCinematic() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.mimSuperFighterId);
  const kind = useRenderStore((state) => state.mimSuperKind);
  const version = useRenderStore((state) => state.mimSuperVersion);

  if (
    !effectsEnabled
    || fighterId === null
    || kind === null
    || version === 0
  ) {
    return null;
  }

  if (kind === 'prank') {
    return <MimPrankCinematic key={version} side={fighterId} />;
  }
  if (kind === 'hero') {
    return <MimHeroCinematic key={version} side={fighterId} />;
  }
  return <MimAltF4Cinematic key={version} side={fighterId} />;
}
