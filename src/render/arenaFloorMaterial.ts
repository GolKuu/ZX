/**
 * Arena floor: polished obsidian with an engraved ritual circle.
 *
 * Built on `MeshStandardMaterial` rather than a bare `ShaderMaterial` on
 * purpose — the previous floor was unlit, so it took no specular from the key
 * light and could not receive the fighters' shadows. Both of those are what
 * made it read as flat vector art instead of a surface. Standing on the
 * standard material buys, for free:
 *
 *   - direct GGX specular, so the key light lays a sheen pool across the disc;
 *   - shadow receiving, so the fighters are welded to the ground;
 *   - fog and tone mapping, so the disc sits in the same air as everything else.
 *
 * Everything authored on top is injected procedurally: anti-aliased engraving,
 * a faked rift reflection streaking away from camera, and a roughness break-up
 * so the sheen is never a clean mirror.
 */

import {
  Color,
  MeshStandardMaterial,
  type ColorRepresentation,
  type IUniform,
} from 'three';

export interface ArenaFloorOptions {
  readonly radius: number;
  /** Base stone colour. Near black — the engraving supplies the value range. */
  readonly base?: ColorRepresentation;
  /** Engraved line colour. */
  readonly line?: ColorRepresentation;
  /** Outer rim glow. */
  readonly edge?: ColorRepresentation;
  /** Colour of the rift smeared across the polish. */
  readonly reflection?: ColorRepresentation;
}

export interface ArenaFloorUniforms {
  uRadius: IUniform<number>;
  uLine: IUniform<Color>;
  uEdge: IUniform<Color>;
  uReflection: IUniform<Color>;
  /** Drives the slow pulse travelling out through the engraving. */
  uTime: IUniform<number>;
}

export type ArenaFloorMaterial = MeshStandardMaterial & {
  readonly arena: ArenaFloorUniforms;
};

