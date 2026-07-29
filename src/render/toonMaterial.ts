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
 *
 * Two later additions exist because the bought models do not cooperate with the
 * keyword-driven zone system — see `heightZones` and `detailMap` below.
 */

import {
  Color,
  MeshToonMaterial,
  Vector3,
  type ColorRepresentation,
  type IUniform,
  type Texture,
} from 'three';

/** Maximum bands the zone shader unrolls. Five covers a humanoid. */
export const MAX_HEIGHT_ZONES = 5;

export interface HeightZoneBand {
  /** Upper edge, as a fraction of the model's bind-pose height. */
  readonly upTo: number;
  readonly lit: ColorRepresentation;
  readonly shade: ColorRepresentation;
}

export interface ToonMaterialOptions {
  readonly color: ColorRepresentation;
  readonly gradientMap: Texture;
  /** Hue the shaded band is pushed toward. Never grey. */
  readonly shadowTint?: ColorRepresentation;
  readonly shadowStrength?: number;
  readonly rimColor?: ColorRepresentation;
  readonly rimStrength?: number;
  /**
   * Paint the surface by height instead of by a single flat colour.
   *
   * Every model in `public/models/` ships one or two merged materials, so the
   * keyword pass in `loadFighterModel` resolves an entire character to a single
   * zone — which is why Void Walker rendered as a bare flesh-toned mannequin
   * and Blade Phantom as one green blob. Slicing the palette by bind-pose
   * height recovers boots, trousers, coat, skin and hair from geometry the
   * vendor never separated.
   *
   * Bind-pose height, not world height: a crouching fighter must not have their
   * boots ride up their shins.
   */
  readonly heightZones?: readonly HeightZoneBand[];
  /** Bind-space Y of the model's feet and crown. Required with `heightZones`. */
  readonly heightRange?: readonly [number, number];
  /**
   * The vendor's albedo, used for its *value structure* only.
   *
   * Discarding these textures outright threw away every strap, seam and panel
   * the model was authored with. Sampling one and posterising its luminance
   * into the zone's own lit/shade pair keeps the flat cel look while giving the
   * surface something to read — detail without a PBR texture in sight.
   */
  readonly detailMap?: Texture;
  /** Posterisation steps for `detailMap`. Low on purpose. */
  readonly detailBands?: number;
  /** Contrast applied to the detail luminance before banding. */
  readonly detailContrast?: number;
}

export interface ToonUniforms {
  uShadowTint: IUniform<Color>;
  uShadowStrength: IUniform<number>;
  uRimColor: IUniform<Color>;
  uRimStrength: IUniform<number>;
  /** View-space direction perpendicular to the combat axis. */
  uRimAxis: IUniform<Vector3>;
  uZoneEdge: IUniform<Float32Array>;
  uZoneLit: IUniform<Color[]>;
  uZoneShade: IUniform<Color[]>;
  /** Bind-space Y of feet and crown. */
  uZoneRange: IUniform<[number, number]>;
  uDetailBands: IUniform<number>;
  uDetailContrast: IUniform<number>;
}

export type ToonMaterial = MeshToonMaterial & { readonly toon: ToonUniforms };

const RIM_INNER = 0.5;
const RIM_OUTER = 0.94;

