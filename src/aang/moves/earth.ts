import type { AangMove } from '../types';

export const EARTH_MOVES: readonly AangMove[] = [
  {
    id: 'earth-lp',
    element: 'earth',
    category: 'normal',
    input: 'LP',
    name: 'Каменный локоть',
    description:
      'Тяжёлый локоть вперёд. При контакте Аанг скользит назад, возвращаясь на безопасную дистанцию.',
    properties: ['armor', 'safe pushback', 'heavy'],
    beats: ['Стойка становится квадратной', 'Локоть сквозь каменную крошку', 'Отскок назад'],
  },
  {
    id: 'earth-hp',
    element: 'earth',
    category: 'normal',
    input: 'HP',
    name: 'Каменный шип',
    description:
      'Два кулака бьют в землю, и перед Аангом вырастает среднедальний каменный шип.',
    properties: ['medium-range', 'high', 'armor'],
    beats: ['Обе руки над землёй', 'Удар кулаками и рост шипа', 'Подъём через широкую стойку'],
  },
  {
    id: 'earth-lk',
    element: 'earth',
    category: 'normal',
    input: 'LK',
    name: 'Галечный топот',
    description: 'Топот пяткой поднимает веер гальки по ногам противника.',
    properties: ['low', 'pressure', 'grounded'],
    beats: ['Пятка зависает', 'Топот и веер камней', 'Пыль оседает'],
  },
  {
    id: 'earth-hk',
    element: 'earth',
    category: 'normal',
    input: 'HK',
    name: 'Поднятый пласт',
    description:
      'Тяжёлая подсечка тянет за ногой пласт земли и гарантированно валит противника.',
    properties: ['knockdown', 'armor', 'wide sweep'],
    beats: ['Глубокая посадка', 'Подсечка с пластом земли', 'Фиксация в низкой стойке'],
  },
];
