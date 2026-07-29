/**
 * Refraction barrier shader.
 *
 * A screen-space distortion shell that bends what is behind it without adding a
 * visible surface. Used for the spatial-nullification state: the barrier must be
 * legible as "your attack is not arriving" while staying nearly invisible, so it
 * refracts and rim-lights but never fills.
 *
 * Consumers supply `uScene` (the rendered frame) and drive `uStrength` from the
 * gauge. Strength 0 must be a visual no-op so the material can stay mounted.
 */

export const REFRACTION_BARRIER_VERTEX = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying vec2 vScreenUv;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 clipPosition = projectionMatrix * viewPosition;

    vViewNormal = normalize(normalMatrix * normal);
    vViewPosition = viewPosition.xyz;
    vScreenUv = (clipPosition.xy / clipPosition.w) * 0.5 + 0.5;

    gl_Position = clipPosition;
  }
`;

export const REFRACTION_BARRIER_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uScene;
  uniform float uTime;
  uniform float uStrength;      // 0..1, gauge-driven
  uniform float uRefraction;    // screen-space offset in UV units
  uniform vec3  uRimColor;
  uniform float uRimPower;
  uniform float uImpact;        // 0..1, spikes for a few frames on absorb
  uniform vec2  uImpactPoint;   // screen UV of the absorbed hit

  varying vec3 vViewNormal;
  varying vec3 vViewPosition;
  varying vec2 vScreenUv;

  // Cheap value noise. Three octaves is enough at this scale and keeps the
  // shader inside the mobile ALU budget.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float total = 0.0;
    total += valueNoise(p) * 0.55;
    total += valueNoise(p * 2.13) * 0.30;
    total += valueNoise(p * 4.37) * 0.15;
    return total;
  }

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDir = normalize(-vViewPosition);
    float facing = clamp(dot(normal, viewDir), 0.0, 1.0);

    // Fresnel: opaque distortion at grazing angles, nothing head-on.
    float fresnel = pow(1.0 - facing, uRimPower);

    // Slow drift so the shell reads as alive rather than as a decal.
    vec2 flowUv = vScreenUv * 6.0 + vec2(uTime * 0.05, uTime * -0.08);
    float turbulence = fbm(flowUv) - 0.5;

    // Ripple radiating from the absorbed hit, one-shot per absorb.
    float impactDistance = distance(vScreenUv, uImpactPoint);
    float ripple = sin(impactDistance * 48.0 - uTime * 24.0);
    ripple *= exp(-impactDistance * 7.0) * uImpact;

    // Offset the background sample along the surface normal.
    vec2 offset = normal.xy * (uRefraction * (fresnel + 0.25));
    offset += normal.xy * turbulence * uRefraction * 0.8;
    offset += normalize(vScreenUv - uImpactPoint + 1e-5) * ripple * 0.03;
    offset *= uStrength;

    vec2 sampleUv = clamp(vScreenUv + offset, vec2(0.001), vec2(0.999));

    // Light chromatic split — the distortion should read as space bending, not
    // as glass, so the split is subtle and only on the refracted sample.
    float split = uRefraction * 0.35 * uStrength;
    vec3 refracted;
    refracted.r = texture2D(uScene, sampleUv + normal.xy * split).r;
    refracted.g = texture2D(uScene, sampleUv).g;
    refracted.b = texture2D(uScene, sampleUv - normal.xy * split).b;

    // Rim contribution. Kept below the character bloom ceiling so the barrier
    // never competes with an aura for the emissive layer.
    float rim = fresnel * uStrength;
    rim += abs(ripple) * 0.6;
    vec3 color = refracted + uRimColor * rim * 0.45;

    // Alpha follows the rim so the centre of the shell stays clear.
    float alpha = clamp(rim * 1.15 + abs(ripple) * 0.5, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha * step(0.001, uStrength));
  }
`;

export interface RefractionBarrierUniformValues {
  uScene: { value: unknown };
  uTime: { value: number };
  uStrength: { value: number };
  uRefraction: { value: number };
  uRimColor: { value: readonly [number, number, number] };
  uRimPower: { value: number };
  uImpact: { value: number };
  uImpactPoint: { value: readonly [number, number] };
}

/** Circle Blue, matching the HUD accent in `docs/UI-CCU-700-ui-ux.md`. */
export const BARRIER_RIM_COLOR: readonly [number, number, number] = [
  0.624, 0.847, 1.0,
];

export function createRefractionBarrierUniforms(): RefractionBarrierUniformValues {
  return {
    uScene: { value: null },
    uTime: { value: 0 },
    uStrength: { value: 0 },
    uRefraction: { value: 0.018 },
    uRimColor: { value: BARRIER_RIM_COLOR },
    uRimPower: { value: 2.6 },
    uImpact: { value: 0 },
    uImpactPoint: { value: [0.5, 0.5] },
  };
}

/** Frames the absorb ripple takes to decay. */
export const BARRIER_IMPACT_DECAY_FRAMES = 18;

/**
 * Advance the one-shot impact ripple. Call once per rendered frame with the
 * simulation's delta so the decay is frame-rate independent.
 */
export function decayBarrierImpact(
  uniforms: RefractionBarrierUniformValues,
  deltaFrames: number,
): void {
  if (uniforms.uImpact.value <= 0) {
    return;
  }
  const step = deltaFrames / BARRIER_IMPACT_DECAY_FRAMES;
  uniforms.uImpact.value = Math.max(0, uniforms.uImpact.value - step);
}

/** Trigger the ripple. `point` is screen UV, origin bottom-left. */
export function triggerBarrierImpact(
  uniforms: RefractionBarrierUniformValues,
  point: readonly [number, number],
): void {
  uniforms.uImpact.value = 1;
  uniforms.uImpactPoint.value = point;
}
