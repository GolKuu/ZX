import { CHARACTER_ANIMATION_STATES } from '../../rendering/animation/AnimationCatalog';

export type CharacterStats = {
  maxHealth: number;
  walkSpeed: number;
  airMoveSpeed: number;
  dashSpeed: number;
  dashTicks: number;
  jumpSpeed: number;
};

export type CharacterDefinition = {
  id: 'granite' | 'shira';
  name: string;
  force: string;
  archetype: string;
  tagline: string;
  passiveName: string;
  passiveDescription: string;
  color: number;
  cssColor: string;
  accentColor: number;
  accentCss: string;
  shadowColor: number;
  visualKind: 'granite' | 'shira';
  stats: CharacterStats;
  animationStates: typeof CHARACTER_ANIMATION_STATES;
};

export const circleFighters: readonly CharacterDefinition[] = [
  {
    id: 'granite',
    name: 'Гранит',
    force: 'Камень',
    archetype: 'Тяжёлый защитник',
    tagline: 'Держит центр арены, переживает натиск и отвечает одним весомым ударом.',
    passiveName: 'Каменная броня',
    passiveDescription: 'Три пластины снижают урон и гасят реакцию от лёгких попаданий.',
    color: 0x596273,
    cssColor: '#596273',
    accentColor: 0xe9a84a,
    accentCss: '#e9a84a',
    shadowColor: 0x252b38,
    visualKind: 'granite',
    stats: {
      maxHealth: 132,
      walkSpeed: 178,
      airMoveSpeed: 230,
      dashSpeed: 420,
      dashTicks: 13,
      jumpSpeed: 650,
    },
    animationStates: CHARACTER_ANIMATION_STATES,
  },
  {
    id: 'shira',
    name: 'Шира',
    force: 'Ножницы',
    archetype: 'Быстрый боец ближней дистанции',
    tagline: 'Набирает остроту сериями, режет ловушки и рискует в стремительных рывках.',
    passiveName: 'Шкала остроты',
    passiveDescription: 'Попадания и срезанные ловушки наполняют шкалу до усиленного приёма.',
    color: 0xe15367,
    cssColor: '#e15367',
    accentColor: 0x5bd6c7,
    accentCss: '#5bd6c7',
    shadowColor: 0x3f2942,
    visualKind: 'shira',
    stats: {
      maxHealth: 92,
      walkSpeed: 318,
      airMoveSpeed: 370,
      dashSpeed: 590,
      dashTicks: 8,
      jumpSpeed: 760,
    },
    animationStates: CHARACTER_ANIMATION_STATES,
  },
] as const;

export function getCharacter(characterId: string) {
  return circleFighters.find((fighter) => fighter.id === characterId) ?? circleFighters[0];
}
