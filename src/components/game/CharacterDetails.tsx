import { CharacterPortrait } from '../characters/CharacterPortrait';
import { getCharacter } from '../../game/data/characters/circleFighters';
import { characterMatchup } from '../../game/data/forceMatchups';
import { getCharacterAttacks } from '../../game/data/attacks/characterAttacks';

const difficultyLabels = ['Новичок', 'Легко', 'Средне', 'Сложно', 'Эксперт'];

export function CharacterDetails({
  characterId,
  opponentCharacterId,
}: {
  characterId: string;
  opponentCharacterId: string;
}) {
  const character = getCharacter(characterId);
  const matchup = characterMatchup(characterId, opponentCharacterId);
  const attacks = getCharacterAttacks(characterId);

  return (
    <article className="fighter-details">
      <header>
        <CharacterPortrait character={character} large />
        <div>
          <p className="eyebrow">{character.force} · {character.archetype}</p>
          <h3>{character.name}</h3>
          <span>Сложность: {difficultyLabels[character.difficulty - 1]}</span>
        </div>
      </header>
      <p>{character.tagline}</p>
      <dl className="fighter-details__stats">
        <Stat label="Здоровье" value={`${character.stats.maxHealth}`} />
        <Stat label="Скорость" value={`${character.stats.walkSpeed}`} />
        <Stat label="Дальность" value={`${character.stats.range}/5`} />
      </dl>
      <section>
        <strong>{character.passiveName}</strong>
        <p>{character.passiveDescription}</p>
        <small>
          Ресурс: {character.uniqueResource.name} · {character.uniqueResource.description}
          {character.uniqueResource.status === 'prototype' && ' · механика запланирована'}
        </small>
      </section>
      <section className="fighter-details__moves" aria-label="Фирменные атаки">
        <span><b>Рука</b>{attacks.lightChain[0].name}</span>
        <span><b>Нога</b>{attacks.lightChain[1].name}</span>
        <span><b>Сила</b>{attacks.special.name}</span>
      </section>
      <div className="fighter-details__traits">
        <TraitList title="Сильные стороны" items={character.strengths} />
        <TraitList title="Слабые стороны" items={character.weaknesses} />
      </div>
      <MatchupInfo
        relation={matchup.relation}
        opponentName={matchup.opponent.name}
        opponentForce={matchup.opponent.force}
      />
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function TraitList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section>
      <strong>{title}</strong>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function MatchupInfo({
  relation,
  opponentName,
  opponentForce,
}: {
  relation: 'ADVANTAGE' | 'DISADVANTAGE' | 'NEUTRAL';
  opponentName: string;
  opponentForce: string;
}) {
  const copy = relation === 'ADVANTAGE'
    ? `Преимущество против ${opponentName}: +4% урона, +5% энергии, +5% урона блоку.`
    : relation === 'DISADVANTAGE'
      ? `${opponentName} имеет преимущество. Прямых штрафов у вас нет.`
      : `Нейтральный матч сил ${opponentForce}. Бонусов и штрафов нет.`;
  return (
    <p className={`matchup-info matchup-info--${relation.toLowerCase()}`}>
      <strong>{relation}</strong> {copy}
    </p>
  );
}
