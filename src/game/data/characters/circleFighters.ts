export type CharacterDefinition = {
  id: string;
  name: string;
  tagline: string;
  color: number;
  cssColor: string;
  accentColor: number;
  visualKind: 'comet' | 'pulse';
};

export const circleFighters: readonly CharacterDefinition[] = [
  {
    id: 'comet',
    name: 'Комета',
    tagline: 'Быстрая, смелая и всегда идёт вперёд.',
    color: 0xff5d73,
    cssColor: '#ff5d73',
    accentColor: 0xffdc62,
    visualKind: 'comet',
  },
  {
    id: 'pulse',
    name: 'Импульс',
    tagline: 'Спокойный защитник с точным ответом.',
    color: 0x3fd1c4,
    cssColor: '#3fd1c4',
    accentColor: 0x7557ff,
    visualKind: 'pulse',
  },
];
