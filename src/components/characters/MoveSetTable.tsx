import { getCharacterAttacks } from '../../game/data/attacks/temporaryCharacterAttacks';
import type { CharacterDefinition } from '../../game/data/characters/circleFighters';

export function MoveSetTable({ character }: { character: CharacterDefinition }) {
  const set = getCharacterAttacks(character.id);
  const groups = [
    ['Лёгкие', set.lightChain],
    ['Тяжёлые', set.heavy],
    ['Низкие', [set.low, set.lowHeavy]],
    ['Воздушные', [set.air, set.airHeavy]],
    ['Специальные', [set.special, set.forwardSpecial, set.retreatSpecial]],
    ['Усиление и супер', [set.enhancedSpecial, set.superAttack]],
    ['Захваты', [set.grab, set.forwardThrow, set.backThrow]],
    ['Возврат', [set.reversal]],
  ] as const;

  return (
    <div className="moveset-table">
      {groups.map(([label, attacks]) => (
        <section key={label}>
          <h3>{label}</h3>
          <div>
            {attacks.map((attack) => (
              <article key={attack.id}>
                <strong>{attack.name}</strong>
                <span>{attack.damage} урон</span>
                <small>
                  {attack.startupFrames} / {attack.activeFrames} / {attack.recoveryFrames}
                </small>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
