import { createClient } from '@supabase/supabase-js';

// Ключи берутся из .env локально и из Vercel → Settings → Environment Variables на проде.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasValidUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url ?? '');
const hasAsciiKey = Boolean(
  anonKey && [...anonKey].every((character) => character.codePointAt(0)! <= 127),
);
const hasValidKey =
  hasAsciiKey &&
  (anonKey?.startsWith('sb_publishable_') || anonKey?.split('.').length === 3);

export const isSupabaseConfigured = Boolean(hasValidUrl && hasValidKey);

export const authSessionOptions = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
} as const;

// Запасные значения позволяют показать понятную подсказку в интерфейсе вместо белого экрана.
export const supabase = createClient(
  isSupabaseConfigured ? url! : 'https://not-configured.supabase.co',
  isSupabaseConfigured ? anonKey! : 'not-configured',
  { auth: authSessionOptions },
);
