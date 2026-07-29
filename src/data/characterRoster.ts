export type CharacterId =
  | 'zoro'
  | 'aang'
  | 'void-walker'
  | 'velocity-king'
  | 'elastic-brawler';

export type CharacterSelection = readonly [CharacterId, CharacterId];

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly displayName: string;
  readonly archetype: string;
  readonly description: string;
  readonly mark: string;
}

/**
 * The five original roster slots.
 *
 * Ids stay as they are — `zoro` and `aang` are wired through the render, AI and
 * HUD layers, and renaming them buys nothing. The *display* names are what
 * ships, and those are original, per the standing constraint that this universe
 * carries no copyrighted characters.
 */
export const CHARACTER_ROSTER = [
  {
    id: 'zoro',
    displayName: 'Клинковый Призрак',
    archetype: 'Мечник · ближний бой',
    description:
      'Мастер трёх клинков с быстрыми сериями, сильным давлением и тяжёлыми завершающими ударами.',
    mark: 'B',
  },
  {
    id: 'aang',
    displayName: 'Мудрец Стихий',
    archetype: 'Мудрец · контроль стихий',
    description:
      'Быстрый мастер четырёх стихий с превосходным контролем пространства и высоким комбо-потенциалом.',
    mark: 'E',
  },
  {
    id: 'void-walker',
    displayName: 'Странник Пустоты',
    archetype: 'Странник · контроль дистанции',
    description:
      'Воин из разлома, который удерживает дистанцию клинками пустоты и наказывает противника за ошибки.',
    mark: 'V',
  },
  {
    id: 'velocity-king',
    displayName: 'Владыка Скорости',
    archetype: 'Раш · фрейм-трап',
    description:
      'Давит без остановки: мгновенный рывок, командный бросок и пассивка, сокращающая восстановление за каждый стак.',
    mark: 'K',
  },
  {
    id: 'elastic-brawler',
    displayName: 'Упругий Боец',
    archetype: 'Средняя дистанция · стойки',
    description:
      'Тянущиеся удары со средней дистанции и переключение передач: вторая даёт скорость, четвёртая — гипер-броню.',
    mark: 'T',
  },
] as const satisfies readonly CharacterDefinition[];

export const DEFAULT_CHARACTER_SELECTION: CharacterSelection = [
  'zoro',
  'void-walker',
];

export function getCharacterDefinition(
  characterId: CharacterId,
): CharacterDefinition {
  const character = CHARACTER_ROSTER.find(({ id }) => id === characterId);
  if (character === undefined) {
    throw new Error(`Unknown character "${characterId}"`);
  }
  return character;
}
