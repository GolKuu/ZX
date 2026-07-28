import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CharacterSelector } from '../components/game/CharacterSelector';
import { AiDifficultySelector } from '../components/game/AiDifficultySelector';
import { SetupStep } from '../components/game/SetupStep';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { ControlStorage } from '../game/input/ControlStorage';
import { createMatchConfig, localPvpStore } from '../stores/localPvpStore';
import type { AiDifficulty } from '../game/ai/AiDifficulty';

const storage = new ControlStorage();
const keyboardDevice = { kind: 'keyboard', id: 'keyboard' } as const;

export function AiFightSetupPage() {
  const [, navigate] = useLocation();
  const [profiles] = useState(() => storage.load());
  const [characters, setCharacters] = useState({
    player1: 'granite',
    player2: 'shira',
  });
  const [difficulty, setDifficulty] = useState<AiDifficulty>('EASY');

  function choose(playerId: 'player1' | 'player2', characterId: string) {
    setCharacters((current) => ({ ...current, [playerId]: characterId }));
  }

  function startFight() {
    const config = createMatchConfig(
      { player1: keyboardDevice, player2: keyboardDevice },
      profiles,
      characters,
      { player1: true, player2: true },
    );
    localPvpStore.set({
      ...config,
      aiPlayerId: 'player2',
      aiDifficulty: difficulty,
    });
    navigate('/fight');
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Одиночный режим"
        title="Игрок против ИИ"
        description="Выберите двух бойцов. Вы управляете Player 1, соперником управляет локальный ИИ."
      />
      <div className="setup-flow setup-flow--ai">
        <SetupStep number={1} title="Ваш боец">
          <CharacterSelector
            playerId="player1"
            label="Игрок"
            value={characters.player1}
            opponentCharacterId={characters.player2}
            onChange={(characterId) => choose('player1', characterId)}
          />
        </SetupStep>
        <SetupStep number={2} title="Боец соперника">
          <CharacterSelector
            playerId="player2"
            label="ИИ"
            value={characters.player2}
            opponentCharacterId={characters.player1}
            onChange={(characterId) => choose('player2', characterId)}
          />
        </SetupStep>
        <SetupStep
          number={3}
          title="Уровень силы"
          description="Лёгкий уровень сохраняет поведение нынешнего ИИ."
        >
          <AiDifficultySelector value={difficulty} onChange={setDifficulty} />
        </SetupStep>
        <SetupStep
          number={4}
          title="Запуск боя"
          description="ИИ двигается, атакует и защищается без подключения к серверу."
        >
          <div className="setup-launch">
            <Link href="/controls" className="button button--secondary">
              Управление
            </Link>
            <button
              type="button"
              className="button button--primary button--large"
              onClick={startFight}
            >
              Бой против ИИ
            </button>
          </div>
        </SetupStep>
      </div>
    </AppShell>
  );
}
