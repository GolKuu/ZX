import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasValidUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl ?? '');
const hasValidKey = Boolean(
  supabaseAnonKey
    && [...supabaseAnonKey].every((character) => character.codePointAt(0)! <= 127)
    && (
      supabaseAnonKey.startsWith('sb_publishable_')
      || supabaseAnonKey.split('.').length === 3
    ),
);

export const isSupabaseConfigured = hasValidUrl && hasValidKey;

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl! : 'https://not-configured.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey! : 'not-configured',
);
