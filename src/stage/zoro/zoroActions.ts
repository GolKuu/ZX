export const ZORO_ACTION_IDS = [
  'lightPunch',
  'heavyPunch',
  'lightKick',
  'heavyKick',
  'lionSong',
  'ogreTwister',
  'poundCannon',
  'swordStyles',
  'threeThousandWorlds',
  'asura',
] as const;

export type ZoroActionId = (typeof ZORO_ACTION_IDS)[number];
export type ZoroStance = 'one' | 'three';

export interface ZoroActionDefinition {
  readonly id: ZoroActionId;
  readonly name: string;
  readonly input: string;
  readonly hotkey: string;
  readonly duration: number;
  readonly kind: 'normal' | 'special' | 'stance' | 'super';
}

export const ZORO_ACTIONS: readonly ZoroActionDefinition[] = [
  action('lightPunch', 'Удар рукоятью', 'LP', 'J', 0.48, 'normal'),
  action('heavyPunch', 'Диагональный рубящий', 'HP', 'K', 0.82, 'normal'),
  action('lightKick', 'Удар коленом', 'LK', 'N', 0.58, 'normal'),
  action('heavyKick', 'Подсекающий меч', 'HK', 'M', 0.88, 'normal'),
  action('lionSong', 'Песня Льва', 'QCF + P', 'I', 1.18, 'special'),
  action('ogreTwister', 'Вращение Огра', 'QCB + K', 'O', 1.28, 'special'),
  action('poundCannon', '360-фунтовая Пушка', 'SRK + P', 'C', 1.08, 'special'),
  action('swordStyles', 'Стили мечей', '↓↓ + P', 'T', 0.9, 'stance'),
  action('threeThousandWorlds', 'Три тысячи миров', 'QCF×2 + P', 'U', 1.72, 'super'),
  action('asura', 'Девять мечей: Асура', 'QCB×2 + 3P', 'Y', 2.25, 'super'),
];

export const ZORO_ACTION_BY_ID = new Map(
  ZORO_ACTIONS.map((definition) => [definition.id, definition]),
);

function action(
  id: ZoroActionId,
  name: string,
  input: string,
  hotkey: string,
  duration: number,
  kind: ZoroActionDefinition['kind'],
): ZoroActionDefinition {
  return { id, name, input, hotkey, duration, kind };
}
