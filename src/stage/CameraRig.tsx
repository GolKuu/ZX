'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type { PerspectiveCamera } from 'three';
import {
  readCombatFighter,
  readLatestHit,
} from '@/src/game/combatRuntime';
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

/**
 * Eye height — and the aim height, deliberately identical.
 *
 * The stage is built from flat planes standing at z ≈ 0. Any vertical tilt
 * projects those planes as trapezoids and instantly gives away that the 2D
 * backdrop is a sheet of geometry; a level camera keeps every layer rectangular,
 * which is what makes a plane-built stage read as drawn art. Chest height, so
 * neither the floor line nor the headroom dominates.
 */
const EYE_HEIGHT = 1.5;
const BASE_FOV = 40;

const MAX_SHAKE = 1.8;
const HARMONIC_INTENSITY = 0.062;
const IMPACT_SHAKE_RETURN = 12;
const FOV_RETURN = 5;

const HIT_FOV_BIAS = 1.4;
const HEAVY_HIT_FOV_BIAS = 2.4;
const SUPER_FOV_BIAS = 2.8;

type FighterId = 'p1' | 'p2';

/** Framing: a 2.62 m fighter should fill a little over half the frame. */
const NEAR_DISTANCE = 6.2;
const FAR_DISTANCE = 10.4;
/** Metres of dolly per metre of separation. */
const DISTANCE_PER_GAP = 0.66;

/**
 * How far the camera may pan off centre.
 *
 * Has to cover a *cornered* pair, not just a central one. Fighters reach ±4.8 on
 * a 5.1 m disc — an idle player gets walked into the wall by the AI in a couple
 * of seconds — and at 2.15 the camera ran out of pan and left both of them
 * stuck against the left edge of the frame. Panning this far shows some stage
 * past the rim, which is what the backdrop is for.
 */
const MAX_PAN = 4;
/** Exponential follow rate, per second. High enough to keep up with a dash. */
const FOLLOW_RATE = 7.5;

/** Frame-rate independent smoothing factor. */
function approach(current: number, target: number, rate: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef(camera as PerspectiveCamera);
  const shakeRef = useRef(0);
  const fovTargetRef = useRef(BASE_FOV);
  const impactVersionRef = useRef(useRenderStore.getState().impactVersion);
  const superVersionRef = useRef(
    useRenderStore.getState().mimSuperVersion
    + useRenderStore.getState().echoSuperVersion
    + useRenderStore.getState().chronoSuperVersion
    + useRenderStore.getState().glitchSuperVersion,
  );
  const seenHitSerial = useRef<Record<FighterId, number>>({ p1: 0, p2: 0 });

  // Live rig state, seeded at the neutral framing so the first frame does not
  // snap in from the old fixed position.
  const panRef = useRef(0);
  const distanceRef = useRef(NEAR_DISTANCE);
  const superVersion = useRenderStore((state) =>
    state.mimSuperVersion
    + state.echoSuperVersion
    + state.chronoSuperVersion
    + state.glitchSuperVersion,
  );
  const impactVersion = useRenderStore((state) => state.impactVersion);

  useFrame(({ clock }, delta) => {
    if (impactVersion !== impactVersionRef.current) {
      impactVersionRef.current = impactVersion;
      shakeRef.current = Math.min(MAX_SHAKE, Math.max(shakeRef.current, 1.2));
      fovTargetRef.current = Math.max(fovTargetRef.current, BASE_FOV + HIT_FOV_BIAS);
    }
    if (superVersion !== superVersionRef.current) {
      superVersionRef.current = superVersion;
      shakeRef.current = Math.min(MAX_SHAKE, Math.max(shakeRef.current, 1.45));
      fovTargetRef.current = Math.max(fovTargetRef.current, BASE_FOV + SUPER_FOV_BIAS);
    }
    for (const defenderId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(defenderId);
      if (hit === null || hit.serial === seenHitSerial.current[defenderId]) {
        continue;
      }
      seenHitSerial.current[defenderId] = hit.serial;
      const impactWeight = Math.min(MAX_SHAKE, 0.48 + hit.damage / 72);
      shakeRef.current = Math.min(MAX_SHAKE, Math.max(shakeRef.current, impactWeight));
      fovTargetRef.current = Math.min(
        43.8,
        Math.max(
          fovTargetRef.current,
          BASE_FOV + (hit.damage > 65 ? HEAVY_HIT_FOV_BIAS : HIT_FOV_BIAS * 0.62),
        ),
      );
    }

    const activeCamera = cameraRef.current;
    const time = clock.elapsedTime;
    shakeRef.current = approach(shakeRef.current, 0, IMPACT_SHAKE_RETURN, delta);
    fovTargetRef.current = approach(fovTargetRef.current, BASE_FOV + 0.35, FOV_RETURN, delta);
    activeCamera.fov = approach(activeCamera.fov, fovTargetRef.current, 7, delta);
    activeCamera.updateProjectionMatrix();

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

    // Sway and shake move the eye, never the aim height: the moment the camera
    // tilts, the flat stage layers keystone.
    const shakeAmount = shakeRef.current;
    activeCamera.position.x = pan
      + Math.sin(time * 0.24) * 0.06
      + Math.sin(time * 67) * 0.06 * shakeAmount
      + Math.sin(time * 41) * 0.018 * shakeAmount;
    activeCamera.position.y = EYE_HEIGHT
      + Math.sin(time * 51) * 0.035 * shakeAmount
      + Math.cos(time * 59) * 0.018 * Math.min(1.05, shakeAmount);
    activeCamera.position.z = distance
      + Math.sin(time * 59) * 0.06 * shakeAmount
      + Math.cos(time * 83) * HARMONIC_INTENSITY * shakeAmount;
    activeCamera.lookAt(
      activeCamera.position.x,
      activeCamera.position.y,
      0,
    );
  });

  return null;
}
