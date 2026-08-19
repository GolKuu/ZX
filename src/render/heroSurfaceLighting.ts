import { Color, Vector2, Vector3, type Material } from 'three';

/**
 * Relights a flat character atlas as if it were a surface in the room.
 *
 * The fighters are cut-out frames drawn on a camera-facing plane with an
 * unlit material, which is why they read as stickers: no light in the scene
 * can touch them, so their value range is whatever the atlas was painted at
 * and never agrees with the stage behind them.
 *
 * A cut-out has no normals, but it has two gradients that stand in for one:
 *
 *   - the **alpha** gradient, which points inward everywhere along the
 *     silhouette and nowhere in the interior. Negated, it is the outward-facing
 *     shell normal — the thing that makes an edge catch a rim.
 *   - the **luminance** gradient, which tracks the creases, plates and muscle
 *     the artwork already draws. It is not a real height field, but at this
 *     scale the eye cannot tell a derived normal from an authored one.
 *
 * Combining them yields a normal good enough for a wrapped diffuse term, a
 * tight specular and a rim — which is the whole reason a lit sprite sits in a
 * scene and an unlit one floats above it.
 */

export interface HeroSurfaceUniforms {
  readonly uKeyDirection: { value: Vector3 };
  readonly uKeyColor: { value: Color };
  readonly uFillColor: { value: Color };
  readonly uBounceColor: { value: Color };
  readonly uRimColor: { value: Color };
  readonly uAccentColor: { value: Color };
  readonly uTexel: { value: Vector2 };
  /** Motion smear in atlas-UV space; zero holds the frame pin-sharp. */
  readonly uSmear: { value: Vector2 };
  /** Overlapping-action lag, in world units at the top of the head. */
  readonly uBend: { value: Vector2 };
  /** Where the feet sit in the plane, 0 at the bottom edge. */
  readonly uFootLine: { value: number };
  /** Plane height in local units, so the bend can normalise `position.y`. */
  readonly uPlaneHeight: { value: number };
  readonly uFlip: { value: number };
  readonly uKeyStrength: { value: number };
  readonly uFillStrength: { value: number };
  readonly uBounceStrength: { value: number };
  readonly uExposure: { value: number };
  readonly uRimStrength: { value: number };
  readonly uSpecularStrength: { value: number };
  readonly uContourStrength: { value: number };
}

export interface HeroSurfaceOptions {
  /** Key direction in stage space; x is mirrored with the sprite's facing. */
  readonly keyDirection?: Vector3;
  readonly keyColor?: string;
  /** Ambient/sky term. Keeps the shadow side a colour rather than a hole. */
  readonly fillColor?: string;
  /** Warm floor bounce lifting the undersides. */
  readonly bounceColor?: string;
  readonly rimColor?: string;
  /** Character-signature tint laid into the specular. */
  readonly accentColor?: string;
  /** Atlas dimensions in pixels, for the gradient taps. */
  readonly atlasSize?: number;
  /** Height of the sprite plane in local units. */
  readonly planeHeight?: number;
  readonly keyStrength?: number;
  readonly fillStrength?: number;
  readonly bounceStrength?: number;
  readonly exposure?: number;
  readonly rimStrength?: number;
  readonly specularStrength?: number;
  /** Depth of the drawn inner edge that replaces the old ink-shell planes. */
  readonly contourStrength?: number;
}

const DEFAULTS = {
  // Matches the stage key in `StageLighting` (position [-6.2, 9.4, 6.6]) so the
  // fighters are lit by the same source as the architecture around them.
  keyDirection: new Vector3(-6.2, 9.4, 6.6).normalize(),
  keyColor: '#ffe9d2',
  fillColor: '#2b3550',
  bounceColor: '#5a2f1e',
  rimColor: '#8fd4ff',
  accentColor: '#ffffff',
  atlasSize: 4096,
  planeHeight: 3.05,
  keyStrength: 1.16,
  fillStrength: 0.36,
  bounceStrength: 0.24,
  exposure: 1.0,
  rimStrength: 0.85,
  specularStrength: 0.5,
  contourStrength: 0.45,
} as const;

