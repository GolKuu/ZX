import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGameBridge } from '../app/gameBridgeContext';
import { TeamGameCanvas } from '../game/bridge/TeamGameCanvas';
import { GameEvents } from '../game/bridge/GameEvents';
import type { PlayerId } from '../game/core/types';
import { teamBattleStore } from '../stores/teamBattleStore';

export function TeamFightPage() {
  const [, navigate] = useLocation();
  const bridge = useGameBridge();
  const config = teamBattleStore.get();
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const exit = useCallback(() => {
    teamBattleStore.clear();
    navigate('/');
  }, [navigate]);
  const modes = useCallback(() => {
    teamBattleStore.clear();
    navigate('/team-modes');
  }, [navigate]);

  useEffect(
    () => bridge.on(GameEvents.matchEnded, ({ winner: next }) => setWinner(next)),
    [bridge],
  );

  if (!config) {
    return (
      <main className="fight-page">
        <section className="center-card">
          <h1>Сначала выберите командный режим</h1>
          <Link href="/team-modes" className="button button--primary">
            К режимам 2 на 2
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="fight-page">
      <TeamGameCanvas config={config} onExit={exit} onReturnToModes={modes} />
      {winner && (
        <div className="match-overlay" role="dialog" aria-modal="true">
          <div>
            <p className="eyebrow">Оба бойца соперника повержены</p>
            <h2>Команда {winner === 'player1' ? '1' : '2'} победила!</h2>
            <button className="button button--primary" onClick={modes}>
              Выбрать режим
            </button>
            <button className="button button--secondary" onClick={exit}>
              В главное меню
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
