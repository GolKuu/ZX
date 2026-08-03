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
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
  readonly health: number;
  readonly speed: number;
  readonly damage: number;
  readonly mechanic: string;
}

export const CHARACTER_ROSTER = [
  {
    id: 'mim',
    displayName: 'MIM',
    archetype: 'Иллюзионист · ловушки',
    description:
      'Сценический обманщик в костяной маске: ослепляет Spotlight Snap, цепляет Cane Hook, режет Ribbon Sweep и обрушивает Curtain Drop.',
    mark: 'M',
    isNew: false,
    difficulty: 3,
    health: 72,
    speed: 88,
    damage: 68,
    mechanic: 'Сценические ловушки',
  },
  {
    id: 'glitch',
    displayName: 'GLITCH',
    archetype: 'Сломанный протокол · контроль данных',
    description:
      'Боевой протокол в схемной броне: пробивает Checksum Needle, откатывает Rollback Ram, срезает Packet Scythe и рушит Kernel Drop.',
    mark: 'G',
    isNew: false,
    difficulty: 4,
    health: 62,
    speed: 96,
    damage: 71,
    mechanic: 'Spatial Shift',
  },
  {
    id: 'lucky',
    displayName: 'LUCKY',
    archetype: 'Риск · контроль вероятности',
    description:
      'Стремительный импровизатор: накапливает видимую Удачу точными атаками и тратит её на усиленные маршруты.',
    mark: '♠',
    isNew: true,
    difficulty: 4,
    health: 70,
    speed: 90,
    damage: 76,
    mechanic: 'Управление Удачей',
  },
  {
    id: 'vorgh',
    displayName: 'VORGH',
    archetype: 'Берсерк · давление',
    description:
      'Разумный хищник в разбитой броне: превращает боль в Rage, меняет стойку и рискует восстановлением ради давления.',
    mark: 'V',
    isNew: true,
    difficulty: 3,
    health: 86,
    speed: 74,
    damage: 88,
    mechanic: 'Pain-to-Power Rage',
  },
  {
    id: 'titan',
    displayName: 'TITAN',
    archetype: 'Тяжёлый grappler · бронированный танк',
    description:
      'Индустриальный колосс: выдерживает удар бронёй, ломает защиту и превращает ближнюю дистанцию в цепь захватов.',
    mark: 'T',
    isNew: true,
    difficulty: 2,
    health: 100,
    speed: 48,
    damage: 96,
    mechanic: 'Броня и захваты',
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
