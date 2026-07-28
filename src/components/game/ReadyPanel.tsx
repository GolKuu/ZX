import { playerLabels } from '../../game/config/defaultControls';
import type { PlayerId } from '../../game/core/types';

export function ReadyPanel({
  ready,
  onChange,
}: {
  ready: Record<PlayerId, boolean>;
  onChange: (playerId: PlayerId, ready: boolean) => void;
}) {
  return (
    <div className="ready-grid">
      {(['player1', 'player2'] as const).map((playerId) => (
        <label key={playerId} className={ready[playerId] ? 'ready-card ready-card--active' : 'ready-card'}>
          <input
            type="checkbox"
            checked={ready[playerId]}
            onChange={(event) => onChange(playerId, event.target.checked)}
          />
          <span>{ready[playerId] ? '✓ Готов' : 'Не готов'}</span>
          <strong>{playerLabels[playerId]}</strong>
        </label>
      ))}
    </div>
  );
}