/**
 * Strips level out of a colour, leaving hue.
 *
 * These hexes are picked by eye as "warm key", "cool fill" — they are meant to
 * say *what colour* the light is, not how much of it there is. But `Color`
 * decodes them sRGB-to-linear, so a plausible-looking dark fill hex such as
 * #2e2b46 arrives as roughly 0.03 of linear intensity and silently removes two
 * thirds of the exposure. Normalising to a unit peak channel keeps the hue and
 * hands the level to the strength uniforms, where it can be reasoned about.
 */
function unitColor(hex: string): Color {
  const color = new Color(hex);
  const peak = Math.max(color.r, color.g, color.b);
  return peak > 0 ? color.multiplyScalar(1 / peak) : color;
}

export function createHeroSurfaceUniforms(
  options: HeroSurfaceOptions = {},
): HeroSurfaceUniforms {
  const atlasSize = options.atlasSize ?? DEFAULTS.atlasSize;
  return {
    uKeyDirection: {
      value: (options.keyDirection ?? DEFAULTS.keyDirection).clone(),
    },
    uKeyColor: { value: unitColor(options.keyColor ?? DEFAULTS.keyColor) },
    uFillColor: { value: unitColor(options.fillColor ?? DEFAULTS.fillColor) },
    uBounceColor: { value: unitColor(options.bounceColor ?? DEFAULTS.bounceColor) },
    uRimColor: { value: unitColor(options.rimColor ?? DEFAULTS.rimColor) },
    uAccentColor: { value: unitColor(options.accentColor ?? DEFAULTS.accentColor) },
    uTexel: { value: new Vector2(1 / atlasSize, 1 / atlasSize) },
    uSmear: { value: new Vector2(0, 0) },
    uBend: { value: new Vector2(0, 0) },
    uFootLine: { value: 0.09 },
    uPlaneHeight: { value: options.planeHeight ?? DEFAULTS.planeHeight },
    uFlip: { value: 1 },
    uKeyStrength: { value: options.keyStrength ?? DEFAULTS.keyStrength },
    uFillStrength: { value: options.fillStrength ?? DEFAULTS.fillStrength },
    uBounceStrength: {
      value: options.bounceStrength ?? DEFAULTS.bounceStrength,
    },
    uExposure: { value: options.exposure ?? DEFAULTS.exposure },
    uRimStrength: { value: options.rimStrength ?? DEFAULTS.rimStrength },
    uSpecularStrength: {
      value: options.specularStrength ?? DEFAULTS.specularStrength,
    },
    uContourStrength: {
      value: options.contourStrength ?? DEFAULTS.contourStrength,
    },
  };
}

/**
 * `onBeforeCompile` hook installing the relight into a `MeshBasicMaterial`.
 *
 * Basic, not Standard, on purpose: the plane's real geometric normal points at
 * the camera and carries no information, so three's own lighting would shade
 * every fighter as one flat card. All the modelling here comes from the derived
 * normal, and none of it from the mesh.
 */
export function applyHeroSurfaceLighting(
  uniforms: HeroSurfaceUniforms,
): (shader: Parameters<NonNullable<Material['onBeforeCompile']>>[0]) => void {
  return (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `${HERO_BEND_HEAD}
#include <common>`)
      .replace('#include <begin_vertex>', HERO_BEND_BODY);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `${HERO_SURFACE_HEAD}\n#include <common>`)
      .replace('#include <map_fragment>', HERO_SURFACE_BODY);
  };
}

const HERO_BEND_HEAD = /* glsl */ `
uniform vec2 uBend;
uniform float uFootLine;
uniform float uPlaneHeight;
`;

