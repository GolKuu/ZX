import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

let browserClient: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url === undefined || publishableKey === undefined) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient(url, publishableKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: 'pkce',
      persistSession: true,
    },
  });
  return browserClient;
}
