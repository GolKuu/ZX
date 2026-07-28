import { describe, expect, it } from 'vitest';
import { authSessionOptions } from '../../lib/supabase';

describe('persistent authentication', () => {
  it('stores the session, restores it from the callback and refreshes it automatically', () => {
    expect(authSessionOptions).toEqual({
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    });
  });
});
