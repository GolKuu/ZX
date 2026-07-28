import { useLocation } from 'wouter';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import type { TeamMode } from '../game/team/TeamTypes';
import {
  createLocalTeamBattle,
  teamBattleStore,
} from '../stores/teamBattleStore';

const OFFLINE_MODES: Array<{
  mode: Exclude<TeamMode, 'ONLINE_2V2'>;
  title: string;
  description: string;
}> = [
  {
    mode: 'LOCAL_2V2',
    title: 'Локальный 2 на 2',
    description: 'Два состава на одной клавиатуре или геймпадах.',
  },
  {
    mode: 'TWO_PLAYERS_VS_AI',
    title: 'Два игрока против ИИ',
    description: 'Каждый союзник управляет своим бойцом, соперники — ИИ.',
  },
  {
    mode: 'PLAYER_AND_AI_VS_TWO_OPPONENTS',
    title: 'Игрок и ИИ против двух противников',
    description: 'Вашего второго бойца и команду соперника ведёт ИИ.',
  },
];

export function TeamModesPage() {
  const [, navigate] = useLocation();

  function start(mode: Exclude<TeamMode, 'ONLINE_2V2'>) {
    teamBattleStore.set(createLocalTeamBattle(mode));
    navigate('/team-fight');
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Командный бой"
        title="Выберите режим 2 на 2"
        description="В бою активен один персонаж команды. Вызывайте союзника, меняйтесь местами и берегите обоих бойцов."
      />
      <section className="menu-grid" aria-label="Командные режимы">
        {OFFLINE_MODES.map((item) => (
          <button
            key={item.mode}
            type="button"
            className="menu-option"
            onClick={() => start(item.mode)}
          >
            <span className="menu-option__icon" aria-hidden="true">2×2</span>
            <span className="menu-option__copy">
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </span>
            <span className="menu-option__arrow" aria-hidden="true">→</span>
          </button>
        ))}
        <button
          type="button"
          className="menu-option menu-option--primary"
          onClick={() => navigate('/online')}
        >
          <span className="menu-option__icon" aria-hidden="true">◎</span>
          <span className="menu-option__copy">
            <strong>Онлайн 2 на 2</strong>
            <small>Авторитетный сервер проверяет помощь, смены и cooldown.</small>
          </span>
          <span className="menu-option__arrow" aria-hidden="true">→</span>
        </button>
      </section>
    </AppShell>
  );
}
