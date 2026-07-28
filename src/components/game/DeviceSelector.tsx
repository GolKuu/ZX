import { playerLabels } from '../../game/config/defaultControls';
import type { PlayerId } from '../../game/core/types';
import type { InputDeviceAssignment } from '../../game/input/InputProfile';
import type { AvailableGamepad } from '../../game/input/useAvailableGamepads';

export function DeviceSelector({
  playerId,
  value,
  gamepads,
  onChange,
}: {
  playerId: PlayerId;
  value: InputDeviceAssignment;
  gamepads: AvailableGamepad[];
  onChange: (device: InputDeviceAssignment) => void;
}) {
  const selected = value.kind === 'keyboard' ? 'keyboard' : `gamepad:${value.gamepadIndex}`;

  return (
    <label className="setup-field">
      <span>{playerLabels[playerId]}</span>
      <select
        value={selected}
        onChange={(event) => {
          if (event.target.value === 'keyboard') {
            onChange({ kind: 'keyboard', id: 'keyboard' });
            return;
          }
          const index = Number(event.target.value.split(':')[1]);
          const gamepad = gamepads.find((item) => item.index === index);
          if (gamepad) {
            onChange({
              kind: 'gamepad',
              id: gamepad.id,
              gamepadIndex: gamepad.index,
              gamepadLabel: gamepad.label,
            });
          }
        }}
      >
        <option value="keyboard">Клавиатура</option>
        {gamepads.map((gamepad) => (
          <option key={gamepad.id} value={`gamepad:${gamepad.index}`}>
            🎮 {gamepad.label}
          </option>
        ))}
      </select>
    </label>
  );
}
