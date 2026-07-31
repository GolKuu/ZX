export type CharacterId =
  | 'mim'
  | 'glitch'
  | 'lucky'
  | 'vorgh'
  | 'titan';

export type CharacterSelection = readonly [CharacterId, CharacterId];

export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly displayName: string;
  readonly archetype: string;
  readonly description: string;
  readonly mark: string;
  readonly isNew: boolean;
}

export const CHARACTER_ROSTER = [
  {
    id: 'mim',
    displayName: 'MIM',
    archetype: 'Тролль · ловушки',
    description:
      'Минималистичный боец в худи: щёлкает пальцами, роняет курсор, пинает банан и раскручивает кресло.',
    mark: 'M',
    isNew: false,
  },
  {
    id: 'glitch',
    displayName: 'GLITCH',
    archetype: 'Баг игры · искажение данных',
    description:
      'Сломанный боец из повреждённого билда: колет пикселями, телепортируется и выбрасывает кубы ошибок.',
    mark: 'G',
    isNew: false,
  },
  {
    id: 'lucky',
    displayName: 'LUCKY',
    archetype: 'Риск · контроль вероятности',
    description:
      'Стремительный импровизатор: накапливает видимую Удачу точными атаками и тратит её на усиленные маршруты.',
    mark: '♠',
    isNew: true,
  },
  {
    id: 'vorgh',
    displayName: 'VORGH',
    archetype: 'Берсерк · давление',
    description:
      'Разумный хищник в разбитой броне: превращает боль в Rage, меняет стойку и рискует восстановлением ради давления.',
    mark: 'V',
    isNew: true,
  },
  {
    id: 'titan',
    displayName: 'TITAN',
    archetype: 'Тяжёлый grappler · бронированный танк',
    description:
      'Индустриальный колосс: выдерживает удар бронёй, ломает защиту и превращает ближнюю дистанцию в цепь захватов.',
    mark: 'T',
    isNew: true,
  },
] as const satisfies readonly CharacterDefinition[];

export const DEFAULT_CHARACTER_SELECTION: CharacterSelection = [
  'mim',
  'glitch',
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
