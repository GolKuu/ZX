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
    displayName: 'Roronoa Zoro',
    archetype: 'Мечник · ближний бой',
    description:
      'Точный боец с тремя клинками, быстрыми сериями и сильным давлением вблизи.',
    mark: 'Z',
  },
  {
    id: 'aang',
    displayName: 'Avatar Aang',
    archetype: 'Аватар · контроль стихий',
    description:
      'Быстрый и мобильный мастер четырёх стихий с сильным контролем пространства и высоким комбо-потенциалом.',
    mark: 'A',
  },
  {
    id: 'void-walker',
    displayName: 'Void Walker',
    archetype: 'Странник · контроль',
    description:
      'Таинственный воин пустоты, который держит дистанцию и наказывает за ошибки.',
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