export function createArenaFloorMaterial(
  options: ArenaFloorOptions,
): ArenaFloorMaterial {
  const uniforms: ArenaFloorUniforms = {
    uRadius: { value: options.radius },
    uLine: { value: new Color(options.line ?? '#7b46c8') },
    uEdge: { value: new Color(options.edge ?? '#d78cff') },
    uReflection: { value: new Color(options.reflection ?? '#8c46e0') },
    uTime: { value: 0 },
  };

  // Albedo and metalness are a shadow-legibility decision, not a taste one. At
  // near-black with metalness 0.42 the disc took almost no diffuse from the key
  // light, so the shadow map was being rendered correctly and then subtracting
  // nothing — the fighters read as unlit cut-outs pasted on the floor. A
  // dielectric surface with a real albedo gives the shadow something to remove,
  // and the low roughness keeps the polished sheen that made it worth doing.
  const material = new MeshStandardMaterial({
    color: new Color(options.base ?? '#3a2b58'),
    metalness: 0.12,
    roughness: 0.4,
    dithering: true,
  }) as ArenaFloorMaterial;

  Object.defineProperty(material, 'arena', { value: uniforms, enumerable: true });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec2 vArenaXz;
        `,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        vArenaXz = ( modelMatrix * vec4( transformed, 1.0 ) ).xz;
        `,
      );

    shader.fragmentShader = shader.fragmentShader
      // `getShadowMask()` is not part of the physical material — it ships with
      // the unlit path. Pulling it in here is what lets the *emissive* pattern
      // be occluded, which on a stage this dark is the only way a cast shadow
      // reads at all: the disc's value comes mostly from its own glow, so a
      // shadow that only removes direct light removes nothing visible.
      .replace(
        '#include <shadowmap_pars_fragment>',
        /* glsl */ `
        #include <shadowmap_pars_fragment>
        #include <shadowmask_pars_fragment>
        `,
      )
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec2  vArenaXz;
        uniform float uRadius;
        uniform vec3  uLine;
        uniform vec3  uEdge;
        uniform vec3  uReflection;
        uniform float uTime;

        // Anti-aliased band around \`target\`. Screen-space derivative width, so
        // the engraving stays one pixel wide at every distance instead of
        // dissolving into the shimmer the old floor had at the horizon.
        float arenaBand( float value, float target, float halfWidth ) {
          float d = abs( value - target );
          float aa = fwidth( value ) * 1.2 + 1e-5;
          return 1.0 - smoothstep( halfWidth, halfWidth + aa, d );
        }

        float arenaHash( vec2 p ) {
          return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 );
        }

        float arenaNoise( vec2 p ) {
          vec2 i = floor( p ), f = fract( p );
          vec2 u = f * f * ( 3.0 - 2.0 * f );
          return mix(
            mix( arenaHash( i ), arenaHash( i + vec2( 1.0, 0.0 ) ), u.x ),
            mix( arenaHash( i + vec2( 0.0, 1.0 ) ), arenaHash( i + vec2( 1.0, 1.0 ) ), u.x ),
            u.y
          );
        }
        `,
      )
      // Break the polish up before lighting runs, so the sheen has grain.
      .replace(
        '#include <roughnessmap_fragment>',
        /* glsl */ `
        #include <roughnessmap_fragment>
        float arenaGrain = arenaNoise( vArenaXz * 2.6 ) * 0.6
                         + arenaNoise( vArenaXz * 11.0 ) * 0.4;
        roughnessFactor = clamp( roughnessFactor * ( 0.72 + arenaGrain * 0.75 ), 0.05, 1.0 );
        `,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `
        #include <emissivemap_fragment>
        {
          float dist = length( vArenaXz );
          float t    = clamp( dist / uRadius, 0.0, 1.0 );

          // 1.0 lit, 0.0 fully shadowed. Everything the disc emits is scaled by
          // this, so a fighter standing on the circle visibly snuffs the
          // engraving out beneath themselves.
          float lit = getShadowMask();
          float glow = mix( 0.16, 1.0, lit );

          // --- engraving ----------------------------------------------------
          // Three weighted rings rather than a uniform comb: an even repeat
          // reads as graph paper, a hierarchy reads as something built.
          //
          // Kept deliberately dim. The disc is the floor of the shot, not its
          // subject — the moment the engraving out-values the fighters, the eye
          // goes to the ground and the fight stops reading.
          float engrave =
              arenaBand( dist, uRadius * 0.30, 0.008 ) * 0.45
            + arenaBand( dist, uRadius * 0.56, 0.013 ) * 0.70
            + arenaBand( dist, uRadius * 0.78, 0.008 ) * 0.45
            + arenaBand( dist, uRadius * 0.90, 0.020 ) * 0.90;

          // A pulse walking outward keeps the disc alive between rounds.
          float pulse = smoothstep( 0.13, 0.0, abs( t - fract( uTime * 0.11 ) ) );
          engrave += pulse * 0.16;

          totalEmissiveRadiance += uLine * engrave * 0.30 * glow;

          // --- rim ------------------------------------------------------------
          // The rim is a light source in its own right and reads as the arena's
          // boundary, so it keeps most of its value in shadow.
          float rim = smoothstep( 0.93, 0.985, t ) * ( 1.0 - smoothstep( 0.995, 1.0, t ) );
          totalEmissiveRadiance += uEdge * rim * 1.15 * mix( 0.7, 1.0, lit );

          // --- faked rift reflection -------------------------------------------
          // The rift sits behind the arena and is the brightest thing in the
          // scene, so the polish has to carry it. A real SSR pass costs more
          // than this is worth: a widening streak, dimming as it nears camera,
          // sells the same read.
          float depth  = clamp( ( vArenaXz.y + uRadius ) / ( 2.0 * uRadius ), 0.0, 1.0 );
          float width  = 0.42 + depth * 2.9;
          float streak = exp( -( vArenaXz.x * vArenaXz.x ) / ( width * width ) );
          float fade   = pow( 1.0 - depth, 1.5 );
          float wobble = 0.78 + arenaNoise( vArenaXz * 3.1 + vec2( 0.0, uTime * 0.25 ) ) * 0.44;
          totalEmissiveRadiance += uReflection * streak * fade * wobble * 0.34 * glow;

          // Slight centre falloff. Deliberately gentle: the fighters stand in
          // the middle of this disc, and darkening the ground they occupy is
          // the same mistake as a black floor — it leaves their cast shadow
          // nothing to be darker than.
          diffuseColor.rgb *= mix( 0.82, 1.05, t );
        }
        `,
      );
  };

  material.customProgramCacheKey = () => 'ccu-arena-floor-v1';

  return material;
}
