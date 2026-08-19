'use client';

import { DoubleSide, type MeshBasicMaterial, type Texture } from 'three';

/**
 * The fighter's own silhouette, laid flat on the floor as a cast shadow.
 *
 * What was here before was three stacked black ellipses. An ellipse is a fine
 * contact shadow for a ball, and it is what every sprite game reaches for, but
 * it says nothing about the thing standing on it: a fighter mid-kick with one
 * leg extended casts the same oval as one standing still, so the shadow never
 * agrees with the pose and the eye stops believing the character is on the
 * floor at all.
 *
 * Reusing the atlas plane solves that for free. The texture already carries a
 * per-frame silhouette in its alpha, and it is already being advanced by the
 * animation, so a second quad rotated flat and anchored at the feet is a
 * genuine cast shadow of the current frame at no extra texture cost.
 *
 * The stage key is high, front and to the left, so the shadow lies back and to
 * the right, foreshortened hard because the light is steep. Those three numbers
 * are the entire trick.
 */

/** Foreshortening. The key is steep, so the shadow is short. */
const DEPTH = 0.46;
/** Lateral throw, away from the key's left-hand position. */
const SIDE_THROW = 0.16;
/**
 * Where the feet sit inside the frame, as a fraction from the top.
 *
 * This is the number that decides whether the shadow is attached to the
 * fighter or floating behind them, and it is not 0.5: the atlas leaves headroom
 * and the feet land at 91% down the cel (the same GROUND constant the standing
 * plane is positioned by). Anchoring the flat quad on its centre instead put
 * the join a sixth of a body-length behind the boots.
 */
const FOOT_V = 0.91;

export function SpriteGroundShadow({
  materialRef,
  texture,
  width,
  height,
  opacity = 0.46,
}: {
  /** Lets the fighter fade the shadow out as it leaves the ground. */
  readonly materialRef: (material: MeshBasicMaterial | null) => void;
  readonly texture: Texture;
  readonly width: number;
  readonly height: number;
  readonly opacity?: number;
}) {
  return (
    <mesh
      // Laid flat, then pushed away from the camera so the quad's local +Y —
      // the head end of the frame — runs away from the viewer rather than
      // toward them. A shadow that grows toward the camera reads as a light
      // behind the fighter, which is the one thing this stage does not have.
      position={[
        SIDE_THROW * width * 0.5,
        0.012,
        -(FOOT_V - 0.5) * height * DEPTH,
      ]}
      renderOrder={-2}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, DEPTH, 1]}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={materialRef}
        alphaTest={0.06}
        color="#05060c"
        depthWrite={false}
        map={texture}
        opacity={opacity}
        polygonOffset
        polygonOffsetFactor={-2}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
