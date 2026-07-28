import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CharacterSelector } from '../components/game/CharacterSelector';
import { DeviceSelector } from '../components/game/DeviceSelector';
import { InputCheckPanel } from '../components/game/InputCheckPanel';
import { ReadyPanel } from '../components/game/ReadyPanel';
import { SetupStep } from '../components/game/SetupStep';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import type { PlayerId } from '../game/core/types';
import { ControlStorage } from '../game/input/ControlStorage';
import type { InputDeviceAssignment } from '../game/input/InputProfile';
import { useAvailableGamepads } from '../game/input/useAvailableGamepads';
import {
  createMatchConfig,
  localPvpStore,
  validateMatchConfig,
} from '../stores/localPvpStore';

const storage = new ControlStorage();
const keyboardDevice: InputDeviceAssignment = { kind: 'keyboard', id: 'keyboard' };

export function LocalPvpPage() {
  const [, navigate] = useLocation();
  const gamepads = useAvailableGamepads();
  const [profiles] = useState(() => storage.load());
  const [devices, setDevices] = useState<Record<PlayerId, InputDeviceAssignment>>({
    player1: keyboardDevice,
    player2: keyboardDevice,
  });
  const [characters, setCharacters] = useState<Record<PlayerId, string>>({
    player1: 'granite',
    player2: 'shira',
  });
  const [ready, setReady] = useState<Record<PlayerId, boolean>>({
    player1: false,
    player2: false,
  });
  const [error, setError] = useState('');

  const config = useMemo(
    () => createMatchConfig(devices, profiles, characters, ready),
    [characters, devices, profiles, ready],
  );
  const validationError = validateMatchConfig(config);

  function updateDevice(playerId: PlayerId, device: InputDeviceAssignment) {
    setDevices((current) => ({ ...current, [playerId]: device }));
    setReady((current) => ({ ...current, [playerId]: false }));
    setError('');
  }

  function updateCharacter(playerId: PlayerId, characterId: string) {
    setCharacters((current) => ({ ...current, [playerId]: characterId }));
    setReady({ player1: false, player2: false });
    setError('');
  }

  function startMatch() {
    const nextError = validateMatchConfig(config);
    if (nextError) {
      setError(nextError);
      return;
    }
    localPvpStore.set(config);
    navigate('/fight');
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Основной режим"
        title="Подготовка LOCAL_PVP"
        description="Настройте два независимых устройства, проверьте ввод и подтвердите готовность."
      />

      <div className="setup-flow">
        <SetupStep number={1} title="Устройство Player 1">
          <DeviceSelector
            playerId="player1"
            value={devices.player1}
            gamepads={gamepads}
            onChange={(device) => updateDevice('player1', device)}
          />
        </SetupStep>
        <SetupStep number={2} title="Устройство Player 2">
          <DeviceSelector
            playerId="player2"
            value={devices.player2}
            gamepads={gamepads}
            onChange={(device) => updateDevice('player2', device)}
          />
        </SetupStep>
        <SetupStep
          number={3}
          title="Проверка ввода"
          description="Нажмите назначенную кнопку каждого устройства."
        >
          <InputCheckPanel devices={devices} profiles={profiles} />
        </SetupStep>
        <SetupStep number={4} title="Персонаж Player 1">
          <CharacterSelector
            playerId="player1"
            value={characters.player1}
            opponentCharacterId={characters.player2}
            onChange={(characterId) => updateCharacter('player1', characterId)}
          />
        </SetupStep>
        <SetupStep number={5} title="Персонаж Player 2">
          <CharacterSelector
            playerId="player2"
            value={characters.player2}
            opponentCharacterId={characters.player1}
            onChange={(characterId) => updateCharacter('player2', characterId)}
          />
        </SetupStep>
        <SetupStep number={6} title="Подтверждение готовности">
          <ReadyPanel
            ready={ready}
            onChange={(playerId, value) =>
              setReady((current) => ({ ...current, [playerId]: value }))
            }
          />
        </SetupStep>
        <SetupStep number={7} title="Запуск матча">
          <div className="setup-launch">
            <Link href="/controls" className="button button--secondary">
              Настроить клавиши
            </Link>
            <button
              type="button"
              className="button button--primary button--large"
              disabled={Boolean(validationError)}
              onClick={startMatch}
            >
              FIGHT!
            </button>
          </div>
          {(error || validationError) && (
            <p className="setup-error" role="alert">
              {error || validationError}
            </p>
          )}
        </SetupStep>
      </div>
    </AppShell>
  );
}
