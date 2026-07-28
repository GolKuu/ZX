import { DevelopmentNotice } from '../components/game/DevelopmentNotice';
import { CombinationGuide } from '../components/controls/CombinationGuide';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function TrainingPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Будущий режим"
        title="Тренировка"
        description="Безопасная площадка для изучения управления и кадровых данных."
      />
      <DevelopmentNotice>
        Режим появится после стабилизации базового локального боя.
      </DevelopmentNotice>
      <CombinationGuide />
    </AppShell>
  );
}
