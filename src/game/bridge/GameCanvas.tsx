import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import { useGameBridge } from '../../app/gameBridgeContext';
import { createGameConfig } from '../config/gameConfig';
import { GameEvents } from './GameEvents';
import type { LocalPvpMatchConfig } from '../../stores/localPvpStore';
import MobileControls from '../../components/controls/MobileControls';

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
  const [startupError, setStartupError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(Boolean((navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window));
    const parent = parentRef.current;
    if (!parent || gameRef.current) return;

    setIsReady(false);
    setStartupError(false);
    const startupTimeout = window.setTimeout(() => setStartupError(true), 10_000);
    const stopReadyListener = bridge.on(GameEvents.ready, () => {
      window.clearTimeout(startupTimeout);
      setStartupError(false);
      setIsReady(true);
    });
    const stopExitListener = bridge.on(GameEvents.exitRequested, onExit);
    const stopSetupListener = bridge.on(GameEvents.returnToSetupRequested, onReturnToSetup);
    parent.querySelectorAll('canvas').forEach((canvas) => canvas.remove());

    let game: Phaser.Game;
    try {
      game = new Phaser.Game(createGameConfig(parent, bridge, matchConfig));
      gameRef.current = game;
    } catch {
      window.clearTimeout(startupTimeout);
      stopReadyListener();
      stopExitListener();
      stopSetupListener();
      setStartupError(true);
      return;
    }

    let width = parent.clientWidth;
    let height = parent.clientHeight;
    const refreshScale = () => {
      const nextWidth = parent.clientWidth;
      const nextHeight = parent.clientHeight;
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      game.scale.refresh();
    };
    let resizeObserver: ResizeObserver | null = null;
    try {
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(refreshScale);
        resizeObserver.observe(parent);
      }
    } catch {
      resizeObserver = null;
    }
    if (!resizeObserver) window.addEventListener('resize', refreshScale);

    return () => {
      window.clearTimeout(startupTimeout);
      stopReadyListener();
      stopExitListener();
      stopSetupListener();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', refreshScale);
      if (gameRef.current === game) gameRef.current = null;
      game.destroy(true);
      parent.replaceChildren();
    };
  }, [bridge, matchConfig, onExit, onReturnToSetup, retryKey]);

  return (
    <section className="game-canvas" aria-label="Арена Circle Clash">
      {!isReady && !startupError && (
        <p className="game-canvas__loading">Готовим арену…</p>
      )}
      {startupError && (
        <div className="game-canvas__error" role="alert">
          <strong>Арена не успела запуститься</strong>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Повторить
          </button>
          <button type="button" className="button button--secondary" onClick={onReturnToSetup}>
            Вернуться к выбору
          </button>
        </div>
      )}
      <div ref={parentRef} className="game-canvas__surface" />
      {isMobile && <MobileControls />}
    </section>
  );
}
