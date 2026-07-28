import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGameBridge } from '../app/gameBridgeContext';
import { AppShell } from '../components/layout/AppShell';
import { playerLabels } from '../game/config/defaultControls';
import { GameCanvas } from '../game/bridge/GameCanvas';
import { GameEvents } from '../game/bridge/GameEvents';
import type { PlayerId } from '../game/core/types';
import { localPvpStore } from '../stores/localPvpStore';

type DeviceIssue = { playerId: PlayerId; label: string };
type MatchResult = { winner: PlayerId; wins: Record<PlayerId, number> };

export function FightPage() {
  const [, navigate] = useLocation();
  const bridge = useGameBridge();
  const matchConfig = localPvpStore.get();
  const [deviceIssue, setDeviceIssue] = useState<DeviceIssue | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const exitToMenu = useCallback(() => navigate('/'), [navigate]);
  const returnToSetup = useCallback(() => {
    localPvpStore.clear();
    navigate('/local-pvp');
  }, [navigate]);

  useEffect(() => {
    const stopDisconnected = bridge.on(GameEvents.deviceDisconnected, setDeviceIssue);
    const stopReconnected = bridge.on(GameEvents.deviceReconnected, ({ playerId }) => {
      setDeviceIssue((current) => (current?.playerId === playerId ? null : current));
    });
    const stopMatch = bridge.on(GameEvents.matchEnded, setResult);
    return () => {
      stopDisconnected();
      stopReconnected();
      stopMatch();
    };
  }, [bridge]);

  if (!matchConfig) {
    return (
      <AppShell compact>
        <section className="center-card">
          <p className="eyebrow">Матч не настроен</p>
          <h1>Сначала подготовьте LOCAL_PVP</h1>
          <p>Выберите два устройства, персонажей и подтвердите готовность обоих игроков.</p>
          <Link href="/local-pvp" className="button button--primary">
            К подготовке
          </Link>
        </section>
      </AppShell>
    );
  }

  function rematch() {
    setResult(null);
    bridge.emit(GameEvents.rematchRequested, undefined);
  }

  return (
    <main className="fight-page">
      <div className="fight-page__heading">
        <div>
          <span className="brand__mark">CC</span>
          <strong>Circle Clash · LOCAL_PVP</strong>
        </div>
        <p>Esc / Start — пауза</p>
      </div>
      <GameCanvas
        matchConfig={matchConfig}
        onExit={exitToMenu}
        onReturnToSetup={returnToSetup}
      />

      {deviceIssue && (
        <div className="match-overlay" role="alertdialog" aria-modal="true">
          <div>
            <p className="eyebrow">Матч на паузе</p>
            <h2>{playerLabels[deviceIssue.playerId]}: устройство отключено</h2>
            <p>{deviceIssue.label}. Переподключите его или продолжите на клавиатуре.</p>
            <button
              type="button"
              className="button button--primary"
              onClick={() =>
                bridge.emit(GameEvents.switchToKeyboardRequested, {
                  playerId: deviceIssue.playerId,
                })
              }
            >
              Перейти на клавиатуру
            </button>
            <button type="button" className="button button--secondary" onClick={returnToSetup}>
              Вернуться к выбору
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="match-overlay" role="dialog" aria-modal="true">
          <div>
            <p className="eyebrow">Матч завершён</p>
            <h2>{playerLabels[result.winner]} побеждает!</h2>
            <p>
              Счёт по раундам: {result.wins.player1} : {result.wins.player2}
            </p>
            <button type="button" className="button button--primary" onClick={rematch}>
              Повторный матч
            </button>
            <button type="button" className="button button--secondary" onClick={returnToSetup}>
              К выбору
            </button>
            <button type="button" className="button button--secondary" onClick={exitToMenu}>
              В главное меню
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
