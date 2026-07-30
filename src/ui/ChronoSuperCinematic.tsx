'use client';

import { useRenderStore } from '@/src/store/renderStore';
import { ChronoCinematicScene } from './chrono-super/ChronoCinematicScene';

export function ChronoSuperCinematic() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.chronoSuperFighterId);
  const kind = useRenderStore((state) => state.chronoSuperKind);
  const version = useRenderStore((state) => state.chronoSuperVersion);

  if (
    !effectsEnabled
    || fighterId === null
    || kind === null
    || version === 0
  ) {
    return null;
  }

  return (
    <ChronoCinematicScene
      key={version}
      kind={kind}
      side={fighterId}
    />
  );
}
