'use client';

import { useRenderStore } from '@/src/store/renderStore';
import { IdolSuperCinematic } from './IdolSuperCinematic';

export function IdolCinematicLayer() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.idolSuperFighterId);
  const moveId = useRenderStore((state) => state.idolSuperMoveId);
  const version = useRenderStore((state) => state.idolSuperVersion);

  if (!effectsEnabled || fighterId === null || moveId === null || version === 0) {
    return null;
  }
  return (
    <IdolSuperCinematic
      fighterId={fighterId}
      key={version}
      moveId={moveId}
    />
  );
}
