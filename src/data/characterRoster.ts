export type CharacterId = 'zoro' | 'aang' | 'void-walker';

export type CharacterSelection = readonly [CharacterId, CharacterId];

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly displayName: string;
  readonly archetype: string;
  readonly description: string;
  readonly mark: string;
}

export const CHARACTER_ROSTER = [
  {
    id: 'zoro',
    displayName: 'Ророноа Зоро',
    archetype: 'Мечник · ближний бой',
    description:
      'Мастер трёх клинков с быстрыми сериями, сильным давлением и тяжёлыми завершающими ударами.',
    mark: 'Z',
  },
  {
    id: 'aang',
    displayName: 'Аватар Аанг',
    archetype: 'Аватар · контроль стихий',
    description:
      'Быстрый мастер четырёх стихий с превосходным контролем пространства и высоким комбо-потенциалом.',
    mark: 'A',
  },
  {
    id: 'void-walker',
    displayName: 'Странник Пустоты',
    archetype: 'Странник · контроль дистанции',
    description:
      'Воин из разлома, который удерживает дистанцию клинками пустоты и наказывает противника за ошибки.',
    mark: 'V',
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
