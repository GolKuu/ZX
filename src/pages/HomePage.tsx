import { AppShell } from '../components/layout/AppShell';
import { MenuOption } from '../components/menu/MenuOption';
import { CharacterArt } from '../components/characters/CharacterArt';

const menuItems = [
  {
    title: 'Локальный 2 на 2',
    description: 'Две команды и смена активного бойца',
    icon: '⚔',
    href: '/team-modes',
    primary: true,
  },
  {
    title: 'Онлайн 1 на 1',
    description: 'Приватный бой по ссылке на авторитетном сервере',
    icon: '◎',
    href: '/online',
  },
  {
    title: 'Игрок против ИИ',
    description: 'Одиночный бой с локальным компьютерным соперником',
    icon: '◎',
    href: '/vs-ai',
  },
  {
    title: 'Два игрока против ИИ',
    description: 'Два союзника против команды ботов',
    icon: '◆',
    href: '/team-modes',
  },
  {
    title: 'Игрок и ИИ против двух',
    description: 'ИИ управляет союзником и соперниками',
    icon: '♣',
    href: '/team-modes',
  },
  { title: 'Тренировка', description: 'Отработка приёмов и таймингов', icon: '◉' },
  { title: 'Персонажи', description: 'Познакомиться с бойцами', icon: '●', href: '/characters' },
  { title: 'Visual Style Guide', description: 'Анимации, палитры и приёмы', icon: '✦', href: '/visual-style-guide' },
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
            Два характера.
            <br />
            Одно столкновение.
          </h1>
          <p className="hero__description">
            Circle Clash — оригинальный браузерный файтинг про камень, ножницы и точный тайминг.
          </p>
        </div>
        <div className="hero-fighters" aria-hidden="true">
          <CharacterArt characterId="granite" />
          <span className="hero-versus">VS</span>
          <CharacterArt characterId="shira" />
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
