import { Color, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uAccent;
  varying vec2 vUv;

  void main() {
    vec2 point = vUv - 0.5;
    point.x *= 1.72;
    float radius = length(point);
    float angle = atan(point.y, point.x);
    float sectors = abs(sin(angle * 38.0 + sin(angle * 7.0) * 2.0));
    float spokes = pow(sectors, 28.0);
    float motion = pow(1.0 - fract(radius * 8.0 - uTime * 1.9), 5.0);
    // Streaks are held out at the frame edge. They used to start a tenth of the
    // way out from centre, which put them straight across the fighters — the
    // one part of the picture an impact effect must leave alone.
    float outerMask = smoothstep(0.32, 0.58, radius);
    float edgeFade = 1.0 - smoothstep(0.74, 1.05, radius);
    float lines = spokes * motion * outerMask * edgeFade * uIntensity;
    // Scaled by intensity as well, so at rest the pane is fully clear. It sits
    // on the lens now — a residual tint here would grey the whole match.
    float glow = (1.0 - smoothstep(0.0, 0.8, radius)) * 0.08 * uIntensity;
    vec3 base = mix(vec3(0.018, 0.027, 0.065), vec3(0.008, 0.012, 0.03), vUv.y);
    float alpha = clamp(glow * 0.32 + lines * 0.92, 0.0, 0.86);
    gl_FragColor = vec4(base + uAccent * (lines * 1.8 + glow), alpha);
  }
`;

export function createSpeedLinesMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uAccent: { value: new Color('#41cfff') },
      uIntensity: { value: 0.05 },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    depthWrite: false,
    toneMapped: false,
    transparent: true,
  });
}
