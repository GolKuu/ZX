import type { ControlScheme, PlayerId } from '../../game/core/types';
import { playerLabels } from '../../game/config/defaultControls';

const labels: Record<ControlScheme, string> = {
  SIMPLIFIED: 'Упрощённая',
  CLASSIC: 'Классическая',
  ONE_HANDED: 'Одной рукой',
};

export function ControlSchemeSelector({
  playerId,
  value,
  onChange,
}: {
  playerId: PlayerId;
  value: ControlScheme;
  onChange: (scheme: ControlScheme) => void;
}) {
  return (
    <label className="scheme-selector">
      <span>Схема — {playerLabels[playerId]}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ControlScheme)}
      >
        {Object.entries(labels).map(([scheme, label]) => (
          <option value={scheme} key={scheme}>{label}</option>
        ))}
      </select>
    </label>
  );
}
