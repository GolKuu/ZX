'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MIM_SPECIAL_MOVE_IDS } from '@/src/data/mim-special-moves';
import { MIM_SUPER_MOVE_IDS } from '@/src/data/mim-super-moves';
import { readCombatFighter } from '@/src/game/combatRuntime';

const LINES: Readonly<Record<string, readonly string[]>> = {
  [MIM_SPECIAL_MOVE_IDS.invisibleWall]: [
    'Trust me.',
    'Definitely safe.',
    'Nothing suspicious here.',
  ],
  [MIM_SPECIAL_MOVE_IDS.bananaTrap]: [
    'Classic.',
    'No way.',
    'Again?',
  ],
  [MIM_SPECIAL_MOVE_IDS.fakeOpening]: [
    'Scared?',
    'You blocked air.',
    'That worked?',
  ],
  [MIM_SUPER_MOVE_IDS.prank]: [
    'Chat, are you seeing this?',
    'Clip it.',
    'Peak gameplay.',
  ],
  [MIM_SUPER_MOVE_IDS.hero]: [
    'Skill issue.',
    'This is staying online forever.',
    'Huge mistake.',
  ],
  [MIM_SUPER_MOVE_IDS.altF4]: [
    'You lost to this.',
  ],
};

/**
 * Local browser speech keeps Mim's contextual jokes audible without adding
 * downloaded voice assets. Failure is intentionally silent on browsers that
 * disable speech synthesis.
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
  utterance.pitch = fighterId === 'p1' ? 1.12 : 0.96;
  utterance.rate = 1.08;
  utterance.volume = 0.82;
  window.speechSynthesis.speak(utterance);
}
