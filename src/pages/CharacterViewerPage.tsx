import { useState } from 'react';
import { AnimationShowcase } from '../components/characters/AnimationShowcase';
import { CharacterPortrait } from '../components/characters/CharacterPortrait';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import {
  circleFighters,
  getCharacter,
  type CharacterId,
} from '../game/data/characters/circleFighters';

export function CharacterViewerPage() {
  const [characterId, setCharacterId] = useState<CharacterId>('granite');
  const character = getCharacter(characterId);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Art Lab · Character Viewer"
        title="Ключевые позы"
        description="Проверьте силуэт каждого бойца в движении: крупная форма остаётся понятной даже без мелких деталей."
      />
      <div className="viewer-roster" role="list" aria-label="Выбор персонажа">
        {circleFighters.map((fighter) => (
          <button
            type="button"
            className={fighter.id === characterId ? 'viewer-roster__item viewer-roster__item--active' : 'viewer-roster__item'}
            key={fighter.id}
            onClick={() => setCharacterId(fighter.id)}
            aria-pressed={fighter.id === characterId}
          >
            <CharacterPortrait character={fighter} />
            <span>{fighter.name}</span>
          </button>
        ))}
      </div>
      <section className="character-viewer">
        <header>
          <div>
            <p className="eyebrow">{character.force} · {character.archetype}</p>
            <h2>{character.name}</h2>
            <p>{character.tagline}</p>
          </div>
          <dl className="viewer-stats">
            <div><dt>Сложность</dt><dd>{character.difficulty}/5</dd></div>
            <div><dt>Дальность</dt><dd>{character.stats.range}/5</dd></div>
            <div><dt>Здоровье</dt><dd>{character.stats.maxHealth}</dd></div>
          </dl>
        </header>
        <AnimationShowcase characterId={characterId} />
        <footer>
          <strong>{character.passiveName}</strong>
          <p>{character.passiveDescription}</p>
        </footer>
      </section>
    </AppShell>
  );
}
