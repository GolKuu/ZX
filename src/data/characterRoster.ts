export type CharacterId = 'mim' | 'glitch' | 'lucky' | 'vorgh' | 'titan';
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
  readonly impactArmour: number;
  readonly mechanic: string;
}

export const CHARACTER_ROSTER = [
  {
    id: 'mim', displayName: 'MIM', archetype: 'Иллюзионист · ловушки',
    description: 'Сценический обманщик в костяной маске. Ослепляет, цепляет тростью и меняет темп боя хитрыми ловушками.',
    mark: 'M', isNew: false, difficulty: 3, health: 72, speed: 88, damage: 68, impactArmour: 118,
    mechanic: 'Сценические ловушки',
  },
  {
    id: 'glitch', displayName: 'GLITCH', archetype: 'Сломанный протокол · контроль',
    description: 'Боевой протокол в схемной броне. Смещается между кадрами, откатывает ошибки и ломает привычные дистанции.',
    mark: 'G', isNew: false, difficulty: 4, health: 62, speed: 96, damage: 71, impactArmour: 108,
    mechanic: 'Сдвиг пространства',
  },
  {
    id: 'lucky', displayName: 'LUCKY', archetype: 'Риск · вероятность',
    description: 'Стремительный импровизатор. Копит удачу точными атаками и тратит её на усиленные маршруты и неожиданные развязки.',
    mark: '♠', isNew: true, difficulty: 4, health: 70, speed: 90, damage: 76, impactArmour: 112,
    mechanic: 'Управление удачей',
  },
  {
    id: 'vorgh', displayName: 'VORGH', archetype: 'Берсерк · давление',
    description: 'Разумный хищник в разбитой броне. Превращает полученный урон в ярость и становится опаснее с каждой секундой.',
    mark: 'V', isNew: true, difficulty: 3, health: 86, speed: 74, damage: 88, impactArmour: 128,
    mechanic: 'Ярость из боли',
  },
  {
    id: 'titan', displayName: 'TITAN', archetype: 'Тяжёлый боец · захваты',
    description: 'Индустриальный колосс. Выдерживает удар бронёй, ломает защиту и превращает ближнюю дистанцию в цепь захватов.',
    mark: 'T', isNew: true, difficulty: 2, health: 100, speed: 48, damage: 96, impactArmour: 150,
    mechanic: 'Броня и захваты',
  },
] as const satisfies readonly CharacterDefinition[];

export const DEFAULT_CHARACTER_SELECTION: CharacterSelection = ['mim', 'glitch'];

export function getCharacterDefinition(characterId: CharacterId): CharacterDefinition {
  const character = CHARACTER_ROSTER.find(({ id }) => id === characterId);
  if (character === undefined) throw new Error(`Unknown character "${characterId}"`);
  return character;
}
