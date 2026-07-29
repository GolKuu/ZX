import { BackSide, Color, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  uniform float uWidth;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normal);
    float depthScale = clamp(-viewPosition.z * 0.075, 0.7, 1.65);
    viewPosition.xyz += viewNormal * uWidth * depthScale;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

export function createOutlineMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color('#070912') },
      uWidth: { value: 0.032 },
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
    toneMapped: false,
  });
}
