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
    // The disc is a lid laid on top of the stone platform that carries it, so
    // it is coplanar with that stone to within a few centimetres across fifteen
    // metres — a depth fight the buffer cannot win at this range. It showed as
    // torn black islands eating into the engraved rim, which looked like damage
    // to the artwork rather than like a rendering fault. Biasing the disc toward
    // the camera in depth only, without moving it in the world, is the fix this
    // is for: the lid always wins, the platform never pokes through.
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -6,
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
        // The disc's *own* coordinates, not the world's.
        //
        // This used to project the vertex into world space and read its xz.
        // That ties the pattern to wherever the disc happens to sit and however
        // it happens to be scaled — and the stage now squashes the platform
        // along the camera axis, which stretched \`length()\` into an ellipse
        // that no longer reached 1.0 anywhere except the extreme left and right
        // edges. Every band keyed off that radius therefore bunched up and tore
        // at exactly those two points. Reading the local vertex keeps the
        // engraving a true circle in the disc's own frame, and the squash then
        // foreshortens the whole pattern along with the geometry, which is what
        // was wanted in the first place.
        //
        // The plane is authored in local XY and laid flat by a -90° turn about
        // X, so local +y becomes world -z; the negation keeps "away from the
        // camera" pointing the same way for the reflection streak below.
        vArenaXz = vec2( transformed.x, -transformed.y );
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

        // Hash without \`sin\`.
        //
        // The usual \`fract(sin(dot(p, k)) * 43758)\` breaks down once \`p\` gets
        // large, and the grain below samples this at eleven times world scale —
        // so across a 15 m disc the argument runs into the tens of thousands and
        // the GPU's \`sin\` has no mantissa left to resolve it. Neighbouring
        // pixels collapse onto the same value, and the "noise" comes out as flat
        // torn islands. Those islands were baked into the surface roughness,
        // which is why they only showed where the rim is bright enough to carry
        // a specular: a permanent black tear in the arena's edge glow.
        //
        // This variant only ever multiplies fractions, so its precision does not
        // depend on how far from the origin it is asked.
        float arenaHash( vec2 p ) {
          vec3 q = fract( vec3( p.xyx ) * vec3( 0.1031, 0.1030, 0.0973 ) );
          q += dot( q, q.yzx + 33.33 );
          return fract( ( q.x + q.y ) * q.z );
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
        // Floor of 0.18, not 0.05.
        //
        // Below roughly 0.15 the GGX specular collapses toward a mirror: the
        // distribution term spikes, its geometry term divides by something
        // approaching zero, and on a surface this close to a bright point light
        // the result overflows to a non-number. A NaN is written out as pure
        // black, which is what was tearing holes in the arena's edge glow. The
        // polish is unaffected — 0.18 is still a wet floor.
        roughnessFactor = clamp( roughnessFactor * ( 0.72 + arenaGrain * 0.75 ), 0.18, 1.0 );
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
          // this, so a fighter standing on the circle visibly dims the
          // engraving beneath themselves.
          //
          // The shadowed floor is 0.55 rather than 0.16. At 0.16 the emissive
          // was effectively switched off wherever the mask dipped, so *any*
          // wobble in the mask — shadow-map aliasing, a grazing depth compare —
          // punched a hard black hole through the bright rim. Keeping most of
          // the glow in shade means the same wobble costs a little brightness
          // instead of tearing a shape out of the artwork.
          float lit = getShadowMask();
          float glow = mix( 0.55, 1.0, lit );

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
          // Wider and softer than it was, and roughly half as hot. A narrow
          // rim at 1.15 clipped to a solid stripe of pure hue that sat at the
          // bottom of frame competing with the fighters; a broad, dimmer band
          // reads as the edge of the platform catching light, which is what it
          // is supposed to be.
          //
          // The outer cut this used to carry — a second smoothstep switching
          // the rim off again over the last half-percent of the radius — is
          // gone. It was guarding against bleed past an edge the geometry
          // already ends at, and all it actually did was carve a hard notch
          // into the brightest band on the stage.
          //
          // A quarter of its old strength. A self-illuminated ring around the
          // fighting area belongs to an arcade cabinet, not to a lit room: it
          // was the brightest thing in frame, brighter than either fighter, and
          // it sat along the bottom edge dragging the eye off the fight. At
          // this level it reads as the platform's edge catching the braziers,
          // which is what the stage should be saying.
          float rim = smoothstep( 0.86, 0.99, t );
          totalEmissiveRadiance += uEdge * rim * 0.16 * mix( 0.8, 1.0, lit );

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

          // Scrub. Everything above is procedural, and a single non-finite
          // value anywhere in it is written out as pure black and then smeared
          // across the neighbourhood by the bloom — which is how a shading
          // detail turns into a hole torn in the arena. \`max\` against zero
          // discards a NaN on every implementation that lowers it to a compare,
          // and the ceiling keeps an overflow out of the HDR buffer the
          // composite chain reads.
          totalEmissiveRadiance =
            min( max( totalEmissiveRadiance, vec3( 0.0 ) ), vec3( 12.0 ) );
          diffuseColor.rgb =
            min( max( diffuseColor.rgb, vec3( 0.0 ) ), vec3( 4.0 ) );
        }
        `,
      )
      // Final guard, after the lighting model has run. The procedural roughness
      // feeds a specular term evaluated against lights that sit centimetres off
      // this surface, so the last chance to catch a non-number is here.
      .replace(
        '#include <dithering_fragment>',
        /* glsl */ `
        #include <dithering_fragment>
        gl_FragColor.rgb =
          min( max( gl_FragColor.rgb, vec3( 0.0 ) ), vec3( 24.0 ) );
        `,
      );
  };

  material.customProgramCacheKey = () => 'ccu-arena-floor-v1';

  return material;
}
