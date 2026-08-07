'use client';

import { forwardRef, useImperativeHandle, useRef, type RefObject } from 'react';
import type { Group, Material } from 'three';
import type { CharacterBuild } from './characterBuild';
import { CharacterFeatures } from './CharacterFeatures';
import type { FighterSurfaces } from './fighter3dMaterials';

export interface FighterJoints {
  readonly root: Group; readonly hips: Group; readonly torso: Group; readonly head: Group;
  readonly leftArm: Group; readonly leftForearm: Group; readonly rightArm: Group;
  readonly rightForearm: Group; readonly leftLeg: Group; readonly leftShin: Group;
  readonly rightLeg: Group; readonly rightShin: Group;
}

type JointRef = RefObject<Group | null>;

export const FighterSkeleton = forwardRef<
  FighterJoints,
  { readonly build: CharacterBuild; readonly surfaces: FighterSurfaces }
>(function FighterSkeleton({ build, surfaces }, ref) {
  const root = useRef<Group>(null); const hips = useRef<Group>(null);
  const torso = useRef<Group>(null); const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null); const leftForearm = useRef<Group>(null);
  const rightArm = useRef<Group>(null); const rightForearm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null); const leftShin = useRef<Group>(null);
  const rightLeg = useRef<Group>(null); const rightShin = useRef<Group>(null);
  useImperativeHandle(ref, () => ({
    root: root.current!, hips: hips.current!, torso: torso.current!, head: head.current!,
    leftArm: leftArm.current!, leftForearm: leftForearm.current!,
    rightArm: rightArm.current!, rightForearm: rightForearm.current!,
    leftLeg: leftLeg.current!, leftShin: leftShin.current!,
    rightLeg: rightLeg.current!, rightShin: rightShin.current!,
  }), []);

  const shoulder = 0.19 * build.shoulders;
  const hip = 0.115 * build.limbs;
  const limb = 0.062 * build.limbs;
  return (
    <group ref={root} scale={build.height * 1.52}>
      <group ref={hips} position={[0, 0.86, 0]}>
        <Pelvis hip={hip} surfaces={surfaces} />
        <group ref={torso} position={[0, 0.16, 0]}>
          <Torso build={build} hip={hip} shoulder={shoulder} surfaces={surfaces} />
          <group ref={head} position={[0, 0.62, 0]}>
            <Head build={build} surfaces={surfaces} />
          </group>
          <Arm build={build} joint={leftArm} forearmRef={leftForearm} position={[-shoulder, .4, 0]} radius={limb} surfaces={surfaces} />
          <Arm build={build} joint={rightArm} forearmRef={rightForearm} position={[shoulder, .4, 0]} radius={limb} surfaces={surfaces} />
          <CharacterFeatures build={build} shoulder={shoulder} surfaces={surfaces} />
        </group>
        <Leg build={build} joint={leftLeg} shinRef={leftShin} position={[-hip * .62, -.1, 0]} radius={limb * 1.12} surfaces={surfaces} />
        <Leg build={build} joint={rightLeg} shinRef={rightShin} position={[hip * .62, -.1, 0]} radius={limb * 1.12} surfaces={surfaces} />
      </group>
    </group>
  );
});

function Pelvis({ hip, surfaces }: { hip: number; surfaces: FighterSurfaces }) {
  return <group>
    <mesh castShadow receiveShadow position={[0, -.08, 0]} scale={[1.35, .7, .9]}>
      <capsuleGeometry args={[hip, .16, 4, 10]} /><primitive attach="material" object={surfaces.under} />
    </mesh>
    <mesh castShadow position={[0, .015, .045]}><boxGeometry args={[hip * 2.5, .075, .13]} /><primitive attach="material" object={surfaces.trim} /></mesh>
    <mesh position={[0, .015, .118]}><boxGeometry args={[.045, .055, .018]} /><primitive attach="material" object={surfaces.glow} /></mesh>
  </group>;
}

function Torso({ build, hip, shoulder, surfaces }: { build: CharacterBuild; hip: number; shoulder: number; surfaces: FighterSurfaces }) {
  return <group>
    <mesh castShadow receiveShadow position={[0, .225, 0]} scale={[1, 1, build.bulk * .86]}>
      <cylinderGeometry args={[shoulder, hip * 1.08, .48, 12, 2]} /><primitive attach="material" object={surfaces.body} />
    </mesh>
    <mesh castShadow position={[0, .43, .015]} scale={[1, .55, .72]}>
      <capsuleGeometry args={[shoulder * .72, shoulder * .55, 4, 10]} /><primitive attach="material" object={surfaces.plate} />
    </mesh>
    {[-1, 1].map(side => <mesh key={side} castShadow position={[side * shoulder * .48, .32, shoulder * .52]} rotation={[0, side * .16, side * -.08]} scale={[1, .72, .5]}>
      <dodecahedronGeometry args={[shoulder * .48, 0]} /><primitive attach="material" object={surfaces.plate} />
    </mesh>)}
    {[0, 1, 2].map((i) => <mesh key={i} castShadow position={[0, .18 - i * .085, shoulder * .69]} scale={[1 - i * .08, 1, 1]}>
      <boxGeometry args={[shoulder * 1.18, .06, .026]} /><primitive attach="material" object={i === 0 ? surfaces.trim : surfaces.plate} />
    </mesh>)}
    {[-1, 1].map(side => <mesh key={side} castShadow position={[side * shoulder * .58, .12, shoulder * .34]} rotation={[0, 0, side * .16]}>
      <boxGeometry args={[shoulder * .35, .25, .035]} /><primitive attach="material" object={surfaces.body} />
    </mesh>)}
    <mesh position={[0, .31, shoulder * .78]}><torusGeometry args={[.045 * build.bulk, .012, 8, 18]} /><primitive attach="material" object={surfaces.glow} /></mesh>
  </group>;
}

