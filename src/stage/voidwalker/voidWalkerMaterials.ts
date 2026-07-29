import {
  AdditiveBlending,
  DoubleSide,
  MeshBasicMaterial,
  type DataTexture,
  type Material,
} from 'three';
import {
  createToonMaterial,
  type ToonMaterial,
} from '@/src/render/toonMaterial';

/**
 * Void Walker — per-zone materials.
 *
 * The whole palette runs on one rule (ART-CCU-400 §A2): the shaded band is a
 * *hue shift*, never a multiply. The coat is near-black and shades to violet,
 * white hair shades to cool lilac, skin shades to plum. A grey multiply on any
 * of the three is what makes a toon-shaded model read as a 3D model with a
 * ramp on it, and it is the single most common way this look is lost.
 */
export function createVoidWalkerMaterials(
  gradientMap: DataTexture,
  auraColor: string,
) {
  const coat = toon('#1d1a33', gradientMap, '#5b3a9e', auraColor, 0.9, 0.95);
  const collar = toon('#22203c', gradientMap, '#6544ad', auraColor, 1.0, 0.9);

  // Open cylinders — collar, coat skirt, visor — are seen from inside on the
  // far contour, so they cannot be single-sided.
  coat.side = DoubleSide;
  collar.side = DoubleSide;

  const visor = toon('#131120', gradientMap, '#4b3a86', auraColor, 1.25, 0.7);
  visor.side = DoubleSide;

  return {
    coat,
    collar,
    visor,
    panel: toon('#4b3a86', gradientMap, '#2b2058', auraColor, 0.9),
    hair: toon('#f2f0ff', gradientMap, '#a9a6dd', auraColor, 1.1, 0.7),
    skin: toon('#f0cbaa', gradientMap, '#c0757f', auraColor, 0.65, 0.62),
    shirt: toon('#e8ecf6', gradientMap, '#8f9ac4', auraColor, 0.8),
    trousers: toon('#191728', gradientMap, '#3f3070', auraColor, 0.8),
    boot: toon('#0e0d18', gradientMap, '#332a5c', auraColor, 0.9),
    clasp: toon('#c9a955', gradientMap, '#6b4a17', auraColor, 1.0),

    // --- face: unlit, always ---
    // Eyes are drawn elements, not surfaces. No ramp, no rim, no shadow — so
    // the face keeps one read at every light angle and the gaze survives a
    // dark stage. The catchlight is never removed; it is what separates a
    // living face from a doll.
    eyeWhite: unlit('#fbfdff'),
    iris: unlit('#4fc8f5'),
    pupil: unlit('#101a2c'),
    catchlight: unlit('#ffffff'),
    lineArt: unlit('#241d33'),

    // --- energy ---
    aura: glow(auraColor, 0.8),
    phantom: glow(auraColor, 0.3),
    voidCore: glow('#0a0620', 0.85, false),
  };
}

export type VoidWalkerMaterials = ReturnType<typeof createVoidWalkerMaterials>;

/** Toon materials whose rim axis follows the combat spacing direction. */
export function toonMaterialsOf(
  materials: VoidWalkerMaterials,
): readonly ToonMaterial[] {
  return [
    materials.boot,
    materials.clasp,
    materials.coat,
    materials.collar,
    materials.hair,
    materials.panel,
    materials.shirt,
    materials.skin,
    materials.trousers,
    materials.visor,
  ];
}

export function disposeVoidWalkerMaterials(
  materials: VoidWalkerMaterials,
): void {
  Object.values(materials).forEach((material: Material) => material.dispose());
}

/** Flat and light-independent. Every drawn element on the face uses this. */
function unlit(color: string): MeshBasicMaterial {
  return new MeshBasicMaterial({ color, toneMapped: false });
}

/**
 * Energy surfaces. Additive so they bloom off the emissive mask rather than a
 * luminance threshold, which would also catch the white hair.
 */
function glow(
  color: string,
  opacity: number,
  additive = true,
): MeshBasicMaterial {
  return new MeshBasicMaterial({
    blending: additive ? AdditiveBlending : undefined,
    color,
    depthWrite: false,
    opacity,
    side: DoubleSide,
    toneMapped: false,
    transparent: true,
  });
}

function toon(
  color: string,
  gradientMap: DataTexture,
  shadowTint: string,
  rimColor: string,
  rimStrength = 0.85,
  shadowStrength = 0.85,
): ToonMaterial {
  return createToonMaterial({
    color,
    gradientMap,
    shadowStrength,
    shadowTint,
    rimColor,
    rimStrength,
  });
}
