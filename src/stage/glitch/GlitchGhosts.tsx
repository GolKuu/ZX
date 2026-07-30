'use client';

import { useFrame } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from 'react';
import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import {
  readCombatFighter,
} from '@/src/game/combatRuntime';
import type { FighterSnapshot } from '@/src/sim';
import { spriteAnimationProgress } from '../combatAnimationProgress';
import { withOpponentFacing } from '../fighterPresentation';
import {
  SpriteRigBody,
  type SpriteJointName,
  type SpriteJoints,
  type SetSpriteJoint,
} from '../sprite2d/SpriteRigBody';
import { spritePoseFor, type SpritePose } from '../sprite2d/spritePose';
import type { LoadedSpriteRig } from '../sprite2d/spriteRig';

export function GlitchGhosts({
  fighterId,
  root,
  rig,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly root: RefObject<Group | null>;
  readonly rig: LoadedSpriteRig;
}) {
  const cyanJoints = useRef<SpriteJoints>(emptyJoints());
  const magentaJoints = useRef<SpriteJoints>(emptyJoints());
  const setCyan = useCallback<SetSpriteJoint>((name, node) => {
    cyanJoints.current[name] = node;
  }, []);
  const setMagenta = useCallback<SetSpriteJoint>((name, node) => {
    magentaJoints.current[name] = node;
  }, []);

  useEffect(() => {
    const group = root.current;
    if (group === null) return;
    group.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const material = node.material;
      if (!(material instanceof MeshBasicMaterial)) return;
      material.blending = AdditiveBlending;
      material.color.set(node.position.x > 0 ? '#ff2bd6' : '#16e6ff');
      material.depthWrite = false;
      material.opacity = 0.24;
      material.transparent = true;
      material.toneMapped = false;
      material.needsUpdate = true;
    });
  }, [root]);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    if (fighter === null) return;
    const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
    applyDelayedPose(
      cyanJoints.current,
      fighter,
      readCombatFighter(opponentId),
      clock.elapsedTime,
      4,
    );
    applyDelayedPose(
      magentaJoints.current,
      fighter,
      readCombatFighter(opponentId),
      clock.elapsedTime,
      8,
    );
  });

  return (
    <group ref={root} visible={false}>
      <group name="desync-cyan" position={[-0.28, 0.04, -0.12]} scale={0.985}>
        <SpriteRigBody rig={rig} setJoint={setCyan} />
      </group>
      <group name="desync-magenta" position={[0.24, -0.025, -0.1]} scale={1.015}>
        <SpriteRigBody rig={rig} setJoint={setMagenta} />
      </group>
    </group>
  );
}

function applyDelayedPose(
  joints: SpriteJoints,
  fighter: FighterSnapshot,
  opponent: FighterSnapshot | null,
  time: number,
  delayFrames: number,
): void {
  const action = fighter.action;
  const delayed: FighterSnapshot = {
    ...fighter,
    action: action === null || action.frame < delayFrames
      ? null
      : { ...action, frame: action.frame - delayFrames },
  };
  const presentation = withOpponentFacing(delayed, opponent);
  const progress = delayed.action === null
    ? 0
    : spriteAnimationProgress(
      delayed.action.moveId,
      delayed.action.frame,
    );
  const pose = spritePoseFor(
    presentation,
    time - delayFrames / 60,
    progress,
    'body',
    'windup',
  );
  applyPose(joints, pose);
}

function applyPose(joints: SpriteJoints, pose: SpritePose): void {
  for (const name of Object.keys(joints) as SpriteJointName[]) {
    const joint = joints[name];
    if (joint !== null) joint.rotation.z = pose[name];
  }
}

function emptyJoints(): SpriteJoints {
  return {
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
  };
}
