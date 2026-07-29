/**
 * Toon material: banded ramp + coloured shadow + axis-gated rim.
 *
 * Built by patching `MeshToonMaterial` rather than authoring a `ShaderMaterial`
 * from scratch, so skinning, shadows and fog keep working when the placeholder
 * geometry is replaced with a rigged mesh.
 *
 * Two additions over stock toon shading, both from ART-CCU-400:
 *
 *  - **Shadow is a colour, never a darkness** (§A2). The shaded band is tinted
 *    toward a separate hue instead of being a multiply of the base.
 *  - **Rim is gated to the combat axis** (§3.2). An ungated Fresnel wraps the
 *    whole silhouette and reads as plastic; gating it to the axis between the
 *    fighters lights exactly the two contours a player parses for spacing.
 */

import {
  Color,
  MeshToonMaterial,
  Vector3,
  type ColorRepresentation,
  type IUniform,
  type Texture,
} from 'three';

export interface ToonMaterialOptions {
  readonly color: ColorRepresentation;
  readonly gradientMap: Texture;
  /** Hue the shaded band is pushed toward. Never grey. */
  readonly shadowTint?: ColorRepresentation;
  readonly shadowStrength?: number;
  readonly rimColor?: ColorRepresentation;
  readonly rimStrength?: number;
}

export interface ToonUniforms {
  uShadowTint: IUniform<Color>;
  uShadowStrength: IUniform<number>;
  uRimColor: IUniform<Color>;
  uRimStrength: IUniform<number>;
  /** View-space direction perpendicular to the combat axis. */
  uRimAxis: IUniform<Vector3>;
  /** Flashes to 1 for a couple of frames on impact. */
  uFlash: IUniform<number>;
}

export type ToonMaterial = MeshToonMaterial & { readonly toon: ToonUniforms };

const RIM_INNER = 0.5;
const RIM_OUTER = 0.94;

export function createToonMaterial(options: ToonMaterialOptions): ToonMaterial {
  const uniforms: ToonUniforms = {
    uShadowTint: { value: new Color(options.shadowTint ?? '#4a5f8c') },
    uShadowStrength: { value: options.shadowStrength ?? 0.85 },
    uRimColor: { value: new Color(options.rimColor ?? '#9fd8ff') },
    uRimStrength: { value: options.rimStrength ?? 0.85 },
    uRimAxis: { value: new Vector3(1, 0, 0) },
    uFlash: { value: 0 },
  };

  const material = new MeshToonMaterial({
    color: options.color,
    gradientMap: options.gradientMap,
  }) as ToonMaterial;

  Object.defineProperty(material, 'toon', { value: uniforms, enumerable: true });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        uniform vec3  uShadowTint;
        uniform float uShadowStrength;
        uniform vec3  uRimColor;
        uniform float uRimStrength;
        uniform vec3  uRimAxis;
        uniform float uFlash;
        `,
      )
      .replace(
        '#include <dithering_fragment>',
        /* glsl */ `
        #include <dithering_fragment>

        vec3 toonNormal = normalize( vNormal );
        vec3 toonView   = normalize( vViewPosition );

        // --- coloured shadow -------------------------------------------------
        // Estimate how shaded this fragment is by comparing lit luminance to the
        // albedo's own luminance, then push the dark band toward a hue.
        const vec3 LUMA = vec3( 0.2126, 0.7152, 0.0722 );
        float litLuma  = dot( outgoingLight, LUMA );
        float baseLuma = max( dot( diffuseColor.rgb, LUMA ), 0.001 );
        float shade    = 1.0 - clamp( litLuma / baseLuma, 0.0, 1.0 );
        outgoingLight  = mix(
          outgoingLight,
          outgoingLight * uShadowTint * 1.9,
          shade * uShadowStrength
        );

        // --- axis-gated rim --------------------------------------------------
        float fres = 1.0 - clamp( dot( toonNormal, toonView ), 0.0, 1.0 );
        float rim  = smoothstep( ${RIM_INNER.toFixed(2)}, ${RIM_OUTER.toFixed(2)}, fres );
        float gate = pow( clamp( abs( dot( toonNormal, normalize( uRimAxis ) ) ), 0.0, 1.0 ), 1.6 );
        outgoingLight += uRimColor * rim * gate * uRimStrength;

        // --- impact flash ----------------------------------------------------
        outgoingLight = mix( outgoingLight, vec3( 1.0 ), clamp( uFlash, 0.0, 1.0 ) );
        `,
      );
  };

  // Force a recompile if this material is cloned or the defines change.
  material.customProgramCacheKey = () => 'ccu-toon-v1';

  return material;
}

const AXIS = new Vector3();
const UP = new Vector3(0, 1, 0);

/**
 * Point the rim at the opponent.
 *
 * `self` and `opponent` are world positions; `viewMatrix` comes from the active
 * camera. The result is the screen-horizontal perpendicular of the combat axis,
 * which is the contour that needs separating from the background.
 */
export function updateRimAxis(
  material: ToonMaterial,
  self: { x: number; z: number },
  opponent: { x: number; z: number },
  viewMatrix: { elements: ArrayLike<number> },
): void {
  AXIS.set(opponent.x - self.x, 0, opponent.z - self.z);
  if (AXIS.lengthSq() < 1e-6) {
    AXIS.set(1, 0, 0);
  }
  AXIS.normalize().cross(UP).normalize();

  // World → view, rotation only.
  const e = viewMatrix.elements;
  material.toon.uRimAxis.value.set(
    (e[0] ?? 1) * AXIS.x + (e[4] ?? 0) * AXIS.y + (e[8] ?? 0) * AXIS.z,
    (e[1] ?? 0) * AXIS.x + (e[5] ?? 1) * AXIS.y + (e[9] ?? 0) * AXIS.z,
    (e[2] ?? 0) * AXIS.x + (e[6] ?? 0) * AXIS.y + (e[10] ?? 1) * AXIS.z,
  );
}

/** Frames the white impact flash takes to fall off. */
export const FLASH_DECAY_FRAMES = 4;

export function decayFlash(material: ToonMaterial, deltaFrames: number): void {
  const current = material.toon.uFlash.value;
  if (current <= 0) {
    return;
  }
  material.toon.uFlash.value = Math.max(
    0,
    current - deltaFrames / FLASH_DECAY_FRAMES,
  );
}

export function triggerFlash(material: ToonMaterial, intensity = 0.85): void {
  material.toon.uFlash.value = intensity;
}
