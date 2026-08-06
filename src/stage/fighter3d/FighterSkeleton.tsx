'use client';

import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
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
  const root = useRef<Group>(null);
  const hips = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const leftForearm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const rightForearm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const leftShin = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const rightShin = useRef<Group>(null);

  const rootRef = useCallback((node: Group | null) => { root.current = node; }, []);
  const hipsRef = useCallback((node: Group | null) => { hips.current = node; }, []);
  const torsoRef = useCallback((node: Group | null) => { torso.current = node; }, []);
  const headRef = useCallback((node: Group | null) => { head.current = node; }, []);
  const leftArmRef = useCallback((node: Group | null) => { leftArm.current = node; }, []);
  const leftForearmRef = useCallback((node: Group | null) => { leftForearm.current = node; }, []);
  const rightArmRef = useCallback((node: Group | null) => { rightArm.current = node; }, []);
  const rightForearmRef = useCallback((node: Group | null) => { rightForearm.current = node; }, []);
  const leftLegRef = useCallback((node: Group | null) => { leftLeg.current = node; }, []);
  const leftShinRef = useCallback((node: Group | null) => { leftShin.current = node; }, []);
  const rightLegRef = useCallback((node: Group | null) => { rightLeg.current = node; }, []);
  const rightShinRef = useCallback((node: Group | null) => { rightShin.current = node; }, []);

  useImperativeHandle(ref, () => ({
    root: root.current!, hips: hips.current!, torso: torso.current!, head: head.current!,
    leftArm: leftArm.current!, leftForearm: leftForearm.current!,
    rightArm: rightArm.current!, rightForearm: rightForearm.current!,
    leftLeg: leftLeg.current!, leftShin: leftShin.current!,
    rightLeg: rightLeg.current!, rightShin: rightShin.current!,
  }), [head, hips, leftArm, leftForearm, leftLeg, leftShin, rightArm, rightForearm, rightLeg, rightShin, root, torso]);

  const shoulder = 0.19 * build.shoulders;
  const hip = 0.115 * build.limbs;
  const limb = 0.062 * build.limbs;

  return (
    <group ref={rootRef} scale={build.height}>
      <group ref={hipsRef} position={[0, 0.86, 0]}>
        <Segment length={0.2} material={surfaces.under} radius={hip * 1.15} />

        <group ref={torsoRef} position={[0, 0.16, 0]}>
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

          <group ref={headRef} position={[0, 0.62, 0]}>
            <mesh castShadow receiveShadow scale={build.head}>
              <sphereGeometry args={[0.115, 14, 12]} />
              <primitive attach="material" object={surfaces.plate} />
            </mesh>
          </group>

          <Arm
            forearmRef={leftForearmRef}
            joint={leftArmRef}
            position={[-shoulder, 0.4, 0]}
            radius={limb}
            surfaces={surfaces}
          />
          <Arm
            forearmRef={rightForearmRef}
            joint={rightArmRef}
            position={[shoulder, 0.4, 0]}
            radius={limb}
            surfaces={surfaces}
          />
          <CharacterFeatures build={build} shoulder={shoulder} surfaces={surfaces} />
        </group>

        <Leg
          joint={leftLegRef}
          position={[-hip * 0.62, -0.1, 0]}
          radius={limb * 1.12}
          shinRef={leftShinRef}
          surfaces={surfaces}
        />
        <Leg
          joint={rightLegRef}
          position={[hip * 0.62, -0.1, 0]}
          radius={limb * 1.12}
          shinRef={rightShinRef}
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
  readonly forearmRef: (node: Group | null) => void;
  readonly joint: (node: Group | null) => void;
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
  readonly joint: (node: Group | null) => void;
  readonly position: readonly [number, number, number];
  readonly radius: number;
  readonly shinRef: (node: Group | null) => void;
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
