'use client';

import { useFrame } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { Group, MathUtils } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import {
  spriteFacingScale,
  withOpponentFacing,
} from './fighterPresentation';
import {
  VorghBody,
  type VorghJointName,
  type VorghJoints,
} from './vorgh/VorghBody';
import { VorghEffects } from './vorgh/VorghEffects';
import { VorghAudioPlayer } from './vorgh/VorghAudioPlayer';
import { visualTier, vorghPose } from './vorgh/vorghPose';
import {
  advanceVorghAnimation,
  createVorghAnimationState,
} from './vorgh/VorghAnimationController';

export function VorghFighter({ fighterId }: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const displayRage = useRef(0);
  const previousTier = useRef<'low' | 'medium' | 'high'>('low');
  const transition = useRef(0);
  const animation = useRef(createVorghAnimationState());
  const joints = useRef<VorghJoints>({
    root: null, torso: null, head: null,
    frontArm: null, backArm: null, frontForearm: null, backForearm: null,
    frontLeg: null, backLeg: null,
  });
  const setJoint = useCallback((name: VorghJointName, node: Group | null) => {
    joints.current[name] = node;
  }, []);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useFrame(({ clock }, delta) => {
    const fighter = readCombatFighter(fighterId);
    const group = outer.current;
    if (fighter === null || group === null) return;
    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;
    const presentation = withOpponentFacing(
      fighter,
      readCombatFighter(opponentId),
    );
    group.scale.x = spriteFacingScale(true, presentation.facing);
    displayRage.current = MathUtils.damp(
      displayRage.current,
      fighter.resource,
      7,
      delta,
    );
    const tier = visualTier(fighter.resource);
    if (tier !== previousTier.current) {
      previousTier.current = tier;
      transition.current = 1;
    }
    transition.current = Math.max(0, transition.current - delta * 4.2);
    const playback = advanceVorghAnimation(
      animation.current,
      fighter,
      combatRenderFrame.world?.frame ?? 0,
    );
    applyPose(
      joints.current,
      vorghPose(
        { ...presentation, resource: displayRage.current },
        clock.elapsedTime,
        transition.current,
        playback,
      ),
    );
  });

  return (
    <>
      <VorghAudioPlayer fighterId={fighterId} />
      <VorghEffects fighterId={fighterId} />
      <group ref={outer}>
        <VorghBody setJoint={setJoint} />
      </group>
    </>
  );
}

function applyPose(joints: VorghJoints, pose: ReturnType<typeof vorghPose>): void {
  const root = joints.root;
  if (root !== null) {
    root.position.set(pose.rootX, pose.rootY, 0);
    root.scale.set(pose.scaleX, pose.scaleY, 1);
  }
  if (joints.torso !== null) joints.torso.rotation.z = pose.lean;
  if (joints.head !== null) joints.head.rotation.z = pose.head;
  if (joints.frontArm !== null) joints.frontArm.rotation.z = pose.frontArm;
  if (joints.backArm !== null) joints.backArm.rotation.z = pose.backArm;
  if (joints.frontForearm !== null) joints.frontForearm.rotation.z = pose.frontForearm;
  if (joints.backForearm !== null) joints.backForearm.rotation.z = pose.backForearm;
  if (joints.frontLeg !== null) joints.frontLeg.rotation.z = pose.frontLeg;
  if (joints.backLeg !== null) joints.backLeg.rotation.z = pose.backLeg;
}
