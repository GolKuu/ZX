'use client';

import { useRenderStore } from '@/src/store/renderStore';
import { GlitchFinisher } from './GlitchFinisher';

export function GlitchSuperCinematic() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.glitchSuperFighterId);
  const kind = useRenderStore((state) => state.glitchSuperKind);
  const version = useRenderStore((state) => state.glitchSuperVersion);

  if (
    !effectsEnabled
    || fighterId === null
    || kind === null
    || version === 0
  ) {
    return null;
  }

  return (
    <GlitchFinisher
      key={version}
      fighterId={fighterId}
      kind={kind}
      version={version}
    />
  );
}
