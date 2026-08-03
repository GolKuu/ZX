export type ArenaId = 'null-circle' | 'storm-dome' | 'ruined-megacity';

export interface ArenaDefinition {
  readonly id: ArenaId;
  readonly name: string;
  readonly theme: string;
  readonly note: string;
  readonly performance: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly background: string;
  readonly fog: string;
}

export const ARENAS: readonly ArenaDefinition[] = [
  {
    id: 'null-circle',
    name: 'NULL CIRCLE',
    theme: 'Тёмный турнирный разлом',
    note: 'Нейтральная арена без опасностей. Лучший выбор для обучения.',
    performance: 'LOW',
    background: '#07061d',
    fog: '#10082c',
  },
  {
    id: 'storm-dome',
    name: 'STORM DOME',
    theme: 'Грозовой реактор',
    note: 'Дальний шторм отмечает края площадки; механика боя не меняется.',
    performance: 'MEDIUM',
    background: '#06121b',
    fog: '#0a2430',
  },
  {
    id: 'ruined-megacity',
    name: 'RUINED MEGACITY',
    theme: 'Затопленный мегаполис',
    note: 'Спокойный фон с максимальным контрастом силуэтов бойцов.',
    performance: 'LOW',
    background: '#100b12',
    fog: '#251522',
  },
];

export const DEFAULT_ARENA: ArenaId = 'null-circle';

export function getArenaDefinition(id: ArenaId): ArenaDefinition {
  return ARENAS.find((arena) => arena.id === id) ?? ARENAS[0]!;
}
