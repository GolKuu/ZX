export type CharacterDefinition = {
  id: string;
  name: string;
  tagline: string;
  color: number;
  cssColor: string;
};

export const circleFighters: readonly CharacterDefinition[] = [
  {
    id: 'comet',
    name: 'Комета',
    tagline: 'Быстрая, смелая и всегда идёт вперёд.',
    color: 0xff5d73,
    cssColor: '#ff5d73',
  },
  {
    id: 'pulse',
    name: 'Импульс',
    tagline: 'Спокойный защитник с точным ответом.',
    color: 0x3fd1c4,
    cssColor: '#3fd1c4',
  },
];
