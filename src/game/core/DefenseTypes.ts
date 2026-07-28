export type DefenseTimingFeedback = 'none' | 'too-early' | 'success' | 'too-late';

export type DefenseEffect =
  | 'none'
  | 'precise-block'
  | 'perfect-block'
  | 'combo-escape'
  | 'combo-break';

export type DefenseSnapshot = {
  segments: number;
  maxSegments: number;
  comboEscapeCooldownTicks: number;
  feedback: DefenseTimingFeedback;
  feedbackTicksRemaining: number;
  effect: DefenseEffect;
  effectTicksRemaining: number;
};
