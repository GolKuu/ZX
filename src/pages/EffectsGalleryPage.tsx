import { useState } from 'react';
import { EffectPreview, ParticlePreview, type GalleryEffect } from '../components/art/EffectPreview';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { settingsStore, type EffectLevel } from '../stores/settingsStore';

const EFFECTS: ReadonlyArray<{ id: GalleryEffect; title: string; copy: string }> = [
  { id: 'arc', title: 'Широкая дуга', copy: 'Толстый внешний контур показывает дальность замаха.' },
  { id: 'projectile', title: 'Снаряд', copy: 'Светлое ядро и короткий хвост читаются на любой арене.' },
  { id: 'impact', title: 'Попадание', copy: 'Крупная звезда фиксирует момент удара без визуального шума.' },
  { id: 'block', title: 'Защита', copy: 'Два кольца отделяют успешный блок от атаки.' },
  { id: 'trail', title: 'След движения', copy: 'Полупрозрачные формы подчёркивают скорость и направление.' },
];

const LEVEL_LABELS: Record<EffectLevel, string> = {
  0: 'Выключено',
  1: 'Мало',
  2: 'Средне',
  3: 'Много',
};

export function EffectsGalleryPage() {
  const [level, setLevel] = useState<EffectLevel>(() => settingsStore.load().bloodLevel);
  const [saved, setSaved] = useState(false);

  function choose(next: EffectLevel) {
    setLevel(next);
    setSaved(false);
    settingsStore.save({ ...settingsStore.load(), bloodLevel: next });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Art Lab · Effects Gallery"
        title="Атака видна сразу"
        description="Эффекты показывают направление, силу и момент контакта. Они яркие, короткие и не закрывают ключевую позу."
      />
      <section className="effects-grid" aria-label="Галерея боевых эффектов">
        {EFFECTS.map((effect) => (
          <article className="effect-card" key={effect.id}>
            <EffectPreview effect={effect.id} />
            <h2>{effect.title}</h2>
            <p>{effect.copy}</p>
          </article>
        ))}
      </section>
      <section className="particle-lab">
        <div>
          <p className="eyebrow">Частицы попадания</p>
          <h2>{LEVEL_LABELS[level]}</h2>
          <p>
            Только абстрактные мультяшные капли и искры: без органов, ран и фотореализма.
            Пул ограничен 36 объектами, повторно использует их и плавно гасит.
          </p>
          <div className="particle-levels" aria-label="Количество частиц">
            {([0, 1, 2, 3] as const).map((item) => (
              <button
                type="button"
                key={item}
                className={item === level ? 'state-chip state-chip--active' : 'state-chip'}
                onClick={() => choose(item)}
                aria-pressed={item === level}
              >
                {LEVEL_LABELS[item]}
              </button>
            ))}
          </div>
          {saved && <p className="viewer-message" role="status">Настройка сохранена.</p>}
        </div>
        <ParticlePreview level={level} />
      </section>
    </AppShell>
  );
}
