import { supabase } from './supabase';
import type {
  AccountData,
  CloudPlayerSettings,
  EarnedAchievement,
  PlayerStatistics,
  PublicProfile,
} from './accountTypes';

export type ProfileChanges = Pick<
  PublicProfile,
  'nickname' | 'avatar_url' | 'region' | 'language' | 'favorite_character_ids'
>;

export async function loadAccountData(userId: string): Promise<AccountData> {
  const [profileResult, statisticsResult, achievementsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('player_statistics').select('*').eq('user_id', userId).single(),
    supabase
      .from('player_achievements')
      .select('achievement_id, awarded_at, achievement:achievements(*)')
      .eq('user_id', userId),
  ]);
  const error = profileResult.error ?? statisticsResult.error ?? achievementsResult.error;
  if (error) throw error;

  return {
    profile: profileResult.data as PublicProfile,
    statistics: statisticsResult.data as PlayerStatistics,
    achievements: (achievementsResult.data ?? []) as unknown as EarnedAchievement[],
  };
}

export async function updateProfile(userId: string, changes: ProfileChanges) {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as PublicProfile;
}

export async function loadCloudSettings(userId: string) {
  const { data, error } = await supabase
    .from('player_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data as CloudPlayerSettings;
}

export async function saveCloudSettings(settings: Omit<CloudPlayerSettings, 'updated_at'>) {
  const { data, error } = await supabase
    .from('player_settings')
    .upsert(settings, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as CloudPlayerSettings;
}

export async function deleteCurrentAccount() {
  const { data, error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });
  if (error || data?.deleted !== true) throw error ?? new Error('Account deletion failed');
}
