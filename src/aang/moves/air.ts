import type { AangMove } from '../types';

export const AIR_MOVES: readonly AangMove[] = [
  {
    id: 'air-lp',
    element: 'air',
    category: 'normal',
    input: 'LP',
    name: 'Сжатый толчок',
    description:
      'Быстрый толчок двумя ладонями. Сжатый воздух оставляет Аанга почти без восстановления.',
    properties: ['быстрый', 'комбо-стартер', 'минимум recovery'],
    beats: ['Ладони у груди', 'Короткий воздушный хлопок', 'Мгновенный возврат'],
  },
  {
    id: 'air-hp',
    element: 'air',
    category: 'normal',
    input: 'HP',
    name: 'Дуга планера',
    description:
      'Горизонтальный взмах выпрямленным шестом-планером посылает дугу на средней дистанции.',
    properties: ['mid-range', 'контроль пространства', 'staff'],
    beats: ['Шест раскрывается', 'Широкий горизонтальный срез', 'Планер уходит за плечо'],
  },
  {
    id: 'air-lk',
    element: 'air',
    category: 'normal',
    input: 'LK',
    name: 'Вихрь у колена',
    description:
      'Короткий удар носком в колено создаёт вихрь у ног противника и открывает низкие маршруты.',
    properties: ['low', 'быстрый', 'pressure'],
    beats: ['Вес на заднюю ногу', 'Носок и малый вихрь', 'Нога сразу под корпусом'],
  },
  {
    id: 'air-hk',
    element: 'air',
    category: 'normal',
    input: 'HK',
    name: 'Небесная вертушка',
    description:
      'Прыжковый разворот на 360°. Воздушное кольцо подбрасывает соперника для продолжения комбо.',
    properties: ['launcher', '360°', 'airborne'],
    beats: ['Прыжок с поджатыми ногами', 'Полный оборот и воздушное кольцо', 'Мягкая посадка'],
  },
];
