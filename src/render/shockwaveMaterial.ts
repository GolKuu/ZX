import { AdditiveBlending, Color, ShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * The ring that leaves a blow: a thin shell racing outward from the contact.
 *
 * Two things make an impact ring read as force rather than as a circle drawn on
 * the screen. It has to *decelerate* — force spends itself — and it has to thin
 * and dim as it grows, because the same energy is spread around an ever longer
 * circumference. Both are done here against a single 0…1 progress uniform, so
 * the component driving it only has to count time.
 */
const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uPower;
  uniform vec3  uColour;
  uniform vec3  uCore;
  varying vec2 vUv;

  void main() {
    vec2 point = vUv * 2.0 - 1.0;
    float radius = length(point);

    // Ease-out: fast off the contact, settling as it spends itself.
    float travel = 1.0 - pow(1.0 - uProgress, 2.6);
    float shell = travel * 0.94;
    // Thin. A fat ring stops being a shock front and becomes a disc parked over
    // the fighters — which is precisely what it must never do, since the pose
    // being struck is the thing the ring exists to draw attention to.
    float thickness = mix(0.14, 0.022, travel);

    float ring = 1.0 - smoothstep(0.0, thickness, abs(radius - shell));
    ring = pow(ring, 2.1);

    // Leading edge is hotter than the trail — a shock front, not a band.
    float front = smoothstep(shell - thickness * 0.4, shell + thickness * 0.2, radius);
    vec3 colour = mix(uColour, uCore, front * 0.8);

    // The flash at the point of contact, gone in the first third.
    float core = (1.0 - smoothstep(0.0, 0.2, radius)) * max(0.0, 1.0 - uProgress * 4.5);
    colour += uCore * core * 1.4;

    float fade = 1.0 - smoothstep(0.3, 0.95, uProgress);
    float alpha = clamp((ring * 0.72 + core * 0.8) * fade * uPower, 0.0, 0.85);
    gl_FragColor = vec4(colour * (0.9 + ring), alpha);
  }
`;

export function createShockwaveMaterial(colour: string, core: string) {
  return new ShaderMaterial({
    uniforms: {
      uProgress: { value: 1 },
      uPower: { value: 0 },
      uColour: { value: new Color(colour) },
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
