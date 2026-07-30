'use client';

import { Group } from 'three';
import { SpritePart } from './SpritePart';
import { SpriteRigLeg } from './SpriteRigLeg';
import type { SpritePose } from './spritePose';
import type {
  LoadedSpriteRig,
  SpritePartName,
} from './spriteRig';

const LAYER = {
  farLeg: -0.06,
  farArm: -0.045,
  ponytail: -0.03,
  hips: 0,
  sash: 0.012,
  torso: 0.024,
  head: 0.036,
  nearLeg: 0.05,
  nearArm: 0.064,
} as const;

const FAR_TINT = '#b9a7bd';

export type SpriteJoints = Record<
  keyof Omit<SpritePose, 'lift' | 'drift'>,
  Group | null
>;
export type SpriteJointName = keyof SpriteJoints;
export type SetSpriteJoint = (
  name: SpriteJointName,
  node: Group | null,
) => void;

export function SpriteRigBody({
  rig,
  setJoint,
}: {
  readonly rig: LoadedSpriteRig;
  readonly setJoint: SetSpriteJoint;
}) {
  const scale = rig.pixelScale;
  return (
    <>
      <SpriteRigLeg
        far
        rig={rig}
        rootPosition={at(rig, rig.leg === undefined ? 'thigh' : 'leg', null, LAYER.farLeg)}
        setJoint={setJoint}
      />

      <group position={at(rig, 'hips', null, LAYER.hips)}>
        <SpritePart part={rig.hips} pixelScale={scale} />
      </group>
      <group
        position={at(rig, 'sash', null, LAYER.sash)}
        ref={(node) => { setJoint('sash', node); }}
      >
        <SpritePart part={rig.sash} pixelScale={scale} />
      </group>

      <group
        position={at(rig, 'torso', null, LAYER.torso)}
        ref={(node) => { setJoint('torso', node); }}
      >
        <SpritePart part={rig.torso} pixelScale={scale} />
        <Arm
          far
          rig={rig}
          setJoint={setJoint}
          z={LAYER.farArm - LAYER.torso}
        />
        <group
          position={at(rig, 'head', 'torso', LAYER.head - LAYER.torso)}
          ref={(node) => { setJoint('head', node); }}
        >
          <SpritePart part={rig.head} pixelScale={scale} />
          <group
            position={at(
              rig,
              'ponytail',
              'head',
              LAYER.ponytail - LAYER.head,
            )}
            ref={(node) => { setJoint('ponytail', node); }}
          >
            <SpritePart part={rig.ponytail} pixelScale={scale} />
          </group>
        </group>
        <Arm
          rig={rig}
          setJoint={setJoint}
          z={LAYER.nearArm - LAYER.torso}
        />
      </group>

      <SpriteRigLeg
        rig={rig}
        rootPosition={at(rig, rig.leg === undefined ? 'thigh' : 'leg', null, LAYER.nearLeg)}
        setJoint={setJoint}
      />
    </>
  );
}

function Arm({
  far = false,
  rig,
  setJoint,
  z,
}: {
  readonly far?: boolean;
  readonly rig: LoadedSpriteRig;
  readonly setJoint: SetSpriteJoint;
  readonly z: number;
}) {
  const scale = rig.pixelScale;
  return (
    <group
      position={at(rig, 'upperArm', 'torso', z)}
      ref={(node) => {
        setJoint(far ? 'farUpperArm' : 'upperArm', node);
      }}
    >
      <SpritePart
        part={rig.upperArm}
        pixelScale={scale}
        tint={far ? FAR_TINT : undefined}
      />
      <group
        position={at(rig, 'forearm', 'upperArm')}
        ref={(node) => {
          setJoint(far ? 'farForearm' : 'forearm', node);
        }}
      >
        <SpritePart
          part={rig.forearm}
          pixelScale={scale}
          tint={far ? FAR_TINT : undefined}
        />
      </group>
    </group>
  );
}

function at(
  rig: LoadedSpriteRig,
  part: SpritePartName,
  parent: SpritePartName | null,
  z = 0,
): [number, number, number] {
  const joint = rig[part]?.joint;
  const anchor = parent === null ? rig.origin : rig[parent]?.joint;
  if (joint === undefined || anchor === undefined) return [0, 0, z];
  return [
    (joint[0] - anchor[0]) * rig.pixelScale,
    (anchor[1] - joint[1]) * rig.pixelScale,
    z,
  ];
}
