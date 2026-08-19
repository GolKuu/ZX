import type { Vector2 } from 'three';

/** Frame width and height inside the 4x4 atlas, in texture coordinates. */
const FRAME_UV = 0.25;
/** How much of a 60Hz frame's travel is smeared. A real shutter is about half. */
const SHUTTER = 0.38;
/**
 * Beyond this the smear stops reading as speed and starts reading as a broken
 * texture, so it is clamped rather than allowed to scale with knockback.
 *
 * Kept deliberately low. At 0.02 -- eight percent of a cel -- a dashing
 * fighter was legibly soft, and softness is the exact quality this whole pass
 * exists to remove: a blurred character does not read as "fast", it reads as
 * "low resolution". The smear has to be felt rather than seen.
 */
const MAX_UV = 0.011;
/** Below this the motion is a walk, and a walk should be perfectly sharp. */
const MIN_SPEED = 2.0;

/**
 * Converts the fighter's actual on-screen travel into a texture-space smear.
 *
 * Driven by measured translation rather than by the move being performed, on
 * purpose. A punch moves the arm fast and the torso barely at all, and there is
 * no way to smear one limb of a flat cel without smearing the whole body -- a
 * blurred torso during a jab looks like a rendering fault, not like speed. What
 * *does* move the whole body is dashing, jumping, falling and being knocked
 * across the stage, and those are exactly the cases measured translation picks
 * up and a move table would not.
 */
export function updateSmear(
  smear: Vector2,
  {
    worldVelocityX,
    worldVelocityY,
    facing,
    spriteWidth,
    spriteHeight,
    frozen,
  }: {
    readonly worldVelocityX: number;
    readonly worldVelocityY: number;
    /** +1 or -1; the plane is mirrored by scale, but its UVs are not. */
    readonly facing: number;
    readonly spriteWidth: number;
    readonly spriteHeight: number;
    /** Hitstop holds the pose, and a held pose has no travel to smear. */
    readonly frozen: boolean;
  },
): void {
  if (frozen) {
    smear.set(0, 0);
    return;
  }

  const speed = Math.hypot(worldVelocityX, worldVelocityY);
  if (speed < MIN_SPEED) {
    smear.set(0, 0);
    return;
  }

  // World units -> UV. The plane spans one atlas cel, so a full sprite width of
  // travel is FRAME_UV of texture.
  const scale = (SHUTTER / 60) * FRAME_UV;
  // The sprite is flipped by a negative X scale, which mirrors the geometry but
  // not the texture lookup. Without the facing term a fighter knocked to the
  // left smears to the right the moment it turns around.
  let u = (worldVelocityX * facing * scale) / spriteWidth;
  let v = (worldVelocityY * scale) / spriteHeight;

  const length = Math.hypot(u, v);
  if (length > MAX_UV) {
    u = (u / length) * MAX_UV;
    v = (v / length) * MAX_UV;
  }
  smear.set(u, v);
}
