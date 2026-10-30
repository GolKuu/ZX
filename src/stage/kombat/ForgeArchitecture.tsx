'use client';
import { Suspense } from 'react';
import { ForgePart } from '../fighter3d/ForgePart';
import type { KombatSurfaces } from './kombatMaterials';

/** Facade relief and paired ceremonial staircases stay outside the fighting lane. */
export function ForgeArchitecture({ surfaces }: { readonly surfaces: KombatSurfaces }) {
  return <group>
    <Suspense fallback={null}>
      {[-9.6,-5.8,-2,2,5.8,9.6].map(x => <group key={x} position={[x,-1,-13.8]}>
        <ForgePart name="pillar" /><ForgePart name="pillar_trim" />
      </group>)}
    </Suspense>
    {[-1,1].map(side => <group key={side} position={[side * 4.3,-.7,-7.8]}>
      {[0,1,2,3,4,5].map(step => <mesh key={step} position={[0,step*.18,step*-.42]} material={surfaces.stone} receiveShadow>
        <boxGeometry args={[3.3,.3,2.8-step*.36]} />
      </mesh>)}
    </group>)}
  </group>;
}
