import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { loadAndApplyCloudSettings } from '../lib/settingsSync';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthContext, type AuthStatus } from './authContext';

const GUEST_KEY = 'circle-clash-guest-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const validateSession = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setUser(null);
      setStatus(readGuestStatus());
      return;
    }
    sessionStorage.removeItem(GUEST_KEY);
    setUser(data.user);
    setStatus('authenticated');
    void loadAndApplyCloudSettings(data.user.id);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus(readGuestStatus());
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) void validateSession();
      else setStatus(readGuestStatus());
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) void validateSession();
      else {
        setUser(null);
        setStatus(readGuestStatus());
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [validateSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      enterGuestMode: async () => {
        if (isSupabaseConfigured) await supabase.auth.signOut({ scope: 'local' });
        sessionStorage.setItem(GUEST_KEY, '1');
        setUser(null);
        setStatus('guest');
      },
      leaveGuestMode: () => {
        sessionStorage.removeItem(GUEST_KEY);
        setStatus('signedOut');
      },
      signOut: async () => {
        sessionStorage.removeItem(GUEST_KEY);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setStatus('signedOut');
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function readGuestStatus(): AuthStatus {
  return sessionStorage.getItem(GUEST_KEY) === '1' ? 'guest' : 'signedOut';
}
