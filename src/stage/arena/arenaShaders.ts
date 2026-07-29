export const domeVertex = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const domeFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uStorm;
  varying vec3 vLocal;

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
    vec3 dir = normalize(vLocal);
    float height = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 sky = mix(uHorizon, uTop, pow(height, 0.75));
    vec2 uv = vec2(atan(dir.z, dir.x) * 1.4, dir.y * 2.6);
    float churn = noise(uv * 1.6);
    churn += noise(uv * 3.7) * 0.5;
    float band = smoothstep(0.62, 0.06, abs(dir.y - 0.06));
    sky += uStorm * churn * band * 0.42;
    gl_FragColor = vec4(sky, 1.0);
  }
`;

// The floor is no longer an unlit ShaderMaterial — it moved to
// `src/render/arenaFloorMaterial.ts` so it can take specular from the key light
// and receive the fighters' shadows.

export const shaftVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const shaftFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float core = smoothstep(0.5, 0.02, abs(vUv.x - 0.5));
    float endFade = smoothstep(0.0, 0.16, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
    float bands = 0.72 + sin(vUv.y * 29.0) * 0.08;
    gl_FragColor = vec4(uColor, core * endFade * bands * 0.22);
  }
`;
