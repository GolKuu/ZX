'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';

/**
 * 2.5D fighting-game camera: tracks the pair, dollies on their separation.
 *
 * This rig used to be a fixed point in space aimed permanently at the world
 * origin. The arena is 10 m across and the fighters walk the whole of it, so
 * they simply left the frame — a match could be fought with one character
 * cropped off the left edge, which is what was happening.
 *
 * The framing target is the genre standard: both fighters centred and whole,
 * feet in the lower third, camera near chest height rather than looking down on
 * them. Distance opens up as they separate so the pair always fits, and pans are
 * clamped so the disc's rim stays in shot instead of swinging into empty violet.
 *
 * Per rule R3 nothing here touches React state — the sim is read through refs
 * every frame and only the camera transform is written.
 */

/** Eye height. Low: looking down on fighters shortens them and reads as a toy. */
const EYE_HEIGHT = 2.42;
/** Aim point — chest, not feet, so the head never rides the top of the frame. */
const LOOK_HEIGHT = 1.44;

const NEAR_DISTANCE = 7.1;
const FAR_DISTANCE = 11.6;
/** Metres of dolly per metre of separation. */
const DISTANCE_PER_GAP = 0.66;
/** Extra lift when they are far apart, so the floor gap does not dominate. */
const FAR_LIFT = 0.5;

/** How far the camera may pan off centre before the arena rim leaves frame. */
const MAX_PAN = 2.15;
/** Exponential follow rate, per second. High enough to keep up with a dash. */
const FOLLOW_RATE = 7.5;

/** Frame-rate independent smoothing factor. */
function approach(current: number, target: number, rate: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef(camera);
  const impactRef = useRef(useRenderStore.getState().impactVersion);
  const shakeRef = useRef(0);

  // Live rig state, seeded at the neutral framing so the first frame does not
  // snap in from the old fixed position.
  const panRef = useRef(0);
  const distanceRef = useRef(NEAR_DISTANCE);

  useEffect(() => useRenderStore.subscribe((state) => {
    if (state.impactVersion !== impactRef.current) {
      impactRef.current = state.impactVersion;
      shakeRef.current = 1;
    }
  }), []);

  useFrame(({ clock }, delta) => {
    const activeCamera = cameraRef.current;
    const time = clock.elapsedTime;
    shakeRef.current *= Math.exp(-14 * delta);
    const shake = shakeRef.current;

    const one = readCombatFighter('p1');
    const two = readCombatFighter('p2');

    // Before the first sim tick both are null; hold the neutral framing rather
    // than collapsing to the origin.
    let midpoint = panRef.current;
    let gap = 0;
    if (one !== null && two !== null) {
      const left = one.position.x / FIXED_SCALE;
      const right = two.position.x / FIXED_SCALE;
      midpoint = (left + right) * 0.5;
      gap = Math.abs(right - left);
    }

    const targetPan = Math.max(-MAX_PAN, Math.min(MAX_PAN, midpoint));
    const targetDistance = Math.min(
      FAR_DISTANCE,
      NEAR_DISTANCE + gap * DISTANCE_PER_GAP,
    );

    panRef.current = approach(panRef.current, targetPan, FOLLOW_RATE, delta);
    distanceRef.current = approach(
      distanceRef.current,
      targetDistance,
      FOLLOW_RATE,
      delta,
    );

    const pan = panRef.current;
    const distance = distanceRef.current;
    const openness = (distance - NEAR_DISTANCE) / (FAR_DISTANCE - NEAR_DISTANCE);

    activeCamera.position.x = pan
      + Math.sin(time * 0.24) * 0.06
      + Math.sin(time * 67) * 0.055 * shake;
    activeCamera.position.y = EYE_HEIGHT
      + openness * FAR_LIFT
      + Math.sin(time * 51) * 0.035 * shake;
    activeCamera.position.z = distance + Math.sin(time * 59) * 0.06 * shake;
    activeCamera.lookAt(pan, LOOK_HEIGHT + openness * 0.16, 0);
  });

  return null;
}
