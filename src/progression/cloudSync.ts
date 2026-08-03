import { getSupabaseClient } from '../lib/supabase.js';
import type { ProgressionProfile } from './types.js';

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
