import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import type { LocalTeamBattleConfig } from '../../stores/teamBattleStore';
import { useGameBridge } from '../../app/gameBridgeContext';
import { createTeamGameConfig } from '../config/teamGameConfig';
import { GameEvents } from './GameEvents';

export function TeamGameCanvas({
  config,
  onExit,
  onReturnToModes,
}: {
  config: LocalTeamBattleConfig;
  onExit: () => void;
  onReturnToModes: () => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const bridge = useGameBridge();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent || gameRef.current) return;
    const stopReady = bridge.on(GameEvents.ready, () => setReady(true));
    const stopExit = bridge.on(GameEvents.exitRequested, onExit);
    const stopModes = bridge.on(GameEvents.returnToSetupRequested, onReturnToModes);
    const game = new Phaser.Game(createTeamGameConfig(parent, bridge, config));
    gameRef.current = game;
    const refresh = () => game.scale.refresh();
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(refresh);
    observer?.observe(parent);
    if (!observer) window.addEventListener('resize', refresh);

    return () => {
      stopReady();
      stopExit();
      stopModes();
      observer?.disconnect();
      window.removeEventListener('resize', refresh);
      if (gameRef.current === game) gameRef.current = null;
      game.destroy(true);
      parent.replaceChildren();
    };
  }, [bridge, config, onExit, onReturnToModes]);

  return (
    <section className="game-canvas" aria-label="Командная арена Circle Clash">
      {!ready && <p className="game-canvas__loading">Готовим командный бой…</p>}
      <div ref={parentRef} className="game-canvas__surface" />
    </section>
  );
}
