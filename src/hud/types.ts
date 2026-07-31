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
  /** Energy bar, 0–100. */
  readonly superCharge: number;
  /** Low health has unlocked the ultimate and it is still unused. */
  readonly ultimateReady: boolean;
  /** Lucky's deterministic secondary resource, 0–100. */
  readonly luck?: number;
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
  /** Energy each fighter currently holds, 0–100. Owned by the meter controller. */
  readonly superCharge?: Readonly<Record<string, number | undefined>>;
  readonly ultimateReady?: Readonly<Record<string, boolean | undefined>>;
  readonly luck?: Readonly<Record<string, number | undefined>>;
}
