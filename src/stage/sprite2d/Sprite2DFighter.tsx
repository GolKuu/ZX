'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import {
  combatAnimationProgress,
  idolSpriteAnimationProgress,
} from '../combatAnimationProgress';
import {
  SpriteRigBody,
  type SpriteJoints,
} from './SpriteRigBody';
import { spritePoseFor, type SpritePose } from './spritePose';
import {
  disposeSpriteRig,
  loadSpriteRig,
  type LoadedSpriteRig,
} from './spriteRig';

/**
 * A fighter drawn as a 2D cut-out of its own character sheet.
 *
 * The sheet's profile view is sliced into parts by
 * `scripts/slice-characters.mjs`; this hangs those parts on a joint hierarchy
 * and rotates them about Z. Nothing is lit — the parts are the artwork, at the
 * artwork's own values, which is the only way the game matches a flat vector
 * drawing exactly.
 *
 * The profile shows one arm and one leg, so the far limbs reuse the same
 * textures behind the body, tinted down. That is standard for a 2D cut-out
 * fighter and is why a side view is the right thing to cut.
 *
 * Every joint and the figure's floor origin come from the generated manifest,
 * so characters with different source-sheet sizes share the same stage height.
 */

export function Sprite2DFighter({
  fighterId,
  rigName,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly rigName: string;
}) {
  const outer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const [rig, setRig] = useState<LoadedSpriteRig | null>(null);

  // A ref, not a memo: the joint slots are filled by `ref` callbacks during
  // render, and mutating a memoised object is exactly what
  // `react-hooks/immutability` exists to prevent.
  const joints = useRef<SpriteJoints>({
    torso: null,
    head: null,
    ponytail: null,
    sash: null,
    upperArm: null,
    forearm: null,
    farUpperArm: null,
    farForearm: null,
    thigh: null,
    shin: null,
    boot: null,
    farThigh: null,
    farShin: null,
    farBoot: null,
  });

  useEffect(() => {
    let cancelled = false;
    let loaded: LoadedSpriteRig | null = null;

    loadSpriteRig(rigName)
      .then((result) => {
        if (cancelled) {
          disposeSpriteRig(result);
          return;
        }
        loaded = result;
        setRig(result);
      })
      .catch((error: unknown) => {
        console.warn(`[${fighterId}] Could not load sprite rig "${rigName}".`, error);
      });

    return () => {
      cancelled = true;
      if (loaded !== null) disposeSpriteRig(loaded);
      setRig(null);
    };
  }, [fighterId, rigName]);

  useFrame(({ clock }) => {
    const group = outer.current;
    const inner = body.current;
    const fighter = readCombatFighter(fighterId);
    if (group === null || inner === null || fighter === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;

    // Mirror the whole rig rather than re-authoring poses for the other
    // direction. Which way the artwork already faces is per sheet — IDOL's
    // profile columns face left, CHRONO's and GLITCH's face right — so a fixed
    // sign would point half the roster away from its opponent.
    const drawnFacing = rig?.facesRight === true ? 1 : -1;
    group.scale.x = drawnFacing * fighter.facing;

    const progress = fighter.action === null
      ? 0
      : rigName === 'idol-profile'
        ? idolSpriteAnimationProgress(
          fighter.action.moveId,
          fighter.action.frame,
        )
        : combatAnimationProgress(fighter.action.moveId, fighter.action.frame);
    const pose = spritePoseFor(fighter, clock.elapsedTime, progress);
    apply(joints.current, pose);
    inner.position.y = pose.lift;
    inner.position.x = pose.drift;
  });

  return (
    <group ref={outer}>
      <group ref={body}>
        {rig === null ? null : (
          <SpriteRigBody joints={joints.current} rig={rig} />
        )}
      </group>
    </group>
  );
}

function apply(joints: SpriteJoints, pose: SpritePose): void {
  for (const name of Object.keys(joints) as (keyof SpriteJoints)[]) {
    const joint = joints[name];
    if (joint !== null) joint.rotation.z = pose[name];
  }
}
