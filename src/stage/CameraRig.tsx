'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type { PerspectiveCamera } from 'three';
import {
  NEUTRAL_FRAMING,
  approach,
  readFraming,
  type Framing,
} from './camera/cameraFraming';
import {
  MAX_SHAKE,
  accumulateImpacts,
  createImpulse,
  createWatch,
} from './camera/combatCameraState';
import { useRenderStore } from '@/src/store/renderStore';

/**
 * The lens: a fight camera that tracks the pair and reacts to the fight.
 *
 * The rig this replaces was pinned level at chest height and forbidden from
 * tilting, because the stage was built from flat planes and any pitch exposed
 * them as sheets of card. The stage is real geometry now, so the camera is off
 * that leash — it sits above the fighters and looks *down* at them, which is the
 * angle a fight is actually shot from and the reason the arena reads as a floor
 * the fighters stand on rather than a wall behind them.
 *
 * Three things beyond framing make a hit feel like a hit, and all of them live
 * here: the camera lurches, it rolls, and on a heavy blow it snaps in toward the
 * pair before easing back. On a finish it stops reacting and pushes in slowly.
 *
 * Per rule R3 nothing here touches React state — the sim is read through refs
 * every frame and only the camera transform is written.
 */

/** How far the eye rides above the point it is aiming at. */
const EYE_RISE = 1.15;
const BASE_FOV = 39;
const IMPACT_RETURN = 11;
const PUNCH_RETURN = 6.5;
const FOV_RETURN = 5;
/** Exponential follow rate, per second. High enough to keep up with a dash. */
const FOLLOW_RATE = 7.5;

export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef(camera as PerspectiveCamera);
  const framingRef = useRef<Framing>(NEUTRAL_FRAMING);
  const impulse = useRef(createImpulse());
  const watch = useRef(createWatch());
  const fovTargetRef = useRef(BASE_FOV);
  const superVersionRef = useRef(
    useRenderStore.getState().mimSuperVersion
    + useRenderStore.getState().glitchSuperVersion,
  );
  const impactVersionRef = useRef(useRenderStore.getState().impactVersion);

  const superVersion = useRenderStore(
    (state) => state.mimSuperVersion + state.glitchSuperVersion,
  );
  const impactVersion = useRenderStore((state) => state.impactVersion);
  const screenShakeEnabled = useRenderStore((state) => state.screenShakeEnabled);

  useFrame(({ clock }, delta) => {
    const shot = impulse.current;

    if (impactVersion !== impactVersionRef.current) {
      impactVersionRef.current = impactVersion;
      shot.shake = Math.min(MAX_SHAKE, Math.max(shot.shake, 1.1));
    }
    if (superVersion !== superVersionRef.current) {
      superVersionRef.current = superVersion;
      shot.shake = Math.min(MAX_SHAKE, Math.max(shot.shake, 1.5));
      shot.punch = Math.max(shot.punch, 1.5);
      fovTargetRef.current = BASE_FOV + 3.2;
    }
    accumulateImpacts(shot, watch.current);

    shot.shake = approach(shot.shake, 0, IMPACT_RETURN, delta);
    shot.kick = approach(shot.kick, 0, 16, delta);
    shot.punch = approach(shot.punch, 0, PUNCH_RETURN, delta);
    shot.roll = approach(shot.roll, 0, 8, delta);
    fovTargetRef.current = approach(fovTargetRef.current, BASE_FOV, FOV_RETURN, delta);

    const target = readFraming(framingRef.current);
    const held = framingRef.current;
    // The finish shot freezes the pan and creeps in; letting it keep tracking
    // would have the camera drift off to follow a corpse sliding across the
    // disc.
    const followRate = FOLLOW_RATE * (1 - shot.finish * 0.85);
    framingRef.current = {
      pan: approach(held.pan, target.pan, followRate, delta),
      distance: approach(held.distance, target.distance, followRate, delta),
      focus: approach(held.focus, target.focus, followRate * 0.8, delta),
    };
    const framing = framingRef.current;

    const lens = cameraRef.current;
    const time = clock.elapsedTime;
    const shake = screenShakeEnabled ? shot.shake : 0;

    // Punch-in on a heavy landing, then a slow creep on a finish. Both pull the
    // eye along the same axis, so they compose rather than fight.
    const distance = framing.distance - shot.punch * 1.35 - shot.finish * 2.6;
    lens.fov = approach(lens.fov, fovTargetRef.current - shot.finish * 4.5, 7, delta);
    lens.updateProjectionMatrix();

    lens.position.set(
      framing.pan
        + shot.kick
        + Math.sin(time * 0.24) * 0.05
        + Math.sin(time * 67) * 0.07 * shake,
      framing.focus + EYE_RISE
        + Math.sin(time * 51) * 0.05 * shake
        + shot.finish * 0.35,
      distance + Math.cos(time * 83) * 0.06 * shake,
    );
    lens.lookAt(framing.pan + shot.kick * 0.4, framing.focus, 0);
    // Roll last: `lookAt` rewrites the whole orientation, so any roll applied
    // before it is simply thrown away.
    lens.rotateZ(shot.roll + Math.sin(time * 43) * 0.006 * shake);
  });

  return null;
}
