import { AnimationShowcase } from '../components/characters/AnimationShowcase';
import { MoveSetTable } from '../components/characters/MoveSetTable';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { circleFighters } from '../game/data/characters/circleFighters';
import { CHARACTER_ANIMATION_STATES } from '../game/rendering/animation/AnimationCatalog';

export function VisualStyleGuidePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Художественный прототип · v1"
        title="Visual Style Guide"
        description="Оригинальные процедурные бойцы: крупные формы, мягкий контур, ограниченная палитра и заменяемый скелет без внешних ассетов."
      />

      <section className="style-principles" aria-label="Принципы">
        <Principle value="2D rig" label="части тела управляются кодом" />
        <Principle value={`${CHARACTER_ANIMATION_STATES.length} states`} label="на каждого персонажа" />
        <Principle value="60 Hz" label="фиксированный шаг боя" />
        <Principle value="0 PNG" label="вся графика оригинальная" />
      </section>

      {circleFighters.map((character) => (
        <section className={`style-character style-character--${character.id}`} key={character.id}>
          <header>
            <div>
              <p className="eyebrow">{character.force} · {character.archetype}</p>
              <h2>{character.name}</h2>
              <p>{character.tagline}</p>
            </div>
            <div className="palette-strip" aria-label={`Палитра ${character.name}`}>
              <i style={{ background: character.cssColor }} />
              <i style={{ background: character.accentCss }} />
              <i style={{ background: `#${character.shadowColor.toString(16)}` }} />
              <i style={{ background: '#fff4df' }} />
            </div>
          </header>
          <AnimationShowcase characterId={character.id} />
          <div className="style-character__notes">
            <article>
              <p className="eyebrow">Пассивная механика</p>
              <h3>{character.passiveName}</h3>
              <p>{character.passiveDescription}</p>
            </article>
            <article>
              <p className="eyebrow">Анимационный язык</p>
              <h3>{character.id === 'granite' ? 'Вес и инерция' : 'Ритм и острые дуги'}</h3>
              <p>
                Anticipation, squash &amp; stretch, overlap частей, hit stop, smear и motion trail
                зависят от фазы приёма, а не от набора несвязанных картинок.
              </p>
            </article>
          </div>
          <MoveSetTable character={character} />
        </section>
      ))}
    </AppShell>
  );
}

function Principle({ value, label }: { value: string; label: string }) {
  return (
    <article>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
