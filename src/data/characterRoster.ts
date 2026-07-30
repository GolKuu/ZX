export type CharacterId =
  | 'mim'
  | 'echo'
  | 'idol'
  | 'glitch'
  | 'chrono';

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
    id: 'mim',
    displayName: 'MIM',
    archetype: 'Тролль · ловушки',
    description:
      'Минималистичный боец в худи: щёлкает пальцами, роняет курсор, пинает банан и раскручивает кресло.',
    mark: 'M',
  },
  {
    id: 'echo',
    displayName: 'ECHO',
    archetype: 'Предвидение · адаптация',
    description:
      'Считывает соперника и отвечает точными ударами: быстрым джебом, выпадом, подсечкой и прямым пинком.',
    mark: 'E',
  },
  {
    id: 'glitch',
    displayName: 'GLITCH',
    archetype: 'Баг игры · искажение данных',
    description:
      'Сломанный боец из повреждённого билда: колет пикселями, телепортируется и выбрасывает кубы ошибок.',
    mark: 'G',
  },
  {
    id: 'idol',
    displayName: 'IDOL',
    archetype: 'Перформер · сила аудитории',
    description:
      'Боевая поп-звезда: колет микрофоном, скользит по арене и завершает серию звёздным вращением.',
    mark: '★',
  },
  {
    id: 'chrono',
    displayName: 'CHRONO',
    archetype: 'Хроно-боец · власть времени',
    description:
      'Управляет темпом боя: атакует из будущего, рассекает временной волной и наказывает точными подсечками.',
    mark: 'C',
  },
] as const satisfies readonly CharacterDefinition[];

export const DEFAULT_CHARACTER_SELECTION: CharacterSelection = [
  'idol',
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