export function createToonMaterial(options: ToonMaterialOptions): ToonMaterial {
  const zones = options.heightZones ?? [];
  const useZones = zones.length > 0 && options.heightRange !== undefined;
  const useDetail = options.detailMap !== undefined;

  // Padded to a fixed length so the shader can unroll a constant loop; unused
  // slots repeat the last band and are therefore unreachable.
  const edges = new Float32Array(MAX_HEIGHT_ZONES).fill(1);
  const litColours: Color[] = [];
  const shadeColours: Color[] = [];
  for (let index = 0; index < MAX_HEIGHT_ZONES; index += 1) {
    const band = zones[Math.min(index, zones.length - 1)];
    edges[index] = band?.upTo ?? 1;
    litColours.push(new Color(band?.lit ?? options.color));
    shadeColours.push(new Color(band?.shade ?? options.shadowTint ?? '#4a5f8c'));
  }

  const uniforms: ToonUniforms = {
    uShadowTint: { value: new Color(options.shadowTint ?? '#4a5f8c') },
    uShadowStrength: { value: options.shadowStrength ?? 0.85 },
    uRimColor: { value: new Color(options.rimColor ?? '#9fd8ff') },
    uRimStrength: { value: options.rimStrength ?? 0.85 },
    uRimAxis: { value: new Vector3(1, 0, 0) },
    uZoneEdge: { value: edges },
    uZoneLit: { value: litColours },
    uZoneShade: { value: shadeColours },
    uZoneRange: { value: [options.heightRange?.[0] ?? 0, options.heightRange?.[1] ?? 1] },
    uDetailBands: { value: options.detailBands ?? 4 },
    uDetailContrast: { value: options.detailContrast ?? 1.6 },
  };

  const material = new MeshToonMaterial({
    color: options.color,
    gradientMap: options.gradientMap,
    // Set so three wires up the sampler, the UV attribute and the sRGB decode.
    // The default multiply it would perform is replaced below.
    map: options.detailMap ?? null,
  }) as ToonMaterial;

  Object.defineProperty(material, 'toon', { value: uniforms, enumerable: true });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    if (useZones) {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          /* glsl */ `
          #include <common>
          varying float vZoneY;
          uniform vec2 uZoneRange;
          `,
        )
        .replace(
          '#include <begin_vertex>',
          /* glsl */ `
          #include <begin_vertex>
          // \`position\`, not \`transformed\`: this must be the bind pose, so a
          // crouch does not slide the boot band up the shins.
          vZoneY = ( position.y - uZoneRange.x )
                 / max( uZoneRange.y - uZoneRange.x, 1e-4 );
          `,
        );
    }

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
        ${useZones ? /* glsl */ `
        varying float vZoneY;
        uniform float uZoneEdge[ ${String(MAX_HEIGHT_ZONES)} ];
        uniform vec3  uZoneLit[ ${String(MAX_HEIGHT_ZONES)} ];
        uniform vec3  uZoneShade[ ${String(MAX_HEIGHT_ZONES)} ];
        ` : ''}
        ${useDetail ? /* glsl */ `
        uniform float uDetailBands;
        uniform float uDetailContrast;
        ` : ''}
        `,
      )
      // Replaces the stock albedo multiply. The vendor texture is read for its
      // luminance only, posterised, and used to pick between the zone's own two
      // colours — so authored surface detail survives without a single vendor
      // hue reaching the screen.
      .replace(
        '#include <map_fragment>',
        useDetail
          ? /* glsl */ `
        vec4 ccuDetailTexel = texture2D( map, vMapUv );
        float ccuDetailLuma = dot( ccuDetailTexel.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
        float ccuGraded = clamp( ( ccuDetailLuma - 0.5 ) * uDetailContrast + 0.5, 0.0, 1.0 );
        float ccuDetail = floor( ccuGraded * uDetailBands ) / max( uDetailBands - 1.0, 1.0 );
        ccuDetail = clamp( ccuDetail, 0.0, 1.0 );
        `
          : /* glsl */ `
        #include <map_fragment>
        float ccuDetail = 1.0;
        `,
      )
      .replace(
        '#include <color_fragment>',
        /* glsl */ `
        #include <color_fragment>
        vec3 ccuLit   = diffuseColor.rgb;
        vec3 ccuShade = uShadowTint;
        ${useZones ? /* glsl */ `
        {
          float zy = clamp( vZoneY, 0.0, 1.0 );
          ccuLit   = uZoneLit[ ${String(MAX_HEIGHT_ZONES - 1)} ];
          ccuShade = uZoneShade[ ${String(MAX_HEIGHT_ZONES - 1)} ];
          for ( int i = 0; i < ${String(MAX_HEIGHT_ZONES)}; i ++ ) {
            if ( zy <= uZoneEdge[ i ] ) {
              ccuLit   = uZoneLit[ i ];
              ccuShade = uZoneShade[ i ];
              break;
            }
          }
        }
        ` : ''}
        ${useDetail ? /* glsl */ `
        diffuseColor.rgb = mix( ccuShade, ccuLit, 0.32 + ccuDetail * 0.68 );
        ` : /* glsl */ `
        diffuseColor.rgb = ccuLit;
        `}
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
