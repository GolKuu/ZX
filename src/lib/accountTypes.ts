export type PublicProfile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  region: string;
  language: string;
  favorite_character_ids: string[];
  created_at: string;
  updated_at: string;
};

export type PlayerStatistics = {
  user_id: string;
  matches_played: number;
  wins: number;
  losses: number;
  rating: number;
  updated_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type EarnedAchievement = {
  achievement_id: string;
  awarded_at: string;
  achievement: Achievement;
};

export type CloudPlayerSettings = {
  user_id: string;
  control_layout: Record<string, unknown>;
  graphics: Record<string, unknown>;
  master_volume: number;
  music_volume: number;
  effects_volume: number;
  blood_level: number;
  accessibility: Record<string, unknown>;
  updated_at: string;
};

export type AccountData = {
  profile: PublicProfile;
  statistics: PlayerStatistics;
  achievements: EarnedAchievement[];
};
