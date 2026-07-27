import { Link } from 'wouter';
import { AppShell } from '../components/layout/AppShell';

export function NotFoundPage() {
  return (
    <AppShell compact>
      <section className="center-card">
        <span className="center-card__icon">?</span>
        <p className="eyebrow">Ошибка 404</p>
        <h1>Эта арена не найдена</h1>
        <p>Вернись в главное меню и выбери доступный режим.</p>
        <Link href="/" className="button button--primary">
          В главное меню
        </Link>
      </section>
    </AppShell>
  );
}
