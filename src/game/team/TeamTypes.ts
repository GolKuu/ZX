import type {
  FighterSnapshot,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';

export const TEAM_MODES = [
  'LOCAL_2V2',
  'ONLINE_2V2',
  'TWO_PLAYERS_VS_AI',
  'PLAYER_AND_AI_VS_TWO_OPPONENTS',
] as const;

export const TEAM_ACTIONS = ['ASSIST', 'TAG_SWITCH', 'BURST_ASSIST'] as const;

export type TeamMode = (typeof TEAM_MODES)[number];
export type TeamAction = (typeof TEAM_ACTIONS)[number];
export type TeamId = PlayerId;
export type TeamMemberIndex = 0 | 1;
export type TeamController =
  | 'LOCAL_PLAYER_1'
  | 'LOCAL_PLAYER_2'
  | 'ONLINE_PLAYER_1'
  | 'ONLINE_PLAYER_2'
  | 'AI';

export type TeamBattleConfig = {
  mode: TeamMode;
  rosters: Record<TeamId, readonly [string, string]>;
  controllers: Record<TeamId, readonly [TeamController, TeamController]>;
};

export type TeamMemberSnapshot = {
  fighter: FighterSnapshot;
  controller: TeamController;
  defeated: boolean;
};

export type TeamAssistSnapshot = {
  kind: 'ASSIST' | 'BURST_ASSIST';
  memberIndex: TeamMemberIndex;
  fighter: FighterSnapshot;
  ticksRemaining: number;
  connected: boolean;
};

export type TeamSnapshot = {
  activeMember: TeamMemberIndex;
  members: [TeamMemberSnapshot, TeamMemberSnapshot];
  tagCooldownTicks: number;
  assistCooldownTicks: number;
  assistComboLocked: boolean;
  burstAssistAvailable: boolean;
  assist: TeamAssistSnapshot | null;
  aiTakeover: boolean;
};

export type TeamBattleSnapshot = {
  mode: TeamMode;
  teams: Record<TeamId, TeamSnapshot>;
  winner: TeamId | null;
};

export type TeamSimulationSnapshot = SimulationSnapshot & {
  teamBattle: TeamBattleSnapshot;
};

export type TeamInputFrame = Partial<Record<TeamController, PlayerInputFrame>>;

export type TeamActionRejection =
  | 'ROUND_NOT_ACTIVE'
  | 'TEAM_DEFEATED'
  | 'PARTNER_DEFEATED'
  | 'ASSIST_ACTIVE'
  | 'ASSIST_COOLDOWN'
  | 'ASSIST_ALREADY_EXTENDED_COMBO'
  | 'TAG_COOLDOWN'
  | 'ACTIVE_FIGHTER_BUSY'
  | 'BURST_ALREADY_USED'
  | 'BURST_NOT_UNDER_PRESSURE';

export type TeamActionValidation =
  | { ok: true }
  | { ok: false; reason: TeamActionRejection };
