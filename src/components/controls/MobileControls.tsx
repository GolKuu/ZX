import React from 'react';
import { useGameBridge } from '../../app/gameBridgeContext';
import { GameEvents } from '../../game/bridge/GameEvents';

type MobileControlsProps = {
  playerId?: 'player1' | 'player2';
};

const ACTIONS = [
  'MOVE_LEFT',
  'MOVE_RIGHT',
  'JUMP',
  'LIGHT_ATTACK',
  'HEAVY_ATTACK',
  'SPECIAL_ATTACK',
  'DEFENSE',
];

export function MobileControls({ playerId = 'player1' }: MobileControlsProps) {
  const bridge = useGameBridge();

  function emit(action: string, pressed: boolean) {
    bridge.emit(GameEvents.mobileAction, { playerId, action, pressed });
  }

  return (
    <div className="mobile-controls" aria-hidden="false">
      <div className="mobile-controls__row">
        <button className="mobile-btn" onPointerDown={() => emit('MOVE_LEFT', true)} onPointerUp={() => emit('MOVE_LEFT', false)} onPointerLeave={() => emit('MOVE_LEFT', false)}>◀</button>
        <button className="mobile-btn" onPointerDown={() => emit('JUMP', true)} onPointerUp={() => emit('JUMP', false)}>▲</button>
        <button className="mobile-btn" onPointerDown={() => emit('MOVE_RIGHT', true)} onPointerUp={() => emit('MOVE_RIGHT', false)}>▶</button>
      </div>
      <div className="mobile-controls__row">
        {ACTIONS.slice(3).map((action) => (
          <button
            key={action}
            className="mobile-btn mobile-btn--action"
            onPointerDown={() => emit(action, true)}
            onPointerUp={() => emit(action, false)}
            onPointerLeave={() => emit(action, false)}
          >
            {action.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MobileControls;
