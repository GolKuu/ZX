import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: Promise<SupabaseClient | null> | undefined;

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (browserClient !== undefined) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url === undefined || publishableKey === undefined) {
    browserClient = Promise.resolve(null);
    return browserClient;
  }

  browserClient = import('@supabase/supabase-js').then(({ createClient }) => {
    return createClient(url, publishableKey, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    });
  });
  return browserClient;
}
