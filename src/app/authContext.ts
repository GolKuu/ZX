import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'signedOut' | 'guest' | 'authenticated';

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  enterGuestMode: () => Promise<void>;
  leaveGuestMode: () => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AppProviders');
  return value;
}
