import { useEffect, useState, type ReactNode } from 'react';
import { ReactGameBridge } from '../game/bridge/ReactGameBridge';
import { GameBridgeContext } from './gameBridgeContext';

export function AppProviders({ children }: { children: ReactNode }) {
  const [bridge] = useState(() => new ReactGameBridge());

  useEffect(() => () => bridge.clear(), [bridge]);

  return <GameBridgeContext.Provider value={bridge}>{children}</GameBridgeContext.Provider>;
}
