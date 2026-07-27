import { createContext, useContext } from 'react';
import type { ReactGameBridge } from '../game/bridge/ReactGameBridge';

export const GameBridgeContext = createContext<ReactGameBridge | null>(null);

export function useGameBridge() {
  const bridge = useContext(GameBridgeContext);
  if (!bridge) throw new Error('useGameBridge must be used inside AppProviders');
  return bridge;
}
