import {
  AdditiveBlending,
  BackSide,
  Color,
  ShaderMaterial,
  type ColorRepresentation,
} from 'three';

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vWave;

  void main() {
    float wave = sin(position.y * 8.0 - uTime * 4.5);
    wave += sin(position.x * 11.0 + uTime * 3.0) * 0.45;
    vec3 displaced = position + normal * wave * 0.035;
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;
    vWave = wave;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vWave;

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.6);
    float energy = smoothstep(0.2, 1.0, sin(vWave * 3.0) * 0.5 + 0.5);
    float alpha = (fresnel * 0.72 + energy * 0.1) * uIntensity;
    vec3 color = uColor * (1.35 + fresnel * 2.4);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function createAuraMaterial(color: ColorRepresentation) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uIntensity: { value: 0.7 },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: BackSide,
    toneMapped: false,
  });
}
