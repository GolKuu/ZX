import { GLITCH_MOVE_IDS } from '@/src/data/glitch-combat-moves';
import { GLITCH_SUPER_MOVE_IDS } from '@/src/data/glitch-super-moves';

const LINES: Readonly<Record<string, readonly string[]>> = {
  [GLITCH_MOVE_IDS.corruptedZone]: [
    'Connection lost.',
    'Please wait.',
    'Buffering.',
  ],
  [GLITCH_MOVE_IDS.packetLoss]: [
    'Unexpected error.',
    'Bad data.',
    'Oops.',
  ],
  [GLITCH_MOVE_IDS.desyncJump]: [
    'Out of sync.',
    'Try again.',
    'Server disagrees.',
  ],
  [GLITCH_SUPER_MOVE_IDS.error]: [
    'Not a bug.',
    'Feature.',
    'Working as intended.',
  ],
  [GLITCH_SUPER_MOVE_IDS.critical]: [
    'Version mismatch.',
    'Update required.',
    'Patch deployed.',
  ],
  [GLITCH_SUPER_MOVE_IDS.patchNotes]: [
    'Opponent.exe stopped responding.',
  ],
};

let lineIndex = 0;

export function speakGlitchMove(moveId: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const lines = LINES[moveId];
  if (lines === undefined || lines.length === 0) return;
  const line = lines[lineIndex % lines.length] ?? lines[0];
  lineIndex += 1;

  const speech = new SpeechSynthesisUtterance(line);
  speech.lang = 'en-US';
  speech.pitch = 0.56;
  speech.rate = 0.82 + (lineIndex % 3) * 0.08;
  speech.volume = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

export function speakGlitchFinalLine(version: number): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const lines = ['Fatal exception.', 'Kernel panic.', 'System failure.'] as const;
  const speech = new SpeechSynthesisUtterance(lines[version % lines.length]);
  speech.lang = 'en-US';
  speech.pitch = 0.48;
  speech.rate = 0.72;
  speech.volume = 1;
  window.speechSynthesis.speak(speech);
}
