'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Group } from 'three';
import type { CharacterBuild } from './characterBuild';
import { CharacterFeatures } from './CharacterFeatures';
import type { FighterSurfaces } from './fighter3dMaterials';

/**
 * The joints the pose code is allowed to move.
 *
 * A deliberately small skeleton: hips, torso, head, and one hinge per limb with
 * a second hinge at the elbow and knee. That is enough for every pose a 2D
 * fighting game needs — the readable shapes are all in the shoulder, hip and
 * knee angles — and it keeps the whole rig at a couple of dozen draw calls
 * rather than the several hundred a full humanoid would cost.
 */
export interface FighterJoints {
  readonly root: Group;
  readonly hips: Group;
  readonly torso: Group;
  readonly head: Group;
  readonly leftArm: Group;
  readonly leftForearm: Group;
  readonly rightArm: Group;
  readonly rightForearm: Group;
  readonly leftLeg: Group;
  readonly leftShin: Group;
  readonly rightLeg: Group;
  readonly rightShin: Group;
}

export const FighterSkeleton = forwardRef<
  FighterJoints,
  { readonly build: CharacterBuild; readonly surfaces: FighterSurfaces }
>(function FighterSkeleton({ build, surfaces }, ref) {
  const joints: Record<keyof FighterJoints, React.RefObject<Group | null>> = {
    root: useRef<Group>(null),
    hips: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    leftForearm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    rightForearm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    leftShin: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    rightShin: useRef<Group>(null),
  };

  useImperativeHandle(ref, () => ({
    root: joints.root.current!,
    hips: joints.hips.current!,
    torso: joints.torso.current!,
    head: joints.head.current!,
    leftArm: joints.leftArm.current!,
    leftForearm: joints.leftForearm.current!,
    rightArm: joints.rightArm.current!,
    rightForearm: joints.rightForearm.current!,
    leftLeg: joints.leftLeg.current!,
    leftShin: joints.leftShin.current!,
    rightLeg: joints.rightLeg.current!,
    rightShin: joints.rightShin.current!,
  }), []);

  const shoulder = 0.19 * build.shoulders;
  const hip = 0.115 * build.limbs;
  const limb = 0.062 * build.limbs;

  return (
    <group ref={joints.root} scale={build.height}>
      <group ref={joints.hips} position={[0, 0.86, 0]}>
        <Segment length={0.2} material={surfaces.under} radius={hip * 1.15} />

        <group ref={joints.torso} position={[0, 0.16, 0]}>
          {/* Chest. Tapered so the shoulders read wider than the waist, which
              is most of what makes a body look like a body. */}
          <mesh castShadow position={[0, 0.24, 0]} receiveShadow>
            <cylinderGeometry args={[shoulder, hip * 1.05, 0.52, 12, 1]} />
            <primitive attach="material" object={surfaces.body} />
          </mesh>
          <mesh position={[0, 0.24, 0]} scale={1.05}>
            <cylinderGeometry args={[shoulder, hip * 1.05, 0.52, 12, 1]} />
            <primitive attach="material" object={surfaces.outline} />
          </mesh>
          {/* Chest light: the character's colour, worn on the body. */}
          <mesh position={[0, 0.3, shoulder * 0.82]}>
            <sphereGeometry args={[0.036 * build.bulk, 10, 8]} />
            <primitive attach="material" object={surfaces.glow} />
          </mesh>

          <group ref={joints.head} position={[0, 0.62, 0]}>
            <mesh castShadow receiveShadow scale={build.head}>
              <sphereGeometry args={[0.115, 14, 12]} />
              <primitive attach="material" object={surfaces.plate} />
            </mesh>
          </group>

          <Arm
            forearmRef={joints.leftForearm}
            joint={joints.leftArm}
            position={[-shoulder, 0.4, 0]}
            radius={limb}
            surfaces={surfaces}
          />
          <Arm
            forearmRef={joints.rightForearm}
            joint={joints.rightArm}
            position={[shoulder, 0.4, 0]}
            radius={limb}
            surfaces={surfaces}
          />
          <CharacterFeatures build={build} shoulder={shoulder} surfaces={surfaces} />
        </group>

        <Leg
          joint={joints.leftLeg}
          position={[-hip * 0.62, -0.1, 0]}
          radius={limb * 1.12}
          shinRef={joints.leftShin}
          surfaces={surfaces}
        />
        <Leg
          joint={joints.rightLeg}
          position={[hip * 0.62, -0.1, 0]}
          radius={limb * 1.12}
          shinRef={joints.rightShin}
          surfaces={surfaces}
        />
      </group>
    </group>
  );
});

/** A capsule hanging downward from its joint, so rotation reads as a swing. */
function Segment({
  length,
  material,
  radius,
}: {
  readonly length: number;
  readonly material: FighterSurfaces['body'];
  readonly radius: number;
}) {
  return (
    <mesh castShadow position={[0, -length * 0.5, 0]} receiveShadow>
      <capsuleGeometry args={[radius, length, 4, 10]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

function Arm({
  forearmRef,
  joint,
  position,
  radius,
  surfaces,
}: {
  readonly forearmRef: React.RefObject<Group | null>;
  readonly joint: React.RefObject<Group | null>;
  readonly position: readonly [number, number, number];
  readonly radius: number;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <group position={[position[0], position[1], position[2]]} ref={joint}>
      <Segment length={0.26} material={surfaces.body} radius={radius} />
      <group position={[0, -0.3, 0]} ref={forearmRef}>
        <Segment length={0.24} material={surfaces.body} radius={radius * 0.9} />
        <mesh castShadow position={[0, -0.34, 0]} receiveShadow>
          <sphereGeometry args={[radius * 1.35, 10, 8]} />
          <primitive attach="material" object={surfaces.plate} />
        </mesh>
      </group>
    </group>
  );
}

function Leg({
  joint,
  position,
  radius,
  shinRef,
  surfaces,
}: {
  readonly joint: React.RefObject<Group | null>;
  readonly position: readonly [number, number, number];
  readonly radius: number;
  readonly shinRef: React.RefObject<Group | null>;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <group position={[position[0], position[1], position[2]]} ref={joint}>
      <Segment length={0.34} material={surfaces.under} radius={radius} />
      <group position={[0, -0.4, 0]} ref={shinRef}>
        <Segment length={0.32} material={surfaces.under} radius={radius * 0.86} />
        {/* Boot. Sits forward of the ankle so the foot reads as a foot. */}
        <mesh castShadow position={[0, -0.44, 0.04]} receiveShadow>
          <boxGeometry args={[radius * 2.4, 0.09, radius * 4.2]} />
          <primitive attach="material" object={surfaces.plate} />
        </mesh>
      </group>
    </group>
  );
}
