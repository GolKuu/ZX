import { useEffect, useState, type ReactNode } from 'react';
import { ReactGameBridge } from '../game/bridge/ReactGameBridge';
import { AuthProvider } from './AuthProvider';
import { GameBridgeContext } from './gameBridgeContext';

export function AppProviders({ children }: { children: ReactNode }) {
  const [bridge] = useState(() => new ReactGameBridge());

  useEffect(() => () => bridge.clear(), [bridge]);

  return (
    <AuthProvider>
      <GameBridgeContext.Provider value={bridge}>{children}</GameBridgeContext.Provider>
    </AuthProvider>
  );
}
