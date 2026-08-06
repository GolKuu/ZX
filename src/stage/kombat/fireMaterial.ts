import { AdditiveBlending, Color, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Flame on a billboard, drawn rather than simulated.
 *
 * A particle fire costs a draw call per brazier and still needs art. This is
 * one quad: a tapering body mask multiplied by upward-scrolling noise, graded
 * white at the base to deep orange at the tip. It reads correctly because fire
 * is read by silhouette and colour ramp, not by individual embers — and the
 * point light next to it, which does the actual lighting, is what sells it.
 */
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform vec3  uFlame;
  uniform vec3  uCore;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    float rise = uTime * 1.35 + uSeed;
    vec2 flow = vec2(vUv.x * 3.0, vUv.y * 2.2 - rise);
    float turbulence = noise(flow) * 0.6 + noise(flow * 2.4 + 11.0) * 0.4;

    // Body: waist-in toward the tip, wandering left and right as it climbs.
    float sway = (noise(vec2(uSeed, uTime * 0.8 + vUv.y * 1.6)) - 0.5) * 0.22 * vUv.y;
    float width = mix(0.34, 0.06, pow(vUv.y, 0.75));
    float body = 1.0 - smoothstep(width * 0.55, width, abs(vUv.x - 0.5 - sway));

    float height = (1.0 - smoothstep(0.25, 1.0, vUv.y)) * smoothstep(0.0, 0.12, vUv.y);
    float flame = body * height * (0.55 + turbulence * 0.85);
    flame = clamp(flame - vUv.y * 0.18, 0.0, 1.0);

    vec3 colour = mix(uFlame, uCore, pow(clamp(flame * 1.5, 0.0, 1.0), 2.0));
    colour = mix(colour * 0.72, colour, 1.0 - vUv.y);
    gl_FragColor = vec4(colour * (0.8 + flame), flame * 0.95);
  }
`;

export function createFireMaterial(flame: string, core: string, seed: number) {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSeed: { value: seed },
      uFlame: { value: new Color(flame) },
      uCore: { value: new Color(core) },
    },
    vertexShader,
    fragmentShader,
    blending: AdditiveBlending,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    transparent: true,
  });
}
