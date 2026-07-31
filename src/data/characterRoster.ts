export type CharacterId =
  | 'mim'
  | 'echo'
  | 'glitch'
  | 'chrono'
  | 'lucky'
  | 'vorgh';

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
    archetype: 'РўСЂРѕР»Р»СЊ В· Р»РѕРІСѓС€РєРё',
    description:
      'РњРёРЅРёРјР°Р»РёСЃС‚РёС‡РЅС‹Р№ Р±РѕРµС† РІ С…СѓРґРё: С‰С‘Р»РєР°РµС‚ РїР°Р»СЊС†Р°РјРё, СЂРѕРЅСЏРµС‚ РєСѓСЂСЃРѕСЂ, РїРёРЅР°РµС‚ Р±Р°РЅР°РЅ Рё СЂР°СЃРєСЂСѓС‡РёРІР°РµС‚ РєСЂРµСЃР»Рѕ.',
    mark: 'M',
  },
  {
    id: 'echo',
    displayName: 'ECHO',
    archetype: 'РџСЂРµРґРІРёРґРµРЅРёРµ В· Р°РґР°РїС‚Р°С†РёСЏ',
    description:
      'РЎС‡РёС‚С‹РІР°РµС‚ СЃРѕРїРµСЂРЅРёРєР° Рё РѕС‚РІРµС‡Р°РµС‚ С‚РѕС‡РЅС‹РјРё СѓРґР°СЂР°РјРё: Р±С‹СЃС‚СЂС‹Рј РґР¶РµР±РѕРј, РІС‹РїР°РґРѕРј, РїРѕРґСЃРµС‡РєРѕР№ Рё РїСЂСЏРјС‹Рј РїРёРЅРєРѕРј.',
    mark: 'E',
  },
  {
    id: 'glitch',
    displayName: 'GLITCH',
    archetype: 'Р‘Р°Рі РёРіСЂС‹ В· РёСЃРєР°Р¶РµРЅРёРµ РґР°РЅРЅС‹С…',
    description:
      'РЎР»РѕРјР°РЅРЅС‹Р№ Р±РѕРµС† РёР· РїРѕРІСЂРµР¶РґС‘РЅРЅРѕРіРѕ Р±РёР»РґР°: РєРѕР»РµС‚ РїРёРєСЃРµР»СЏРјРё, С‚РµР»РµРїРѕСЂС‚РёСЂСѓРµС‚СЃСЏ Рё РІС‹Р±СЂР°СЃС‹РІР°РµС‚ РєСѓР±С‹ РѕС€РёР±РѕРє.',
    mark: 'G',
  },

  {
    id: 'chrono',
    displayName: 'CHRONO',
    archetype: 'РҐСЂРѕРЅРѕ-Р±РѕРµС† В· РІР»Р°СЃС‚СЊ РІСЂРµРјРµРЅРё',
    description:
      'РЈРїСЂР°РІР»СЏРµС‚ С‚РµРјРїРѕРј Р±РѕСЏ: Р°С‚Р°РєСѓРµС‚ РёР· Р±СѓРґСѓС‰РµРіРѕ, СЂР°СЃСЃРµРєР°РµС‚ РІСЂРµРјРµРЅРЅРѕР№ РІРѕР»РЅРѕР№ Рё РЅР°РєР°Р·С‹РІР°РµС‚ С‚РѕС‡РЅС‹РјРё РїРѕРґСЃРµС‡РєР°РјРё.',
    mark: 'C',
  },
  {
    id: 'lucky',
    displayName: 'LUCKY',
    archetype: 'Риск · контроль вероятности',
    description:
      'Стремительный импровизатор: накапливает видимую Удачу точными атаками и тратит её на усиленные маршруты без скрытых случайных побед.',
    mark: '♠',
  },
  {
    id: 'vorgh',
    displayName: 'VORGH',
    archetype: 'Берсерк · давление',
    description:
      'Разумный хищник в разбитой броне: превращает боль в Rage, меняет стойку и рискует восстановлением ради давления.',
    mark: 'V',
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

