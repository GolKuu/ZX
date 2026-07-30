import {
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';
import type { LoadedSpritePart, SpritePart } from '../sprite2d/spriteRig';
import { SPRITE_TARGET_HEIGHT } from '../sprite2d/spriteRig';

export const MIM_PARTS = [
  'scarf',
  'head',
  'torso',
  'leftArm',
  'rightArm',
  'leftLeg',
  'rightLeg',
] as const;

export type MimPartName = (typeof MIM_PARTS)[number];

interface MimRigManifest {
  readonly facesRight: boolean;
  readonly origin: readonly [number, number];
  readonly parts: Record<MimPartName, SpritePart>;
  readonly view: { readonly figureHeight: number };
}

export type LoadedMimRig = Record<MimPartName, LoadedSpritePart> & {
  readonly facesRight: boolean;
  readonly origin: readonly [number, number];
  readonly pixelScale: number;
};

export const MIM_ATTACK_NAMES = ['lp', 'hp', 'lk', 'hk'] as const;
export type MimAttackName = (typeof MIM_ATTACK_NAMES)[number];

export interface LoadedMimAttack {
  readonly ground: number;
  readonly height: number;
  readonly originX: number;
  readonly texture: Texture;
  readonly width: number;
}

export type LoadedMimAttacks = Record<MimAttackName, LoadedMimAttack>;

export async function loadMimSpriteRig(): Promise<LoadedMimRig> {
  const base = '/sprites/mim-profile';
  const response = await fetch(`${base}/rig.json`);
  if (!response.ok) {
    throw new Error(`MIM rig could not load (${String(response.status)})`);
  }
  const manifest = (await response.json()) as MimRigManifest;
  const loader = new TextureLoader();
  const parts = {} as Record<MimPartName, LoadedSpritePart>;

  await Promise.all(MIM_PARTS.map(async (name) => {
    const texture = await loader.loadAsync(`${base}/${name}.png`);
    prepareTexture(texture);
    parts[name] = { ...manifest.parts[name], texture };
  }));

  return {
    ...parts,
    facesRight: manifest.facesRight,
    origin: manifest.origin,
    pixelScale: SPRITE_TARGET_HEIGHT / manifest.view.figureHeight,
  };
}

export async function loadMimAttacks(): Promise<LoadedMimAttacks> {
  const base = '/sprites/mim-attacks';
  const response = await fetch(`${base}/poses.json`);
  if (!response.ok) {
    throw new Error(`MIM attacks could not load (${String(response.status)})`);
  }
  const manifest = (await response.json()) as {
    poses: Record<MimAttackName, Omit<LoadedMimAttack, 'texture'>>;
  };
  const loader = new TextureLoader();
  const poses = {} as Record<MimAttackName, LoadedMimAttack>;
  await Promise.all(MIM_ATTACK_NAMES.map(async (name) => {
    const texture = await loader.loadAsync(`${base}/${name}.png`);
    prepareTexture(texture);
    poses[name] = { ...manifest.poses[name], texture };
  }));
  return poses;
}

export function disposeMimSpriteRig(rig: LoadedMimRig): void {
  for (const name of MIM_PARTS) rig[name].texture.dispose();
}

export function disposeMimAttacks(attacks: LoadedMimAttacks): void {
  for (const name of MIM_ATTACK_NAMES) attacks[name].texture.dispose();
}

function prepareTexture(texture: Texture): void {
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
}
