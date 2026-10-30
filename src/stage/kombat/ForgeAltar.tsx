'use client';
import { Suspense } from 'react';
import { ForgePart } from '../fighter3d/ForgePart';

/** The focal landmark sits behind the combat plane, never in the camera corridor. */
export function ForgeAltar() {
  return <Suspense fallback={null}>
    <group position={[0, -.55, -10]} scale={1.25}>
      {['altar', 'altar_channel1', 'altar_channel-1', 'orb', 'orbit_0', 'orbit_1', 'orbit_2'].map(name => <ForgePart key={name} name={name} />)}
      <pointLight position={[0, 2.7, .4]} color="#8ccfff" intensity={14} distance={9} />
    </group>
  </Suspense>;
}
