import type { AangMove } from '../types';

export const SPECIAL_MOVES: readonly AangMove[] = [
  {
    id: 'air-squall',
    element: 'air',
    category: 'special',
    input: 'QCF + P',
    name: 'Магия Воздуха: Шквал',
    description:
      'Сферическая воздушная волна идёт вперёд и сильно отталкивает противника.',
    properties: ['projectile', 'pushback', 'space control'],
    beats: ['Круговой набор воздуха', 'Сфера срывается с ладоней', 'Шаг сохраняет дистанцию'],
  },
  {
    id: 'earth-wall',
    element: 'earth',
    category: 'special',
    input: 'QCB + K',
    name: 'Магия Земли: Стена',
    description:
      'Топот поднимает каменный блок перед Аангом. Стена принимает вражеские снаряды.',
    properties: ['projectile shield', 'persistent', 'setup'],
    beats: ['Стопа набирает вес', 'Блок вырывается из пола', 'Аанг прячется за укрытием'],
  },
  {
    id: 'water-diagonal',
    element: 'water',
    category: 'special',
    input: 'SRK + P',
    name: 'Магия Воды: Хлыст',
    description:
      'Диагональный водяной хлыст достаёт до противоположного верхнего угла экрана.',
    properties: ['full-screen', 'diagonal', 'anti-air'],
    beats: ['Вода собирается у запястья', 'Хлыст режет экран по диагонали', 'Кисть гасит импульс'],
  },
  {
    id: 'element-shift',
    element: 'avatar',
    category: 'mechanic',
    input: '↓ ↓ + LP / HP / LK / HK',
    name: 'Выбор стихии',
    description:
      'LP — Воздух, HP — Огонь, LK — Земля, HK — Вода. Свечение стрелы подтверждает новую стойку.',
    properties: ['stance select', 'normal properties change', 'visual tell'],
    beats: ['Двойной шаг вниз', 'Четыре стихии вспыхивают по кругу', 'Стрела принимает новый цвет'],
  },
  {
    id: 'elemental-cocoon',
    element: 'avatar',
    category: 'super',
    input: 'QCF ×2 + P',
    name: 'Ур. 1 — Элементальный Кокон',
    description:
      'Аанг левитирует внутри вращающихся колец воды, огня, земли и воздуха. Контакт с любым кольцом наносит урон.',
    properties: ['level 1', 'multi-hit', 'contact armor'],
    beats: ['Четыре кольца сходятся', 'Левитация и серия контактов', 'Стихии расходятся наружу'],
  },
  {
    id: 'avatar-state',
    element: 'avatar',
    category: 'super',
    input: 'QCB ×2 + 3P',
    name: 'Ур. 3 — Состояние Аватара',
    description:
      'Глаза и стрелы горят белым. Аанг поднимается на воздушном кольце, а все спецприёмы теряют замах.',
    properties: ['level 3', 'install', 'zero-windup specials'],
    beats: ['Белая вспышка в глазах', 'Подъём на воздушном кольце', 'Четыре стихии отвечают одновременно'],
  },
];
