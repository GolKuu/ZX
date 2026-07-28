import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import type { OnlineMatchClient } from '../network/OnlineMatchClient';
import { useGameBridge } from '../../app/gameBridgeContext';
import { createOnlineGameConfig } from '../config/onlineGameConfig';
import { GameEvents } from './GameEvents';
import { FullscreenButton } from '../../components/layout/FullscreenButton';

type OnlineGameCanvasProps = {
  client: OnlineMatchClient;
  onExit: () => void;
  onReturnToRoom: () => void;
};

export function OnlineGameCanvas(props: OnlineGameCanvasProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const bridge = useGameBridge();
  const [isReady, setIsReady] = useState(false);
  const { client, onExit, onReturnToRoom } = props;

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent || gameRef.current) return;
    const stopReady = bridge.on(GameEvents.ready, () => setIsReady(true));
    const stopExit = bridge.on(GameEvents.exitRequested, onExit);
    const stopRoom = bridge.on(GameEvents.returnToSetupRequested, onReturnToRoom);
    const game = new Phaser.Game(
      createOnlineGameConfig(parent, bridge, client),
    );
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
      stopRoom();
      observer?.disconnect();
      window.removeEventListener('resize', refresh);
      if (gameRef.current === game) gameRef.current = null;
      game.destroy(true);
      parent.replaceChildren();
    };
  }, [bridge, client, onExit, onReturnToRoom]);

  return (
    <section className="game-canvas" aria-label="Онлайн-арена Circle Clash">
      <div className="fight-toolbar"><FullscreenButton compact /></div>
      {!isReady && <p className="game-canvas__loading">Подключаем арену…</p>}
      <div ref={parentRef} className="game-canvas__surface" />
    </section>
  );
}
