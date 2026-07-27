import { AppShell } from '../components/layout/AppShell';
import { MenuOption } from '../components/menu/MenuOption';

const menuItems = [
  {
    title: 'Игрок против игрока',
    description: 'Два игрока, одна клавиатура',
    icon: '⚔',
    href: '/local-pvp',
    primary: true,
  },
  { title: 'Онлайн-бой', description: 'Соперники со всего мира', icon: '◎' },
  { title: 'Игрок против компьютера', description: 'Бой с умным ботом', icon: '◆' },
  { title: 'Кооператив', description: 'Сражайтесь в одной команде', icon: '♣' },
  { title: 'Тренировка', description: 'Отработка приёмов и таймингов', icon: '◉' },
  { title: 'Персонажи', description: 'Познакомиться с бойцами', icon: '●', href: '/characters' },
  { title: 'Управление', description: 'Клавиши обоих игроков', icon: '⌨', href: '/controls' },
  { title: 'Профиль', description: 'Аккаунт и будущая статистика', icon: '☺', href: '/profile' },
] as const;

export function HomePage() {
  return (
    <AppShell>
      <section className="hero">
        <div>
          <p className="eyebrow">Локальная арена для друзей</p>
          <h1>
            Простые круги.
            <br />
            Большое столкновение.
          </h1>
          <p className="hero__description">
            Circle Clash — яркий браузерный файтинг для двух игроков за одной клавиатурой.
          </p>
        </div>
        <div className="hero-fighters" aria-hidden="true">
          <span className="hero-fighter hero-fighter--comet">●</span>
          <span className="hero-versus">VS</span>
          <span className="hero-fighter hero-fighter--pulse">●</span>
        </div>
      </section>

      <section aria-labelledby="choose-mode">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Главное меню</p>
            <h2 id="choose-mode">Выбери режим</h2>
          </div>
          <span className="local-badge">Локальная версия</span>
        </div>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <MenuOption key={item.title} {...item} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
