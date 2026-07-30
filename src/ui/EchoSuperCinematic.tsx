'use client';

import { getCharacterDefinition } from '@/src/data/characterRoster';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import { EchoAnalysis } from './echo-super/EchoAnalysis';
import { EchoRepeat } from './echo-super/EchoRepeat';
import { EchoStatistics } from './echo-super/EchoStatistics';

export function EchoSuperCinematic() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.echoSuperFighterId);
  const kind = useRenderStore((state) => state.echoSuperKind);
  const version = useRenderStore((state) => state.echoSuperVersion);
  const selection = useHudStore((state) => state.fighterSelection);

  if (
    !effectsEnabled
    || fighterId === null
    || kind === null
    || version === 0
  ) {
    return null;
  }

  const opponentIndex = fighterId === 'p1' ? 1 : 0;
  const opponentId = selection[opponentIndex];
  const opponent = getCharacterDefinition(opponentId);
  const shared = {
    fighterId,
    opponentId,
    opponentMark: opponent.mark,
    opponentName: opponent.displayName,
  } as const;

  if (kind === 'analysis') {
    return <EchoAnalysis key={version} fighterId={fighterId} />;
  }
  if (kind === 'repeat') {
    return <EchoRepeat key={version} {...shared} />;
  }
  return <EchoStatistics key={version} fighterId={fighterId} />;
}