/**
 * Overlapping action, applied to the mesh rather than to the transform.
 *
 * Every bit of motion on these fighters so far moves the whole quad rigidly:
 * the sprite slides, rotates and scales as one card. Real bodies do not do
 * that. When a fighter accelerates, the feet go first and the head arrives
 * last, and the body is bent between them for the whole of the acceleration.
 * That lag -- drag, overlap, follow-through, depending on whose vocabulary --
 * is most of what separates animation with weight from a picture being moved
 * around, and it is the one classical principle a rigid quad cannot express.
 *
 * A flat cel can, though, as long as it has vertices to bend. The plane is
 * subdivided and displaced here, anchored at the foot line so the contact
 * point never slides: the offset is zero at the feet and grows quadratically
 * to full value at the crown, which is what a body pivoting about its ankles
 * actually does.
 */
const HERO_BEND_BODY = /* glsl */ `
  vec3 transformed = vec3(position);
  // Height above the feet, normalised. Anything below the foot line -- the
  // empty margin at the bottom of the cel -- is pinned.
  float heroFoot = (position.y / max(uPlaneHeight, 0.001)) + 0.5;
  float heroUp = clamp((heroFoot - uFootLine) / max(1.0 - uFootLine, 0.001), 0.0, 1.0);
  float heroLever = heroUp * heroUp;
  transformed.x += uBend.x * heroLever;
  transformed.y += uBend.y * heroLever;
`;

const HERO_SURFACE_HEAD = /* glsl */ `
uniform vec3 uKeyDirection;
uniform vec3 uKeyColor;
uniform vec3 uFillColor;
uniform vec3 uBounceColor;
uniform vec3 uRimColor;
uniform vec3 uAccentColor;
uniform vec2 uTexel;
uniform vec2 uSmear;
uniform float uFlip;
uniform float uKeyStrength;
uniform float uFillStrength;
uniform float uBounceStrength;
uniform float uExposure;
uniform float uRimStrength;
uniform float uSpecularStrength;
uniform float uContourStrength;

float heroLuma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/**
 * Directional smear along the direction of travel.
 *
 * A fighting game runs at 60fps with no motion blur, so a limb crossing the
 * screen in four frames is drawn four times, pin-sharp, in four unrelated
 * places -- it strobes instead of moving. Hand-drawn fighters solve this with
 * smear frames: on the fastest frames the artist draws the limb stretched
 * along its path. Every 3D fighter does the same thing with per-object motion
 * blur.
 *
 * Neither is available on a 16-frame atlas, but the effect is: sampling the
 * cel along the travel direction and averaging *is* a smear frame, generated
 * per pixel. Seven taps is enough to read as continuous at the offsets this
 * is driven at, and the whole thing collapses to a single tap when standing
 * still, so neutral costs nothing.
 */
vec4 heroSmearSample(sampler2D tex, vec2 uv, vec2 smear) {
  if (dot(smear, smear) < 1e-9) return texture2D(tex, uv);
  vec4 total = vec4(0.0);
  float weight = 0.0;
  for (int i = -3; i <= 3; i++) {
    float t = float(i) / 3.0;
    // Triangular weighting: the current pose stays dominant and the trail
    // falls off, rather than the limb dissolving into an even ghost.
    float w = 1.0 - abs(t) * 0.7;
    total += texture2D(tex, uv + smear * t) * w;
    weight += w;
  }
  return total / weight;
}
`;

