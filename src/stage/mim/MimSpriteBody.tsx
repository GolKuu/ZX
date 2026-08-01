'use client';

import { Group } from 'three';
import { SpritePart } from '../sprite2d/SpritePart';
import type { LoadedMimRig, MimPartName } from './mimSpriteRig';

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
      <Limb
        joint="leftLeg"
        lower="legBackLower"
        rig={rig}
        setJoint={setJoint}
        upper="legBackUpper"
        z={-0.035}
      />
      <Limb
        joint="rightLeg"
        lower="legFrontLower"
        rig={rig}
        setJoint={setJoint}
        upper="legFrontUpper"
        z={0.035}
      />
      <group
        position={at(rig, 'torso')}
        ref={(node) => { setJoint('torso', node); }}
      >
        <group
          position={relative(rig, 'sash', 'torso', -0.04)}
          ref={(node) => { setJoint('scarf', node); }}
        >
          <SpritePart part={rig.sash} pixelScale={scale} />
        </group>
        <SpritePart part={rig.hips} pixelScale={scale} />
        <SpritePart part={rig.torso} pixelScale={scale} />
        <Limb
          joint="leftArm"
          lower="armBackLower"
          parent="torso"
          rig={rig}
          setJoint={setJoint}
          upper="armBackUpper"
          z={0.025}
        />
        <Limb
          joint="rightArm"
          lower="armFrontLower"
          parent="torso"
          rig={rig}
          setJoint={setJoint}
          upper="armFrontUpper"
          z={0.045}
        />
        <group
          position={relative(rig, 'head', 'torso', 0.055)}
          ref={(node) => { setJoint('head', node); }}
        >
          <SpritePart part={rig.braids} pixelScale={scale} />
          <SpritePart part={rig.head} pixelScale={scale} />
        </group>
      </group>
    </>
  );
}

function Limb({
  joint,
  lower,
  parent,
  rig,
  setJoint,
  upper,
  z,
}: {
  readonly joint: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  readonly lower: MimPartName;
  readonly parent?: 'torso';
  readonly rig: LoadedMimRig;
  readonly setJoint: (name: MimSpriteJointName, node: Group | null) => void;
  readonly upper: MimPartName;
  readonly z: number;
}) {
  const position = parent === undefined
    ? at(rig, upper, z)
    : relative(rig, upper, parent, z);
  return (
    <group position={position} ref={(node) => { setJoint(joint, node); }}>
      <SpritePart part={rig[upper]} pixelScale={rig.pixelScale} />
      <group position={relative(rig, lower, upper, 0.006)}>
        <SpritePart part={rig[lower]} pixelScale={rig.pixelScale} />
      </group>
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
