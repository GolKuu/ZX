'use client';

import { useFrame } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { Group } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { withOpponentFacing } from './fighterPresentation';
import { MimAttackSprites } from './mim/MimAttackSprites';
import {
  MimSpriteBody,
  type MimSpriteJointName,
  type MimSpriteJoints,
} from './mim/MimSpriteBody';
import { mimSpritePoseFor, type MimSpritePose } from './mim/mimSpritePose';
import { mimAnimationBeat } from './mim/mimSpriteTimeline';
import type { MimAttackName } from './mim/mimSpriteRig';
import { useMimSprites } from './mim/useMimSprites';

const MIM_PIXEL_SCALE = 2.62 / 381;

export function MimFighter({
  fighterId,
}: {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const rigGroup = useRef<Group>(null);
  const attackGroup = useRef<Group>(null);
  const shownAttack = useRef<MimAttackName | null>(null);
  const sprites = useMimSprites();
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const joints = useRef<MimSpriteJoints>({
    torso: null,
    head: null,
    scarf: null,
    leftArm: null,
    rightArm: null,
    leftLeg: null,
    rightLeg: null,
  });
  const setJoint = useCallback((
    name: MimSpriteJointName,
    node: Group | null,
  ) => {
    joints.current[name] = node;
  }, []);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const outerGroup = outer.current;
    const bodyGroup = body.current;
    if (fighter === null || outerGroup === null || bodyGroup === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;
    const presentation = withOpponentFacing(
      fighter,
      readCombatFighter(opponentId),
    );
    outerGroup.scale.x = presentation.facing;

    const beat = fighter.action === null
      ? null
      : mimAnimationBeat(fighter.action.moveId, fighter.action.frame);
    const strike = beat?.phase === 'strike' ? beat.button : null;
    shownAttack.current = strike;
    if (rigGroup.current !== null) rigGroup.current.visible = strike === null;
    if (attackGroup.current !== null) attackGroup.current.visible = strike !== null;
    if (strike !== null) {
      bodyGroup.position.set(0, 0, 0);
      return;
    }

    const pose = mimSpritePoseFor(presentation, clock.elapsedTime, beat);
    applyPose(joints.current, pose);
    bodyGroup.position.set(pose.drift, pose.lift, 0);
  });

  return (
    <group ref={outer}>
      <group ref={body}>
        <group ref={rigGroup}>
          {sprites.rig === null ? null : (
            <MimSpriteBody rig={sprites.rig} setJoint={setJoint} />
          )}
        </group>
        <group ref={attackGroup} visible={false}>
          {sprites.attacks === null ? null : (
            <MimAttackSprites
              attacks={sprites.attacks}
              pixelScale={MIM_PIXEL_SCALE}
              shown={shownAttack}
            />
          )}
        </group>
      </group>
    </group>
  );
}

function applyPose(joints: MimSpriteJoints, pose: MimSpritePose): void {
  for (const name of Object.keys(joints) as MimSpriteJointName[]) {
    const joint = joints[name];
    if (joint !== null) joint.rotation.z = pose[name];
  }
}
