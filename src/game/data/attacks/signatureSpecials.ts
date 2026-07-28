import type {
  AttackMotion,
  AttackVisualShape,
  HitLevel,
} from '../../combat/AttackDefinition';
import type { CharacterId } from '../characters/circleFighters';

export type SignatureSpecialConfig = {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  reach: number;
  height?: number;
  level?: HitLevel;
  motion: AttackMotion;
  visualShape: AttackVisualShape;
  knockbackX: number;
  knockbackY?: number;
  knockdown?: boolean;
};

export const SIGNATURE_SPECIALS: Record<CharacterId, SignatureSpecialConfig> = {
  granite: {
    name: 'Эхо земли', startup: 18, active: 8, recovery: 34, damage: 22,
    reach: 142, height: 32, level: 'low', motion: 'slam', visualShape: 'ground',
    knockbackX: 430, knockdown: true,
  },
  caliber: {
    name: 'Шесть искр', startup: 11, active: 5, recovery: 25, damage: 17,
    reach: 185, height: 28, motion: 'thrust', visualShape: 'projectile',
    knockbackX: 390,
  },
  volt: {
    name: 'Грозовой разрыв', startup: 7, active: 8, recovery: 19, damage: 16,
    reach: 145, height: 54, motion: 'burst', visualShape: 'line',
    knockbackX: 430,
  },
  nocturne: {
    name: 'Врата бездны', startup: 15, active: 10, recovery: 30, damage: 21,
    reach: 132, height: 72, motion: 'burst', visualShape: 'burst',
    knockbackX: 455, knockdown: true,
  },
  ragnar: {
    name: 'Драконье пламя', startup: 17, active: 9, recovery: 33, damage: 24,
    reach: 172, height: 58, motion: 'burst', visualShape: 'projectile',
    knockbackX: 510, knockdown: true,
  },
  marina: {
    name: 'Приливная волна', startup: 13, active: 11, recovery: 27, damage: 18,
    reach: 158, height: 35, level: 'low', motion: 'burst', visualShape: 'ground',
    knockbackX: 420,
  },
  zephyr: {
    name: 'Воздушный винт', startup: 6, active: 12, recovery: 20, damage: 16,
    reach: 118, height: 70, motion: 'roundhouse-kick', visualShape: 'arc',
    knockbackX: 440, knockbackY: 180,
  },
  origami: {
    name: 'Стая журавлей', startup: 12, active: 9, recovery: 25, damage: 18,
    reach: 176, height: 50, motion: 'slash', visualShape: 'projectile',
    knockbackX: 410,
  },
  poro: {
    name: 'Поглощающий хлопок', startup: 14, active: 8, recovery: 24, damage: 20,
    reach: 112, height: 76, motion: 'slam', visualShape: 'burst',
    knockbackX: 480, knockdown: true,
  },
  fenr: {
    name: 'Лунный рывок', startup: 8, active: 8, recovery: 22, damage: 19,
    reach: 136, height: 48, motion: 'thrust', visualShape: 'line',
    knockbackX: 500, knockdown: true,
  },
  sylvan: {
    name: 'Лес копий', startup: 18, active: 12, recovery: 32, damage: 23,
    reach: 180, height: 38, level: 'low', motion: 'slam', visualShape: 'ground',
    knockbackX: 470, knockdown: true,
  },
  adamant: {
    name: 'Несгибаемый апперкот', startup: 9, active: 6, recovery: 22, damage: 19,
    reach: 102, height: 70, motion: 'punch', visualShape: 'arc',
    knockbackX: 390, knockbackY: 290,
  },
  vassa: {
    name: 'Ядовитый бросок', startup: 10, active: 8, recovery: 24, damage: 17,
    reach: 165, height: 35, level: 'low', motion: 'thrust', visualShape: 'projectile',
    knockbackX: 370,
  },
  shira: {
    name: 'Вертушка лезвий', startup: 7, active: 9, recovery: 18, damage: 15,
    reach: 86, height: 58, motion: 'slash', visualShape: 'arc',
    knockbackX: 350,
  },
  pyron: {
    name: 'Огненная корона', startup: 12, active: 11, recovery: 27, damage: 21,
    reach: 148, height: 82, motion: 'burst', visualShape: 'burst',
    knockbackX: 460, knockdown: true,
  },
};

export function signatureSpecial(characterId: CharacterId) {
  return SIGNATURE_SPECIALS[characterId];
}
