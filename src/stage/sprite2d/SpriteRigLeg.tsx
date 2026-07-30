'use client';

import { SpritePart } from './SpritePart';
import type { SetSpriteJoint } from './SpriteRigBody';
import type { LoadedSpriteRig } from './spriteRig';

const FAR_TINT = '#b9a7bd';

/**
 * A rig can provide either one authored leg or the legacy three-piece chain.
 * Whole legs keep slim character art intact; segmented rigs retain knee motion.
 */
export function SpriteRigLeg({
  far = false,
  rig,
  rootPosition,
  setJoint,
}: {
  readonly far?: boolean;
  readonly rig: LoadedSpriteRig;
  readonly rootPosition: [number, number, number];
  readonly setJoint: SetSpriteJoint;
}) {
  const tint = far ? FAR_TINT : undefined;
  const wholeLeg = rig.leg;

  return (
    <group
      position={rootPosition}
      ref={(node) => {
        setJoint(far ? 'farThigh' : 'thigh', node);
      }}
    >
      {wholeLeg === undefined ? (
        <>
          <SpritePart part={rig.thigh} pixelScale={rig.pixelScale} tint={tint} />
          <group
            position={jointOffset(rig, 'shin', 'thigh')}
            ref={(node) => {
              setJoint(far ? 'farShin' : 'shin', node);
            }}
          >
            <SpritePart part={rig.shin} pixelScale={rig.pixelScale} tint={tint} />
            <group
              position={jointOffset(rig, 'boot', 'shin')}
              ref={(node) => {
                setJoint(far ? 'farBoot' : 'boot', node);
              }}
            >
              <SpritePart part={rig.boot} pixelScale={rig.pixelScale} tint={tint} />
            </group>
          </group>
        </>
      ) : (
        <SpritePart part={wholeLeg} pixelScale={rig.pixelScale} tint={tint} />
      )}
    </group>
  );
}

function jointOffset(
  rig: LoadedSpriteRig,
  part: 'shin' | 'boot',
  parent: 'thigh' | 'shin',
): [number, number, number] {
  const joint = rig[part]?.joint;
  const anchor = rig[parent]?.joint;
  if (joint === undefined || anchor === undefined) return [0, 0, 0];
  return [
    (joint[0] - anchor[0]) * rig.pixelScale,
    (anchor[1] - joint[1]) * rig.pixelScale,
    0,
  ];
}
