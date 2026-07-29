import { AdditiveBlending, Color, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uProgress;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec2 point = vUv - 0.5;
    point.x *= 1.6;
    float radius = length(point);
    float angle = atan(point.y, point.x);
    float progress = clamp(uProgress, 0.0, 1.0);
    float ringRadius = progress * 0.68;
    float ring = 1.0 - smoothstep(0.012, 0.048, abs(radius - ringRadius));
    float rayShape = pow(abs(sin(angle * 17.0 + progress * 8.0)), 35.0);
    float rays = rayShape * (1.0 - smoothstep(0.06, 0.72, radius));
    float core = 1.0 - smoothstep(0.0, 0.16 * (1.0 - progress) + 0.01, radius);
    float fade = 1.0 - smoothstep(0.4, 1.0, progress);
    float energy = (ring * 1.5 + rays * 0.65 + core * 2.4) * fade * uStrength;
    vec3 color = mix(vec3(1.0), uColor, smoothstep(0.0, 0.35, radius));
    gl_FragColor = vec4(color * energy * 2.2, clamp(energy, 0.0, 0.92));
  }
`;

export function createImpactMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color('#68dbff') },
      uProgress: { value: 1 },
      uStrength: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
}
