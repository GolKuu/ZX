'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { CharacterId } from '@/src/data/characterRoster';
import { combatRenderFrame, readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { facingOpponent } from '../fighterPresentation';
import { CharacterHeroFX } from '../photoSprite/CharacterHeroFX';
import { applyAttackPose } from './attackPose';
import { attackShapeFor } from './attackShapes';
import { characterBuild } from './characterBuild';
import { FighterSkeleton, type FighterJoints } from './FighterSkeleton';
import { useFighterSurfaces } from './fighter3dMaterials';
import {
  applyPose,
  crouchPose,
  downPose,
  guardPose,
  hitPose,
  idleBreath,
  isKnockedDown,
  neutralPose,
  walkPose,
} from './fighterPose';

/** Simulation velocity above which the fighter is considered to be walking. */
const WALK_THRESHOLD = 16;
const WALK_REFERENCE = 65;

/**
 * A fighter as real 3D geometry, posed from the simulation every frame.
 *
 * The character this replaces was a photograph on a billboard. That reads well
 * from one fixed angle and falls apart the moment the stage stops being flat —
 * it cannot turn, it cannot take the key light, and it cannot cast a shadow
 * shaped like a body. This one is a jointed rig standing in the room: the same
 * lights that hit the stone hit the fighter, and a move like the 540 is an
 * actual rotation rather than a drawing of one.
 *
 * Per rule R3 nothing here touches React state — the sim is read through refs
 * and only transforms are written.
 */
export function KombatFighter({
  characterId,
  fighterId,
}: {
  readonly characterId: CharacterId;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const joints = useRef<FighterJoints>(null);
  const build = characterBuild(characterId);
  const surfaces = useFighterSurfaces(characterId);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const downSince = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const root = outer.current;
    const rig = joints.current;
    if (fighter === null || root === null || rig === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    root.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    root.position.y = fighter.position.y / FIXED_SCALE;

    // The body turns to face the opponent. A billboard could only mirror; a rig
    // can rotate, which is most of why this is worth doing at all.
    const facing = facingOpponent(fighter, readCombatFighter(opponentId));
    root.rotation.y = facing === 1 ? 0.42 : Math.PI - 0.42;

    const time = clock.elapsedTime;
    const pose = neutralPose(build.stoop);

    const down = isKnockedDown(fighter);
    if (down) {
      downSince.current ??= time;
      downPose(pose, (time - downSince.current) * 5);
    } else {
      downSince.current = null;
      posture(pose, fighter, time);
    }

    applyPose(rig, pose);
  });

  return (
    <group ref={outer}>
      <CharacterHeroFX fighterId={fighterId} kind={kindOf(characterId)} />
      <FighterSkeleton build={build} ref={joints} surfaces={surfaces} />
    </group>
  );
}

/** Everything that is not a knockdown, in priority order. */
function posture(
  pose: ReturnType<typeof neutralPose>,
  fighter: NonNullable<ReturnType<typeof readCombatFighter>>,
  time: number,
): void {
  idleBreath(pose, time);

  const action = fighter.action;
  if (action !== null) {
    applyAttackPose(
      pose,
      attackShapeFor(action.moveId),
      combatAnimationProgress(action.moveId, action.frame),
    );
    return;
  }
  if (fighter.hitstun > 0) {
    // Decays over the reaction so the fighter recovers into stance rather than
    // snapping back the frame hitstun ends.
    hitPose(pose, Math.min(1, fighter.hitstun / 18));
    return;
  }
  if (fighter.guarding) {
    guardPose(pose);
    return;
  }
  if (fighter.crouching) {
    crouchPose(pose);
    return;
  }
  if (!fighter.grounded) {
    pose.leftLeg.hinge -= 0.8;
    pose.rightLeg.pitch += 0.5;
    pose.leftArm.pitch -= 0.4;
    return;
  }
  const speed = Math.abs(fighter.velocity.x);
  if (speed >= WALK_THRESHOLD) {
    walkPose(pose, time, Math.min(1.25, Math.max(0.6, speed / WALK_REFERENCE)));
  }
}

/** The hero-FX pass predates this component and still keys off its own union. */
function kindOf(characterId: CharacterId) {
  return characterId;
}
