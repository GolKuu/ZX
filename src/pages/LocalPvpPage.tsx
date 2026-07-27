import { Link } from 'wouter';
import { ControlGuide } from '../components/controls/ControlGuide';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function LocalPvpPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Доступно сейчас"
        title="Локальный PvP"
        description="Позови друга: каждый управляет своим бойцом на одной клавиатуре."
      />
      <div className="two-column">
        <section className="panel panel--accent">
          <p className="eyebrow">Быстрый старт</p>
          <h2>Комета против Импульса</h2>
          <p>Первый рабочий бой: движение, прыжок, лёгкий удар, блок и пауза.</p>
          <Link href="/fight" className="button button--primary button--large">
            Начать бой
          </Link>
        </section>
        <section className="panel">
          <h2>Управление</h2>
          <ControlGuide />
        </section>
      </div>
    </AppShell>
  );
}
