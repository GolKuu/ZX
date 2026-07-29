/**
 * Inverted-hull outline that survives skinning.
 *
 * The original `outlineMaterial.ts` is a raw ShaderMaterial reading `position`
 * and `normal` directly. That is correct for the primitive blockout, but on a
 * SkinnedMesh three never feeds it the bone matrices — a ShaderMaterial does
 * not receive the skinning uniform block — so the hull stays frozen in bind
 * pose while the character animates. The character appears to walk out of its
 * own outline.
 *
 * The fix is to build on a stock lit material and patch it, exactly the way
 * `toonMaterial.ts` patches MeshToonMaterial. The renderer then supplies
 * skinning, morph targets and the bone texture for free, and we only override
 * the one thing we actually care about: how far along the normal the hull is
 * pushed, solved in screen space so the line holds a constant pixel weight at
 * every camera distance (ART-CCU-400 §4.2).
 *
 * Lambert with a black diffuse and the line colour in `emissive` resolves to a
 * flat unlit colour without needing a fragment patch at all.
 */

import {
  BackSide,
  Color,
  MeshLambertMaterial,
  type ColorRepresentation,
  type IUniform,
} from 'three';

export interface SkinnedOutlineUniforms {
  readonly uPixelWidth: IUniform<number>;
  readonly uViewportHeight: IUniform<number>;
  readonly uTanHalfFov: IUniform<number>;
  readonly uFalloff: IUniform<number>;
}

export type SkinnedOutlineMaterial = MeshLambertMaterial & {
  readonly outline: SkinnedOutlineUniforms;
};

export interface SkinnedOutlineOptions {
  /** Line weight in pixels, held constant across depth. */
  readonly pixelWidth?: number;
  readonly color?: ColorRepresentation;
  /** Thin slightly at long range so a distant pair does not read as stickers. */
  readonly falloff?: boolean;
}

const PARS = /* glsl */ `
  uniform float uPixelWidth;
  uniform float uViewportHeight;
  uniform float uTanHalfFov;
  uniform float uFalloff;
`;

/**
 * Replaces `<project_vertex>`. `transformed` is already skinned at this point
 * and `transformedNormal` is already in view space.
 */
const PROJECT = /* glsl */ `
  vec4 mvPosition = vec4( transformed, 1.0 );

  #ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
  #endif

  mvPosition = modelViewMatrix * mvPosition;

  // `defaultnormal_vertex` negates the normal when FLIP_SIDED is set, and
  // FLIP_SIDED is always set here because the hull renders BackSide. Undo it,
  // or the hull is pushed inward and no outline is produced at all.
  vec3 outlineNormal = transformedNormal;
  #ifdef FLIP_SIDED
    outlineNormal = - outlineNormal;
  #endif

  float outlineDepth = max( -mvPosition.z, 0.001 );
  float unitsPerPixel = ( 2.0 * uTanHalfFov * outlineDepth ) / uViewportHeight;
  float outlineWidth = uPixelWidth * unitsPerPixel;

  float outlineFalloff = mix(
    1.0,
    clamp( 1.0 - ( outlineDepth - 7.0 ) / 22.0, 0.55, 1.0 ),
    uFalloff
  );

  mvPosition.xyz += normalize( outlineNormal ) * outlineWidth * outlineFalloff;
  gl_Position = projectionMatrix * mvPosition;
`;

export function createSkinnedOutlineMaterial(
  options: SkinnedOutlineOptions = {},
): SkinnedOutlineMaterial {
  const uniforms: SkinnedOutlineUniforms = {
    uPixelWidth: { value: options.pixelWidth ?? 2.4 },
    uViewportHeight: { value: 1080 },
    uTanHalfFov: { value: Math.tan((45 * Math.PI) / 180 / 2) },
    uFalloff: { value: options.falloff === false ? 0 : 1 },
  };

  const material = new MeshLambertMaterial({
    color: 0x000000,
    emissive: new Color(options.color ?? '#0a0d18'),
    fog: false,
    side: BackSide,
    toneMapped: false,
  }) as SkinnedOutlineMaterial;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPixelWidth = uniforms.uPixelWidth;
    shader.uniforms.uViewportHeight = uniforms.uViewportHeight;
    shader.uniforms.uTanHalfFov = uniforms.uTanHalfFov;
    shader.uniforms.uFalloff = uniforms.uFalloff;

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${PARS}`)
      .replace('#include <project_vertex>', PROJECT);
  };

  Object.defineProperty(material, 'outline', {
    value: uniforms,
    writable: false,
  });

  return material;
}

/** Call on mount and on resize — the width formula needs both values. */
export function updateSkinnedOutlineProjection(
  material: SkinnedOutlineMaterial,
  viewportHeightPx: number,
  fovDegrees: number,
): void {
  material.outline.uViewportHeight.value = Math.max(1, viewportHeightPx);
  material.outline.uTanHalfFov.value = Math.tan(
    (fovDegrees * Math.PI) / 180 / 2,
  );
}
