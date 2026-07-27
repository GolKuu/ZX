import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { GameCanvas } from '../game/bridge/GameCanvas';

export function FightPage() {
  const [, navigate] = useLocation();
  const exitToMenu = useCallback(() => navigate('/'), [navigate]);

  return (
    <main className="fight-page">
      <div className="fight-page__heading">
        <div>
          <span className="brand__mark">CC</span>
          <strong>Circle Clash</strong>
        </div>
        <p>P — пауза · Esc — в меню</p>
      </div>
      <GameCanvas onExit={exitToMenu} />
    </main>
  );
}
