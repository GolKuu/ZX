import { getSupabaseClient } from '../lib/supabase.js';
import type { ProgressionProfile } from './types.js';
import { gloryStanding } from './glory.js';

export interface LeaderboardEntry {
  readonly userId: string; readonly displayName: string; readonly xp: number;
  readonly wins: number; readonly level: number; readonly isCurrentUser?: boolean;
}

export async function trustedServerTime(): Promise<Date | null> {
  const supabase = await getSupabaseClient(); if (supabase === null) return null;
  const { data, error } = await supabase.rpc('yzx_server_time');
  return error === null && typeof data === 'string' ? new Date(data) : null;
}

export async function syncProgression(profile: ProgressionProfile): Promise<boolean> {
  const supabase = await getSupabaseClient(); if (supabase === null) return false;
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id; if (userId === undefined) return false;
  const profileResult = await supabase.from('yzx_progression_profiles').upsert({
    user_id: userId, schema_version: profile.schemaVersion, payload: profile, updated_at: profile.updatedAt,
  }, { onConflict: 'user_id' });
  if (profileResult.error !== null) return false;
  if (profile.transactions.length === 0) return true;
  const rows = profile.transactions.map((entry) => ({ id:entry.id,user_id:userId,occurred_at:entry.timestamp,
    transaction_type:entry.type,amount:entry.amount,balance_before:entry.balanceBefore,balance_after:entry.balanceAfter,
    source_id:entry.sourceId,idempotency_key:entry.idempotencyKey,version:entry.version }));
  const result = await supabase.from('yzx_token_transactions').upsert(rows,{onConflict:'id',ignoreDuplicates:true});
  return result.error === null;
}

function safeDisplayName(email: string | undefined, metadata: Record<string, unknown> | undefined): string {
  const candidate = typeof metadata?.display_name === 'string' ? metadata.display_name : email?.split('@')[0];
  return (candidate ?? 'offline-player').replace(/[^a-zA-Z0-9 _.-]/g, '').trim().slice(0, 24) || 'player';
}

export async function publishGloryStanding(profile: ProgressionProfile): Promise<boolean> {
  const supabase = await getSupabaseClient(); if (supabase === null) return false;
  const { data: auth } = await supabase.auth.getUser(); const user = auth.user;
  if (user === null) return false;
  const standing = gloryStanding(profile);
  const result = await supabase.from('yzx_glory_leaderboard').upsert({
    user_id: user.id, display_name: safeDisplayName(user.email, user.user_metadata),
    xp: standing.xp, wins: standing.wins, level: standing.level, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  return result.error === null;
}

export async function fetchGloryLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const supabase = await getSupabaseClient(); if (supabase === null) return [];
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('yzx_glory_leaderboard')
    .select('user_id, display_name, xp, wins, level').order('xp', { ascending: false })
    .order('updated_at', { ascending: true }).limit(limit);
  if (error !== null || data === null) return [];
  return data.map((entry) => ({ userId: entry.user_id as string, displayName: entry.display_name as string,
    xp: entry.xp as number, wins: entry.wins as number, level: entry.level as number,
    isCurrentUser: entry.user_id === auth.user?.id }));
}
