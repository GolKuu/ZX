/**
 * A 2D cut-out rig: the character sheet, sliced, hung on joints.
 *
 * `scripts/slice-characters.mjs` cuts a profile drawing into parts and writes
 * `public/sprites/<name>/rig.json` alongside the PNGs. Nothing here knows how
 * that cut was made — it reads sizes and pivots and turns them into planes.
 *
 * Why a profile and not the front view: a front-facing cut-out whose limbs are
 * rotated reads as a character facing the viewer and flailing. A side view
 * rotates correctly along the combat axis, and mirroring it for the other
 * direction is free.
 */

import {
  LinearFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';

/** Every part the runtime knows how to hang. Extra parts in a manifest are ignored. */
export const SPRITE_PARTS = [
  'ponytail',
  'head',
  'torso',
  'hips',
  'sash',
  'upperArm',
  'forearm',
  'thigh',
  'shin',
  'boot',
] as const;

export type SpritePartName = (typeof SPRITE_PARTS)[number];

export interface SpritePart {
  readonly width: number;
  readonly height: number;
  /** Joint position as a fraction of the part's own image. */
  readonly pivot: readonly [number, number];
  /** The same joint in source-crop pixels. */
  readonly joint: readonly [number, number];
}

export interface SpriteRigManifest {
  readonly parts: Partial<Record<SpritePartName, SpritePart>>;
  /** Which way the sliced drawing faces. Differs per sheet. */
  readonly facesRight?: boolean;
  /** Body centre and floor row in source-crop pixels. */
  readonly origin?: readonly [number, number];
  readonly view?: { readonly height?: number };
}

/** The four attack panels, as drawn. */
export const ATTACK_POSE_NAMES = ['lp', 'hp', 'lk', 'hk'] as const;
export type AttackPoseName = (typeof ATTACK_POSE_NAMES)[number];

export interface AttackPoseSpec {
  readonly width: number;
  readonly height: number;
  /** Where the floor sits, as a fraction of the image's height. */
  readonly ground: number;
}

export interface LoadedAttackPose extends AttackPoseSpec {
  readonly texture: Texture;
}

export type LoadedAttackPoses = {
  readonly [Key in AttackPoseName]?: LoadedAttackPose;
} & {
  readonly displayScale: number;
  readonly facesRight: boolean;
};

/**
 * Load the whole-body attack sprites for a character.
 *
 * Absent for characters whose sheet draws its attack panels as plain hurtbox
 * volumes with no costume colour — those keep the jointed rig throughout.
 */
export async function loadAttackPoses(
  name: string,
): Promise<LoadedAttackPoses> {
  const base = `/sprites/${name}`;
  const response = await fetch(`${base}/poses.json`);
  if (!response.ok) {
    throw new Error(`No attack poses for "${name}" (${String(response.status)})`);
  }
  const manifest = (await response.json()) as {
    displayScale?: number;
    facesRight?: boolean;
    poses: Partial<Record<AttackPoseName, AttackPoseSpec>>;
  };

  const loader = new TextureLoader();
  const poses: Record<string, LoadedAttackPose> = {};
  await Promise.all(
    ATTACK_POSE_NAMES.map(async (pose) => {
      const spec = manifest.poses[pose];
      if (spec === undefined) return;
      const texture = await loader.loadAsync(`${base}/${pose}.png`);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      poses[pose] = { ...spec, texture };
    }),
  );
  return {
    ...poses,
    displayScale: manifest.displayScale ?? 1.18,
    facesRight: manifest.facesRight !== false,
  } as LoadedAttackPoses;
}

export function disposeAttackPoses(poses: LoadedAttackPoses): void {
  for (const pose of ATTACK_POSE_NAMES) {
    poses[pose]?.texture.dispose();
  }
}

export interface LoadedSpritePart extends SpritePart {
  readonly texture: Texture;
}

export type LoadedSpriteRig = {
  readonly [Key in SpritePartName]?: LoadedSpritePart;
} & {
  readonly facesRight?: boolean;
  readonly origin: readonly [number, number];
  readonly pixelScale: number;
};

/**
 * Height the tallest sliced sheet maps to, in engine units.
 *
 * Matches the crown anchor the rest of the engine is built against, so a sprite
 * fighter and a geometry fighter are the same size in the same stage.
 */
export const SPRITE_TARGET_HEIGHT = 2.62;

/** Legacy scale used only by the old whole-pose sprite loader. */
export const SPRITE_SHEET_HEIGHT = 490;
export const PIXEL = SPRITE_TARGET_HEIGHT / SPRITE_SHEET_HEIGHT;

export async function loadSpriteRig(name: string): Promise<LoadedSpriteRig> {
  const base = `/sprites/${name}`;
  const response = await fetch(`${base}/rig.json`);
  if (!response.ok) {
    throw new Error(`No rig manifest for "${name}" (${String(response.status)})`);
  }
  const manifest = (await response.json()) as SpriteRigManifest;

  const loader = new TextureLoader();
  const rig: Record<string, LoadedSpritePart> = {};

  await Promise.all(
    SPRITE_PARTS.map(async (part) => {
      const spec = manifest.parts[part];
      if (spec === undefined) return;
      const texture = await loader.loadAsync(`${base}/${part}.png`);
      // Cel art, drawn at final size: linear filtering, sRGB, no mipmaps to go
      // soft on us at this camera distance.
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      rig[part] = { ...spec, texture };
    }),
  );

  const sourceHeight = manifest.view?.height ?? SPRITE_SHEET_HEIGHT;
  return {
    ...rig,
    facesRight: manifest.facesRight === true,
    origin: manifest.origin ?? [0, sourceHeight],
    pixelScale: SPRITE_TARGET_HEIGHT / sourceHeight,
  } as LoadedSpriteRig;
}

export function disposeSpriteRig(rig: LoadedSpriteRig): void {
  for (const part of SPRITE_PARTS) {
    rig[part]?.texture.dispose();
  }
}
