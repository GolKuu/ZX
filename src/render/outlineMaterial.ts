/**
 * Inverted-hull outline.
 *
 * Width is solved in *screen* space so the line holds the same pixel weight at
 * every camera distance. The previous depth clamp made lines thicken as the
 * camera pulled out, which is the difference between a drawn outline and a
 * rendered one (ART-CCU-400 §4.2).
 */

import { BackSide, Color, ShaderMaterial, type ColorRepresentation } from 'three';

const vertexShader = /* glsl */ `
  uniform float uPixelWidth;     // target thickness in pixels
  uniform float uViewportHeight;
  uniform float uTanHalfFov;
  uniform float uFalloff;        // 0 disables distance thinning

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normal);

    // World units covered by one pixel at this depth.
    float depth = max(-viewPosition.z, 0.001);
    float unitsPerPixel = (2.0 * uTanHalfFov * depth) / uViewportHeight;
    float width = uPixelWidth * unitsPerPixel;

    // Thin slightly at long range so a distant pair does not read as stickers.
    float falloff = mix(1.0, clamp(1.0 - (depth - 7.0) / 22.0, 0.55, 1.0), uFalloff);
    width *= falloff;

    viewPosition.xyz += viewNormal * width;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;

export interface OutlineOptions {
  /** Line weight in pixels. */
  readonly pixelWidth?: number;
  readonly color?: ColorRepresentation;
  readonly falloff?: boolean;
}

/**
 * The roster's ink weight, in pixels.
 *
 * One number for every character on purpose. A heavy, even black contour is the
 * single most defining feature of the character sheets, and it is the same
 * weight on all five of them — so it is art direction, not a per-character
 * tuning knob. Each fighter used to pass its own value between 2 and 2.4, which
 * was both inconsistent and far too fine to read against this stage.
 */
export const INK_WIDTH = 3.6;

/** Near-black. A true 0x000000 reads as a hole; this reads as ink. */
export const INK_COLOR = '#07070c';

export function createOutlineMaterial(options: OutlineOptions = {}) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(options.color ?? INK_COLOR) },
      uPixelWidth: { value: options.pixelWidth ?? INK_WIDTH },
      uViewportHeight: { value: 1080 },
      uTanHalfFov: { value: Math.tan((45 * Math.PI) / 180 / 2) },
      // Off by default: drawn ink does not thin with distance.
      uFalloff: { value: options.falloff === true ? 1 : 0 },
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
    toneMapped: false,
  });
}

export type OutlineMaterial = ReturnType<typeof createOutlineMaterial>;

/** Call on mount and on resize — the width formula needs both values. */
export function updateOutlineProjection(
  material: OutlineMaterial,
  viewportHeightPx: number,
  fovDegrees: number,
): void {
  const height = material.uniforms.uViewportHeight;
  const tan = material.uniforms.uTanHalfFov;
  if (height !== undefined) {
    height.value = Math.max(1, viewportHeightPx);
  }
  if (tan !== undefined) {
    tan.value = Math.tan((fovDegrees * Math.PI) / 180 / 2);
  }
}
