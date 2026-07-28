import { Link } from 'wouter';
import { CharacterArt } from '../components/characters/CharacterArt';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { circleFighters } from '../game/data/characters/circleFighters';

export function CharactersPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Первый оригинальный состав"
        title="Персонажи"
        description="Два нечеловеческих бойца с цельными силуэтами, разным темпом и полными наборами приёмов."
      />
      <div className="character-grid">
        {circleFighters.map((fighter) => (
          <article className={`character-card character-card--${fighter.id}`} key={fighter.id}>
            <div className="character-card__art">
              <CharacterArt characterId={fighter.id} />
            </div>
            <div>
              <p className="eyebrow">{fighter.force} · {fighter.archetype}</p>
              <h2>{fighter.name}</h2>
              <p>{fighter.tagline}</p>
              <strong>{fighter.passiveName}</strong>
            </div>
          </article>
        ))}
      </div>
      <Link href="/visual-style-guide" className="button button--primary character-guide-link">
        Открыть visual-style-guide
      </Link>
    </AppShell>
  );
}
