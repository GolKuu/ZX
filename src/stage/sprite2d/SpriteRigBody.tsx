'use client';

import { Group } from 'three';
import { SpritePart } from './SpritePart';
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

export function SpriteRigBody({
  joints,
  rig,
}: {
  readonly joints: SpriteJoints;
  readonly rig: LoadedSpriteRig;
}) {
  const scale = rig.pixelScale;
  return (
    <>
      <group
        position={at(rig, 'thigh', null, LAYER.farLeg)}
        ref={(node) => { joints.farThigh = node; }}
      >
        <SpritePart part={rig.thigh} pixelScale={scale} tint={FAR_TINT} />
        <group
          position={at(rig, 'shin', 'thigh')}
          ref={(node) => { joints.farShin = node; }}
        >
          <SpritePart part={rig.shin} pixelScale={scale} tint={FAR_TINT} />
          <group
            position={at(rig, 'boot', 'shin')}
            ref={(node) => { joints.farBoot = node; }}
          >
            <SpritePart part={rig.boot} pixelScale={scale} tint={FAR_TINT} />
          </group>
        </group>
      </group>

      <group position={at(rig, 'hips', null, LAYER.hips)}>
        <SpritePart part={rig.hips} pixelScale={scale} />
      </group>
      <group
        position={at(rig, 'sash', null, LAYER.sash)}
        ref={(node) => { joints.sash = node; }}
      >
        <SpritePart part={rig.sash} pixelScale={scale} />
      </group>

      <group
        position={at(rig, 'torso', null, LAYER.torso)}
        ref={(node) => { joints.torso = node; }}
      >
        <SpritePart part={rig.torso} pixelScale={scale} />
        <Arm
          far
          joints={joints}
          rig={rig}
          z={LAYER.farArm - LAYER.torso}
        />
        <group
          position={at(rig, 'head', 'torso', LAYER.head - LAYER.torso)}
          ref={(node) => { joints.head = node; }}
        >
          <SpritePart part={rig.head} pixelScale={scale} />
          <group
            position={at(
              rig,
              'ponytail',
              'head',
              LAYER.ponytail - LAYER.head,
            )}
            ref={(node) => { joints.ponytail = node; }}
          >
            <SpritePart part={rig.ponytail} pixelScale={scale} />
          </group>
        </group>
        <Arm
          joints={joints}
          rig={rig}
          z={LAYER.nearArm - LAYER.torso}
        />
      </group>

      <group
        position={at(rig, 'thigh', null, LAYER.nearLeg)}
        ref={(node) => { joints.thigh = node; }}
      >
        <SpritePart part={rig.thigh} pixelScale={scale} />
        <group
          position={at(rig, 'shin', 'thigh')}
          ref={(node) => { joints.shin = node; }}
        >
          <SpritePart part={rig.shin} pixelScale={scale} />
          <group
            position={at(rig, 'boot', 'shin')}
            ref={(node) => { joints.boot = node; }}
          >
            <SpritePart part={rig.boot} pixelScale={scale} />
          </group>
        </group>
      </group>
    </>
  );
}

function Arm({
  far = false,
  joints,
  rig,
  z,
}: {
  readonly far?: boolean;
  readonly joints: SpriteJoints;
  readonly rig: LoadedSpriteRig;
  readonly z: number;
}) {
  const scale = rig.pixelScale;
  return (
    <group
      position={at(rig, 'upperArm', 'torso', z)}
      ref={(node) => {
        if (far) joints.farUpperArm = node;
        else joints.upperArm = node;
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
          if (far) joints.farForearm = node;
          else joints.forearm = node;
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
