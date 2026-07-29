import type { PlayerId } from '../core/types';

export const GameEvents = {
  ready: 'game:ready',
  destroyed: 'game:destroyed',
  exitRequested: 'game:exit-requested',
  returnToSetupRequested: 'game:return-to-setup-requested',
  pauseChanged: 'game:pause-changed',
  deviceDisconnected: 'game:device-disconnected',
  deviceReconnected: 'game:device-reconnected',
  switchToKeyboardRequested: 'game:switch-to-keyboard-requested',
  rematchRequested: 'game:rematch-requested',
  matchEnded: 'game:match-ended',
} as const;

export type GameEventPayloads = {
  [GameEvents.ready]: { canvasCount: number };
  [GameEvents.destroyed]: undefined;
  [GameEvents.exitRequested]: undefined;
  [GameEvents.returnToSetupRequested]: undefined;
  [GameEvents.pauseChanged]: { paused: boolean };
  [GameEvents.deviceDisconnected]: { playerId: PlayerId; label: string };
  [GameEvents.deviceReconnected]: { playerId: PlayerId; label: string };
  [GameEvents.switchToKeyboardRequested]: { playerId: PlayerId };
  [GameEvents.rematchRequested]: undefined;
  [GameEvents.matchEnded]: {
    winner: PlayerId;
    wins: Record<PlayerId, number>;
  };
};

export type GameEventName = keyof GameEventPayloads;
