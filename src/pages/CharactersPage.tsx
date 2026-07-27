import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { circleFighters } from '../game/data/characters/circleFighters';

export function CharactersPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Первый состав"
        title="Персонажи"
        description="Для каркаса доступны только два оригинальных временных бойца."
      />
      <div className="character-grid">
        {circleFighters.map((fighter) => (
          <article className="character-card" key={fighter.id}>
            <span className="character-card__portrait" style={{ background: fighter.cssColor }}>
              ●
            </span>
            <div>
              <p className="eyebrow">Временный боец</p>
              <h2>{fighter.name}</h2>
              <p>{fighter.tagline}</p>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