function Head({ build, surfaces }: { build: CharacterBuild; surfaces: FighterSurfaces }) {
  return <group scale={build.head}>
    <mesh castShadow position={[0, -.115, 0]}><cylinderGeometry args={[.048, .06, .12, 10]} /><primitive attach="material" object={surfaces.under} /></mesh>
    <mesh castShadow receiveShadow scale={[.88, 1.08, .88]}><dodecahedronGeometry args={[.115, 2]} /><primitive attach="material" object={surfaces.skin} /></mesh>
    <mesh castShadow position={[0, .055, -.035]} scale={[.9, .45, .72]}><dodecahedronGeometry args={[.095, 1]} /><primitive attach="material" object={surfaces.plate} /></mesh>
    <mesh castShadow position={[0, -.045, .088]} scale={[.82, .55, .75]}><boxGeometry args={[.17, .12, .08]} /><primitive attach="material" object={surfaces.plate} /></mesh>
  </group>;
}

function Segment({ length, material, radius }: { length: number; material: Material; radius: number }) {
  return <mesh castShadow receiveShadow position={[0, -length * .5, 0]}><capsuleGeometry args={[radius, length, 4, 10]} /><primitive attach="material" object={material} /></mesh>;
}

function Arm({ build, forearmRef, joint, position, radius, surfaces }: { build: CharacterBuild; forearmRef: JointRef; joint: JointRef; position: readonly [number, number, number]; radius: number; surfaces: FighterSurfaces }) {
  const heavy = build.id === 'titan' ? 1.42 : build.id === 'vorgh' ? 1.25 : 1;
  return <group position={position} ref={joint}>
    <mesh castShadow position={[0, -.035, 0]} scale={[1.35, .72, 1.2]}><sphereGeometry args={[radius, 10, 8]} /><primitive attach="material" object={surfaces.plate} /></mesh>
    <Segment length={.25} material={surfaces.body} radius={radius} />
    <group position={[0, -.3, 0]} ref={forearmRef}>
      <mesh castShadow scale={[1.12, .7, 1.12]}><sphereGeometry args={[radius, 10, 8]} /><primitive attach="material" object={surfaces.trim} /></mesh>
      <Segment length={.23} material={surfaces.under} radius={radius * .86} />
      <mesh castShadow position={[0, -.18, .008]} scale={[1.22 * heavy, 1.45, 1.08 * heavy]}><dodecahedronGeometry args={[radius * 1.18, 1]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <mesh castShadow position={[0, -.34, .025]} scale={[heavy, .9, 1.16 * heavy]}><dodecahedronGeometry args={[radius * 1.32, 1]} /><primitive attach="material" object={surfaces.skin} /></mesh>
      <HandDetails build={build} radius={radius} surfaces={surfaces} />
    </group>
  </group>;
}

function HandDetails({ build, radius, surfaces }: { build: CharacterBuild; radius: number; surfaces: FighterSurfaces }) {
  if (build.id === 'vorgh') return <>{[-1.5, -.5, .5, 1.5].map(i => <mesh key={i} castShadow position={[i * radius * .55, -.39, .08]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[radius * .18, radius * 1.35, 5]} /><primitive attach="material" object={surfaces.hair} /></mesh>)}</>;
  return <>{[-1.5, -.5, .5, 1.5].map(i => <mesh key={i} castShadow position={[i * radius * .42, -.365, .07]}><boxGeometry args={[radius * .32, radius * .75, radius * .48]} /><primitive attach="material" object={build.id === 'titan' ? surfaces.plate : surfaces.skin} /></mesh>)}</>;
}

function Leg({ build, joint, position, radius, shinRef, surfaces }: { build: CharacterBuild; joint: JointRef; position: readonly [number, number, number]; radius: number; shinRef: JointRef; surfaces: FighterSurfaces }) {
  return <group position={position} ref={joint}>
    <Segment length={.33} material={surfaces.under} radius={radius} />
    <mesh castShadow position={[0, -.17, .035]} scale={[1.05, 1.5, .72]}><boxGeometry args={[radius * 1.75, .2, radius * 1.45]} /><primitive attach="material" object={surfaces.body} /></mesh>
    <group position={[0, -.4, 0]} ref={shinRef}>
      <mesh castShadow position={[0, .01, .035]} scale={[1.18, .68, 1]}><sphereGeometry args={[radius, 10, 8]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <Segment length={.3} material={surfaces.under} radius={radius * .84} />
      <mesh castShadow position={[0, -.2, .025]} scale={[1, 1.6, .75]}><boxGeometry args={[radius * 1.85, .23, radius * 1.6]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <mesh castShadow position={[0, -.43, .075]} receiveShadow><boxGeometry args={[radius * 2.25, .1, radius * 4.1]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <mesh castShadow position={[0, -.435, .19]}><boxGeometry args={[radius * 2.05, .07, radius * 1.2]} /><primitive attach="material" object={surfaces.trim} /></mesh>
      {build.id === 'vorgh' ? [-1, 0, 1].map(i => <mesh key={i} castShadow position={[i * radius * .62, -.43, .31]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[radius * .22, radius * 1.45, 5]} /><primitive attach="material" object={surfaces.hair} /></mesh>) : null}
    </group>
  </group>;
}
