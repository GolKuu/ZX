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
}

export interface SpriteRigManifest {
  readonly parts: Partial<Record<SpritePartName, SpritePart>>;
}

export interface LoadedSpritePart extends SpritePart {
  readonly texture: Texture;
}

export type LoadedSpriteRig = {
  readonly [Key in SpritePartName]?: LoadedSpritePart;
};

/**
 * Height the tallest sliced sheet maps to, in engine units.
 *
 * Matches the crown anchor the rest of the engine is built against, so a sprite
 * fighter and a geometry fighter are the same size in the same stage.
 */
export const SPRITE_TARGET_HEIGHT = 2.62;

/** Sheet pixels per engine unit, derived from the sliced profile's full height. */
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

  return rig as LoadedSpriteRig;
}

export function disposeSpriteRig(rig: LoadedSpriteRig): void {
  for (const part of SPRITE_PARTS) {
    rig[part]?.texture.dispose();
  }
}
