import { useEffect, useState } from 'react';
import { playerLabels } from '../../game/config/defaultControls';
import type { PlayerId } from '../../game/core/types';
import type { InputDeviceAssignment, KeyboardProfiles } from '../../game/input/InputProfile';

export function InputCheckPanel({
  devices,
  profiles,
}: {
  devices: Record<PlayerId, InputDeviceAssignment>;
  profiles: KeyboardProfiles;
}) {
  const [lastInput, setLastInput] = useState<Record<PlayerId, string>>({
    player1: 'Нажмите любую назначенную кнопку',
    player2: 'Нажмите любую назначенную кнопку',
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      (['player1', 'player2'] as const).forEach((playerId) => {
        if (devices[playerId].kind !== 'keyboard') return;
        const profile = profiles[playerId];
        const entries = [
          ...Object.entries(profile.bindings),
          ...(profile.scheme === 'CLASSIC'
            ? Object.entries(profile.classicBindings ?? {})
            : []),
        ];
        const entry = entries.find(
          ([, code]) => code === event.code,
        );
        if (entry) {
          setLastInput((current) => ({ ...current, [playerId]: `${entry[0]} · ${event.code}` }));
        }
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [devices, profiles]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!navigator.getGamepads) return;
      const pads = navigator.getGamepads();
      (['player1', 'player2'] as const).forEach((playerId) => {
        const device = devices[playerId];
        if (device.kind !== 'gamepad') return;
        const gamepad = pads[device.gamepadIndex];
        const buttonIndex = gamepad?.buttons.findIndex((button) => button.pressed) ?? -1;
        if (buttonIndex >= 0) {
          setLastInput((current) => ({
            ...current,
            [playerId]: `Gamepad button ${buttonIndex}`,
          }));
        }
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [devices]);

  return (
    <div className="input-check-grid">
      {(['player1', 'player2'] as const).map((playerId) => (
        <div key={playerId}>
          <strong>{playerLabels[playerId]}</strong>
          <output>{lastInput[playerId]}</output>
        </div>
      ))}
    </div>
  );
}
