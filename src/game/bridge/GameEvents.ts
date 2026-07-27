export const GameEvents = {
  ready: 'game:ready',
  destroyed: 'game:destroyed',
  exitRequested: 'game:exit-requested',
  pauseChanged: 'game:pause-changed',
} as const;

export type GameEventPayloads = {
  [GameEvents.ready]: { canvasCount: number };
  [GameEvents.destroyed]: undefined;
  [GameEvents.exitRequested]: undefined;
  [GameEvents.pauseChanged]: { paused: boolean };
};

export type GameEventName = keyof GameEventPayloads;
