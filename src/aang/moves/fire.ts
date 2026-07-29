import type { AangMove } from '../types';

export const FIRE_MOVES: readonly AangMove[] = [
  {
    id: 'fire-lp',
    element: 'fire',
    category: 'normal',
    input: 'LP',
    name: 'Искра-джеб',
    description: 'Короткий прямой джеб с резкой огненной вспышкой на костяшках.',
    properties: ['rushdown', 'chip damage', 'быстрый'],
    beats: ['Кулак у подбородка', 'Прямой удар и вспышка', 'Пламя гаснет на возврате'],
  },
  {
    id: 'fire-hp',
    element: 'fire',
    category: 'normal',
    input: 'HP',
    name: 'Огненный клинок',
    description:
      'Рубящий удар открытой ладонью сверху вниз. Пробивает присевший блок как оверхед.',
    properties: ['overhead', 'high damage', 'chip damage'],
    beats: ['Ладонь высоко над головой', 'Вертикальный огненный срез', 'Низкая стойка'],
  },
  {
    id: 'fire-lk',
    element: 'fire',
    category: 'normal',
    input: 'LK',
    name: 'Горящий лоу',
    description: 'Низкий лоу-кик прочерчивает огненную дорожку по стопам противника.',
    properties: ['low', 'rushdown', 'chip damage'],
    beats: ['Поворот таза', 'Подсечка с огненным шлейфом', 'Быстрый возврат стопы'],
  },
  {
    id: 'fire-hk',
    element: 'fire',
    category: 'normal',
    input: 'HK',
    name: 'Пятка вулкана',
    description:
      'Прямой пинок подошвой. Из пятки вырывается столб огня, отправляя врага к стене.',
    properties: ['pushback', 'wall carry', 'high damage'],
    beats: ['Колено к груди', 'Пятка вперёд и огненный столб', 'Тяжёлый возврат в стойку'],
  },
];
