import { CombinationGuide } from '../components/controls/CombinationGuide';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { DefenseTrainingGuide } from '../components/training/DefenseTrainingGuide';

export function TrainingPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Защитная тренировка"
        title="Тренировка"
        description="Окна блока, Combo Escape и защитные ресурсы без скрытых правил."
      />
      <DefenseTrainingGuide />
      <CombinationGuide />
    </AppShell>
  );
}
