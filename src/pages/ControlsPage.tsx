import { ControlGuide } from '../components/controls/ControlGuide';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function ControlsPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Одна клавиатура"
        title="Управление"
        description="Клавиши преобразуются в игровые действия, поэтому раскладку можно будет менять."
      />
      <section className="panel">
        <ControlGuide />
      </section>
    </AppShell>
  );
}
