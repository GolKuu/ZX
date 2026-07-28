export const ARENA_IDS = [
  'quiet-canopy',
  'moon-nursery',
  'paper-harbor',
] as const;

export type ArenaId = (typeof ARENA_IDS)[number];

export type ArenaDefinition = {
  id: ArenaId;
  name: string;
  mood: string;
  accent: string;
  surface: string;
};

export const arenaCatalog: readonly ArenaDefinition[] = [
  {
    id: 'quiet-canopy',
    name: 'Тихая крона',
    mood: 'Сад на вершине тёплых облаков',
    accent: '#ffb95a',
    surface: '#546475',
  },
  {
    id: 'moon-nursery',
    name: 'Лунный питомник',
    mood: 'Ночная оранжерея со светящимися семенами',
    accent: '#75e0ce',
    surface: '#394b63',
  },
  {
    id: 'paper-harbor',
    name: 'Бумажная гавань',
    mood: 'Складные паруса над спокойной водой',
    accent: '#ff7185',
    surface: '#4c526d',
  },
];

export function normalizeArenaId(value: unknown): ArenaId {
  return ARENA_IDS.includes(value as ArenaId)
    ? value as ArenaId
    : 'quiet-canopy';
}

export function getArena(arenaId: ArenaId) {
  return arenaCatalog.find((arena) => arena.id === arenaId) ?? arenaCatalog[0];
}
