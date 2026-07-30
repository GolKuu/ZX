import { ECHO_SPECIAL_MOVE_IDS } from '@/src/data/echo-special-moves';
import { ECHO_SUPER_MOVE_IDS } from '@/src/data/echo-super-moves';

const FINAL_PREDICTION_FINISH = 'echo.super.statistics.finish';

const LINES: Readonly<Record<string, readonly string[]>> = {
  [ECHO_SPECIAL_MOVE_IDS.patternScan]: [
    "I've seen this before.",
    'Interesting.',
    'Collecting data.',
  ],
  [ECHO_SPECIAL_MOVE_IDS.behavioralMirror]: [
    'Again?',
    'Same move.',
    'Predictable.',
  ],
  [ECHO_SPECIAL_MOVE_IDS.predictionLock]: [
    'There.',
    'Found it.',
    'Expected.',
  ],
  [ECHO_SUPER_MOVE_IDS.analysis]: [
    'I knew it.',
    'Exactly as expected.',
    'Nothing new.',
  ],
  [ECHO_SUPER_MOVE_IDS.repeat]: [
    'Enough information.',
    'Pattern complete.',
    'Analysis finished.',
  ],
  [ECHO_SUPER_MOVE_IDS.statistics]: [
    'There was only one outcome.',
  ],
  [FINAL_PREDICTION_FINISH]: [
    'You made this easy.',
    'I solved you.',
    'You never changed.',
  ],
};

const nextLine = new Map<string, number>();

export function speakEchoMove(moveId: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const lines = LINES[moveId];
  if (lines === undefined) return;
  const index = nextLine.get(moveId) ?? 0;
  const text = lines[index % lines.length] ?? lines[0];
  if (text === undefined) return;
  nextLine.set(moveId, index + 1);

  const line = new SpeechSynthesisUtterance(text);
  line.lang = 'en-US';
  line.pitch = 0.72;
  line.rate = 0.88;
  line.volume = 0.82;
  window.speechSynthesis.speak(line);
}

export function speakFinalPredictionResult(): void {
  speakEchoMove(FINAL_PREDICTION_FINISH);
}
