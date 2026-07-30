import {
  LinearFilter,
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

export function disposeMimSpriteRig(rig: LoadedMimRig): void {
  for (const name of MIM_PARTS) rig[name].texture.dispose();
}

function prepareTexture(texture: Texture): void {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
}