const HERO_SURFACE_BODY = /* glsl */ `
#ifdef USE_MAP
  vec2 heroTexel = uTexel;
  vec4 heroCenter = heroSmearSample(map, vMapUv, uSmear);

  // Alpha taps: the silhouette shell.
  float heroAL = texture2D(map, vMapUv - vec2(heroTexel.x, 0.0)).a;
  float heroAR = texture2D(map, vMapUv + vec2(heroTexel.x, 0.0)).a;
  float heroAD = texture2D(map, vMapUv - vec2(0.0, heroTexel.y)).a;
  float heroAU = texture2D(map, vMapUv + vec2(0.0, heroTexel.y)).a;

  // Luminance taps, two texels out: the interior form. A wider tap than the
  // alpha one, because single-texel luminance noise in a compressed atlas is
  // grain, not shape.
  vec2 heroWide = heroTexel * 2.0;
  float heroLL = heroLuma(texture2D(map, vMapUv - vec2(heroWide.x, 0.0)).rgb);
  float heroLR = heroLuma(texture2D(map, vMapUv + vec2(heroWide.x, 0.0)).rgb);
  float heroLD = heroLuma(texture2D(map, vMapUv - vec2(0.0, heroWide.y)).rgb);
  float heroLU = heroLuma(texture2D(map, vMapUv + vec2(0.0, heroWide.y)).rgb);

  float heroEdge = length(vec2(heroAR - heroAL, heroAU - heroAD));
  vec2 heroShell = -vec2(heroAR - heroAL, heroAU - heroAD) * 2.4;
  vec2 heroForm = -vec2(heroLR - heroLL, heroLU - heroLD) * 1.35;
  vec3 heroNormal = normalize(vec3((heroShell + heroForm) * uFlip, 0.9));

  vec3 heroKeyDir = normalize(vec3(uKeyDirection.x * uFlip, uKeyDirection.yz));

  // Wrapped diffuse. A hard N·L on a derived normal collapses half the body to
  // black; wrapping keeps the shadow side described instead of destroyed.
  float heroNdL = dot(heroNormal, heroKeyDir);
  // The max() on the base is not defensive noise. heroNdL is a dot of two
  // normalised vectors, so it reaches -1.0 exactly, and rounding takes it a
  // hair past; pow() of a negative base is NaN. One NaN fragment is enough to
  // white out the entire frame, because the bloom pass averages it into every
  // mip level and NaN wins every average it takes part in.
  float heroWrap = max(heroNdL * 0.5 + 0.5, 0.0);
  float heroDiffuse = mix(pow(heroWrap, 1.6), max(heroNdL, 0.0), 0.45);

  // Floor bounce: up-facing surfaces get nothing, down-facing get the fire.
  float heroBounce = max(0.0, -heroNormal.y) * 0.55 + 0.12;

  float heroFresnel = pow(max(1.0 - clamp(heroNormal.z, 0.0, 1.0), 0.0), 2.6);
  float heroRim = heroFresnel * smoothstep(0.05, 0.55, heroEdge);

  vec3 heroHalf = normalize(heroKeyDir + vec3(0.0, 0.0, 1.0));
  float heroGloss = pow(max(dot(heroNormal, heroHalf), 0.0), 34.0);
  // Only the already-bright plates glint. Cloth and shadow stay matte.
  float heroGlossMask = smoothstep(0.35, 0.85, heroLuma(heroCenter.rgb));

  // Levels are carried by the strengths, never by how dark the hex looked.
  // Summed at an average heroDiffuse this lands a little above 1.0, so the
  // relight lifts the artwork instead of dimming it.
  vec3 heroLit = heroCenter.rgb * (
    uFillColor * uFillStrength
    + uKeyColor * (heroDiffuse * uKeyStrength)
    + uBounceColor * (heroBounce * uBounceStrength)
  );
  // Drawn inner edge. The silhouette band is darkened everywhere the rim is
  // not already lighting it, which gives the fighter a contour that separates
  // it from a dark stage — the job the eight ink planes used to do, except
  // this one lands inside the alpha ramp and is therefore antialiased.
  float heroContour = smoothstep(0.12, 0.7, heroEdge);
  heroLit *= 1.0 - heroContour * uContourStrength * (1.0 - min(heroRim, 1.0));

  heroLit += uRimColor * heroRim * uRimStrength;
  heroLit += mix(uKeyColor, uAccentColor, 0.4)
    * heroGloss * heroGlossMask * uSpecularStrength;

  diffuseColor *= vec4(max(heroLit * uExposure, vec3(0.0)), heroCenter.a);
#endif
`;
