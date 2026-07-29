import type { AangMove } from '../types';

export const WATER_MOVES: readonly AangMove[] = [
  {
    id: 'water-lp',
    element: 'water',
    category: 'normal',
    input: 'LP',
    name: 'Короткая плеть',
    description: 'Хлёсткий удар водяной плетью с кисти на среднем уровне.',
    properties: ['mid-range', 'fast poke', 'keep-away'],
    beats: ['Кисть собирает воду', 'Короткий хлёст', 'Вода возвращается к ладони'],
  },
  {
    id: 'water-hp',
    element: 'water',
    category: 'normal',
    input: 'HP',
    name: 'Двойная приливная дуга',
    description:
      'Две водяные плети проходят слева направо и перебивают прямолинейный подбег.',
    properties: ['anti-rush', 'wide arc', 'mid-range'],
    beats: ['Руки расходятся', 'Две плети пересекают экран', 'Вода обвивает предплечья'],
  },
  {
    id: 'water-lk',
    element: 'water',
    category: 'normal',
    input: 'LK',
    name: 'Скользящий поток',
    description: 'Водяная струя проходит по полу прямо под ноги противнику.',
    properties: ['low', 'long poke', 'keep-away'],
    beats: ['Стопа чертит круг', 'Струя скользит по земле', 'Вода распадается брызгами'],
  },
  {
    id: 'water-hk',
    element: 'water',
    category: 'normal',
    input: 'HK',
    name: 'Серп прилива',
    description: 'Круговой удар ногой выплёскивает водяной серп на уровне головы.',
    properties: ['high', 'projectile arc', 'space control'],
    beats: ['Корпус закручивается', 'Удар и серповидная дуга', 'Доворот в стойку'],
  },
];
