'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MIM_SPECIAL_MOVE_IDS } from '@/src/data/mim-special-moves';
import { MIM_SUPER_MOVE_IDS } from '@/src/data/mim-super-moves';
import { readCombatFighter } from '@/src/game/combatRuntime';

/**
 * MIM says almost nothing, and never about herself — the mask does not read as
 * a person who narrates. What she calls out is the *space*: which plane just
 * went up, which line just closed.
 */
const LINES: Readonly<Record<string, readonly string[]>> = {
  [MIM_SPECIAL_MOVE_IDS.invisibleWall]: ['Line.', 'Held.', 'Closed.'],
  [MIM_SPECIAL_MOVE_IDS.wallLaunch]: ['Move.', 'Forward.', 'Out.'],
  [MIM_SPECIAL_MOVE_IDS.wallRun]: ['Up.', 'Above you.'],
  [MIM_SPECIAL_MOVE_IDS.rearWall]: ['Behind.', 'No exit.'],
  [MIM_SPECIAL_MOVE_IDS.wallShield]: ['Not that one.'],
  [MIM_SPECIAL_MOVE_IDS.wallPrison]: ['Boxed.', 'Stay.'],
  [MIM_SPECIAL_MOVE_IDS.skyRunner]: ['Higher.', 'Follow.'],
  [MIM_SUPER_MOVE_IDS.mirrorArena]: [
    'New geometry.',
    'The room is mine.',
    'Read this.',
  ],
  [MIM_SUPER_MOVE_IDS.falseOpening]: ['Take it.', 'Go on.', 'Please.'],
  [MIM_SUPER_MOVE_IDS.perfectBox]: ['Six walls.'],
};

/**
 * Local browser speech keeps MIM's callouts audible without downloading voice
 * assets. Failure is intentionally silent where speech synthesis is disabled.
 */
export function MimVoiceCallouts({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const lastSerial = useRef(0);

  useFrame(() => {
    const action = readCombatFighter(fighterId)?.action;
    if (action === null || action === undefined || action.serial === lastSerial.current) {
      return;
    }
    lastSerial.current = action.serial;
    const lines = LINES[action.moveId];
    if (lines === undefined || lines.length === 0) return;
    const line = lines[(action.serial - 1) % lines.length] ?? lines[0];
    if (line !== undefined) speak(line, fighterId);
  });

  return null;
}

function speak(line: string, fighterId: 'p1' | 'p2'): void {
  if (
    typeof window === 'undefined'
    || !('speechSynthesis' in window)
    || typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = 'en-US';
  utterance.pitch = fighterId === 'p1' ? 1.06 : 0.94;
  utterance.rate = 1.02;
  utterance.volume = 0.78;
  window.speechSynthesis.speak(utterance);
}
