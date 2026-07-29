import { Color, ShaderMaterial, type ColorRepresentation } from 'three';

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
  varying vec2 vUv;

  void main() {
    vec2 point = (vUv - 0.5) * 2.0;
    point.x *= 0.82;

    float radius = length(point);
    float ring = 1.0 - smoothstep(0.035, 0.11, abs(radius - 0.62));
    float forwardArc = smoothstep(-0.18, 0.38, point.x);

    float slashDistance = abs(point.y - point.x * 0.24);
    float slash = 1.0 - smoothstep(0.025, 0.1, slashDistance);
    slash *= smoothstep(-0.2, 0.28, point.x);
    slash *= 1.0 - smoothstep(0.42, 1.04, point.x);

    float fadeIn = smoothstep(0.0, 0.14, uProgress);
    float fadeOut = 1.0 - smoothstep(0.42, 1.0, uProgress);
    float life = fadeIn * fadeOut;
    float energy = (ring * forwardArc + slash * 0.7) * life;

    gl_FragColor = vec4(uColor * (0.9 + energy * 0.35), energy * 0.68);
  }
`;

export function createAttackCueMaterial(color: ColorRepresentation) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uProgress: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
}
