import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import { useGameBridge } from '../../app/gameBridgeContext';
import { createGameConfig } from '../config/gameConfig';
import { GameEvents } from './GameEvents';
import type { LocalPvpMatchConfig } from '../../stores/localPvpStore';

export function GameCanvas({
  matchConfig,
  onExit,
  onReturnToSetup,
}: {
  matchConfig: LocalPvpMatchConfig;
  onExit: () => void;
  onReturnToSetup: () => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const bridge = useGameBridge();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent || gameRef.current) return;

    const stopReadyListener = bridge.on(GameEvents.ready, () => setIsReady(true));
    const stopExitListener = bridge.on(GameEvents.exitRequested, onExit);
    const stopSetupListener = bridge.on(GameEvents.returnToSetupRequested, onReturnToSetup);
    parent.querySelectorAll('canvas').forEach((canvas) => canvas.remove());

    const game = new Phaser.Game(createGameConfig(parent, bridge, matchConfig));
    gameRef.current = game;
    const resizeObserver = new ResizeObserver(() => game.scale.refresh());
    resizeObserver.observe(parent);

    return () => {
      stopReadyListener();
      stopExitListener();
      stopSetupListener();
      resizeObserver.disconnect();
      if (gameRef.current === game) gameRef.current = null;
      game.destroy(true);
      parent.replaceChildren();
      setIsReady(false);
    };
  }, [bridge, matchConfig, onExit, onReturnToSetup]);

  return (
    <section className="game-canvas" aria-label="Арена Circle Clash">
      {!isReady && <p className="game-canvas__loading">Готовим арену…</p>}
      <div ref={parentRef} className="game-canvas__surface" />
    </section>
  );
}
