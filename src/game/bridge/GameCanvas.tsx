import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import { useGameBridge } from '../../app/gameBridgeContext';
import { createGameConfig } from '../config/gameConfig';
import { GameEvents } from './GameEvents';

export function GameCanvas({ onExit }: { onExit: () => void }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const bridge = useGameBridge();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent || gameRef.current) return;

    const stopReadyListener = bridge.on(GameEvents.ready, () => setIsReady(true));
    const stopExitListener = bridge.on(GameEvents.exitRequested, onExit);
    parent.querySelectorAll('canvas').forEach((canvas) => canvas.remove());

    const game = new Phaser.Game(createGameConfig(parent, bridge));
    gameRef.current = game;
    const resizeObserver = new ResizeObserver(() => game.scale.refresh());
    resizeObserver.observe(parent);

    return () => {
      stopReadyListener();
      stopExitListener();
      resizeObserver.disconnect();
      if (gameRef.current === game) gameRef.current = null;
      game.destroy(true);
      parent.replaceChildren();
      setIsReady(false);
    };
  }, [bridge, onExit]);

  return (
    <section className="game-canvas" aria-label="Арена Circle Clash">
      {!isReady && <p className="game-canvas__loading">Готовим арену…</p>}
      <div ref={parentRef} className="game-canvas__surface" />
    </section>
  );
}
