'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Group } from 'three';
import type { CharacterBuild } from './characterBuild';
import type { FighterJoints } from './FighterSkeleton';
import { ForgeHeroPart } from './ForgeHeroPart';

/** All surfaces stay attached to their anatomical pivot throughout attacks. */
export const ForgeHeroSkeleton = forwardRef<FighterJoints, { readonly build: CharacterBuild }>(function ForgeHeroSkeleton({ build }, ref) {
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
    leftLeg: leftLeg.current!, leftShin: leftShin.current!, rightLeg: rightLeg.current!, rightShin: rightShin.current!,
  }), []);
  const variant = build.id === 'vorgh' ? 'cinder' : 'ion';
  const shoulder = .205 * build.shoulders;
  const hip = .115 * build.limbs;
  const part = (piece: string) => <ForgeHeroPart name={`${variant}_${piece}`} />;
  return <group name={`forge-${variant}`} ref={root} scale={build.height * 1.52}>
    <group ref={hips} position={[0,.86,0]}>
      <group scale={[build.limbs,1,build.bulk]}>{part('pelvis')}</group>
      <group ref={torso} position={[0,.16,0]}>
        <group scale={[build.shoulders,1,build.bulk]}>{part('torso')}</group>
        <group ref={head} position={[0,.62,0]} scale={build.head}>{part('head')}</group>
        <group ref={leftArm} position={[-shoulder,.4,0]}>
          <group scale={[build.limbs,1,build.limbs]}>{part('arm')}</group>
          <group ref={leftForearm} position={[0,-.3,0]}><group scale={[build.limbs,1,build.limbs]}>{part('forearm')}</group></group>
        </group>
        <group ref={rightArm} position={[shoulder,.4,0]}>
          <group scale={[build.limbs,1,build.limbs]}>{part('arm')}</group>
          <group ref={rightForearm} position={[0,-.3,0]}><group scale={[build.limbs,1,build.limbs]}>{part('forearm')}</group></group>
        </group>
      </group>
      <group ref={leftLeg} position={[-hip,-.1,0]}>
        <group scale={[build.limbs,1,build.limbs]}>{part('thigh')}</group>
        <group ref={leftShin} position={[0,-.4,0]}><group scale={[build.limbs,1,build.limbs]}>{part('shin')}</group></group>
      </group>
      <group ref={rightLeg} position={[hip,-.1,0]}>
        <group scale={[build.limbs,1,build.limbs]}>{part('thigh')}</group>
        <group ref={rightShin} position={[0,-.4,0]}><group scale={[build.limbs,1,build.limbs]}>{part('shin')}</group></group>
      </group>
    </group>
  </group>;
});
