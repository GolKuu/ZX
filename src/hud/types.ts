export const HUD_PUBLISH_INTERVAL_FRAMES = 4;
export const HUD_TIMER_FPS = 60;

export type PlayerSide = 'left' | 'right';

export interface HudFighterIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly playerTag: 'P1' | 'P2' | 'CPU';
  readonly side: PlayerSide;
}

export interface HudFighterSnapshot extends HudFighterIdentity {
  readonly health: number;
  readonly maxHealth: number;
  readonly superCharge: number;
  readonly roundWins: number;
}

export interface HudComboSnapshot {
  readonly attackerId: string;
  readonly hits: number;
  readonly damage: number;
}

export interface HudSnapshot {
  readonly frame: number;
  readonly round: number;
  readonly timerFrames: number;
  readonly fighters: readonly [HudFighterSnapshot, HudFighterSnapshot];
  readonly combo: HudComboSnapshot | null;
}

export interface HudMatchState {
  readonly round: number;
  readonly timerFrames: number;
  readonly roundWins: Readonly<Record<string, number | undefined>>;
}
