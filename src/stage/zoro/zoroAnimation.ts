import type { ZoroActionId } from './zoroActions';
import type { ZoroRig } from './zoroRig';
import {
  heavyKick,
  heavyPunch,
  lightKick,
  lightPunch,
} from './zoroNormalAnimations';
import {
  lionSong,
  ogreTwister,
  poundCannon,
  swordStyles,
} from './zoroSpecialAnimations';
import {
  asura,
  threeThousandWorlds,
} from './zoroSuperAnimations';

type ZoroAnimation = (rig: ZoroRig, progress: number) => void;

const ANIMATIONS: Readonly<Record<ZoroActionId, ZoroAnimation>> = {
  lightPunch,
  heavyPunch,
  lightKick,
  heavyKick,
  lionSong,
  ogreTwister,
  poundCannon,
  swordStyles,
  threeThousandWorlds,
  asura,
};

export function applyZoroAnimation(
  rig: ZoroRig,
  action: ZoroActionId,
  progress: number,
): void {
  ANIMATIONS[action](rig, Math.max(0, Math.min(1, progress)));
}
