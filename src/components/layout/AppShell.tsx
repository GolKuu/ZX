import { Link } from 'wouter';
import type { ReactNode } from 'react';

export function AppShell({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'app-shell app-shell--compact' : 'app-shell'}>
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Circle Clash — главное меню">
          <span className="brand__mark">CC</span>
          <span>Circle Clash</span>
        </Link>
        <nav className="site-header__nav" aria-label="Основная навигация">
          <Link href="/visual-style-guide">Стиль</Link>
          <Link href="/controls">Управление</Link>
          <Link href="/profile">Профиль</Link>
        </nav>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}
