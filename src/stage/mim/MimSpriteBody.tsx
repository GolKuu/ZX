'use client';

import { Group } from 'three';
import type { LoadedMimRig, MimPartName } from './mimSpriteRig';
import { MimTexturedPart } from './MimTexturedPart';

export type MimSpriteJointName =
  | 'torso'
  | 'head'
  | 'scarf'
  | 'leftArm'
  | 'rightArm'
  | 'leftLeg'
  | 'rightLeg';

export type MimSpriteJoints = Record<MimSpriteJointName, Group | null>;

export function MimSpriteBody({
  rig,
  setJoint,
}: {
  readonly rig: LoadedMimRig;
  readonly setJoint: (name: MimSpriteJointName, node: Group | null) => void;
}) {
  const scale = rig.pixelScale;
  return (
    <>
      <Limb name="leftLeg" rig={rig} setJoint={setJoint} z={-0.035} />
      <Limb name="rightLeg" rig={rig} setJoint={setJoint} z={0.035} />
      <group
        position={at(rig, 'torso')}
        ref={(node) => { setJoint('torso', node); }}
      >
        <group
          position={relative(rig, 'scarf', 'torso', -0.04)}
          ref={(node) => { setJoint('scarf', node); }}
        >
          <MimTexturedPart part={rig.scarf} pixelScale={scale} />
        </group>
        <MimTexturedPart part={rig.torso} pixelScale={scale} />
        <Limb
          name="leftArm"
          parent="torso"
          rig={rig}
          setJoint={setJoint}
          z={0.025}
        />
        <Limb
          name="rightArm"
          parent="torso"
          rig={rig}
          setJoint={setJoint}
          z={0.045}
        />
        <group
          position={relative(rig, 'head', 'torso', 0.055)}
          ref={(node) => { setJoint('head', node); }}
        >
          <MimTexturedPart part={rig.head} pixelScale={scale} />
        </group>
      </group>
    </>
  );
}

function Limb({
  name,
  parent,
  rig,
  setJoint,
  z,
}: {
  readonly name: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  readonly parent?: 'torso';
  readonly rig: LoadedMimRig;
  readonly setJoint: (name: MimSpriteJointName, node: Group | null) => void;
  readonly z: number;
}) {
  const position = parent === undefined
    ? at(rig, name, z)
    : relative(rig, name, parent, z);
  return (
    <group position={position} ref={(node) => { setJoint(name, node); }}>
      <MimTexturedPart part={rig[name]} pixelScale={rig.pixelScale} />
    </group>
  );
}

function at(
  rig: LoadedMimRig,
  name: MimPartName,
  z = 0,
): [number, number, number] {
  return relativePoint(rig, rig[name].joint, rig.origin, z);
}

function relative(
  rig: LoadedMimRig,
  name: MimPartName,
  parent: MimPartName,
  z = 0,
): [number, number, number] {
  return relativePoint(rig, rig[name].joint, rig[parent].joint, z);
}

function relativePoint(
  rig: LoadedMimRig,
  joint: readonly [number, number],
  anchor: readonly [number, number],
  z: number,
): [number, number, number] {
  return [
    (joint[0] - anchor[0]) * rig.pixelScale,
    (anchor[1] - joint[1]) * rig.pixelScale,
    z,
  ];
}
