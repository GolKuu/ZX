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

export const floorVertex = /* glsl */ `
  varying vec2 vXz;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vXz = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const floorFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uEdge;
  uniform float uRadius;
  varying vec2 vXz;

  void main() {
    float dist = length(vXz);
    float t = clamp(dist / uRadius, 0.0, 1.0);
    vec3 color = mix(uBase, uBase * 0.55, t);
    float rings = abs(fract(dist * 1.55) - 0.5) * 2.0;
    color += uLine * smoothstep(0.94, 1.0, rings) * (0.25 + t * 0.35);
    float edge = smoothstep(0.82, 0.97, t) * (1.0 - smoothstep(0.985, 1.0, t));
    color += uEdge * edge * 0.82;
    color += uLine * smoothstep(0.055, 0.0, abs(dist - 0.42)) * 0.5;
    gl_FragColor = vec4(color, 1.0);
  }
`;

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
