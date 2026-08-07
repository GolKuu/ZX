'use client';

import type { CharacterBuild } from './characterBuild';
import type { FighterSurfaces } from './fighter3dMaterials';

type Props = { readonly build: CharacterBuild; readonly shoulder: number; readonly surfaces: FighterSurfaces };

/** Character-only geometry: authored for silhouette first, surface detail second. */
export function CharacterFeatures({ build, shoulder, surfaces }: Props) {
  switch (build.id) {
    case 'titan': return <Titan shoulder={shoulder} surfaces={surfaces} />;
    case 'mim': return <Mim shoulder={shoulder} surfaces={surfaces} />;
    case 'glitch': return <Glitch shoulder={shoulder} surfaces={surfaces} />;
    case 'lucky': return <Lucky shoulder={shoulder} surfaces={surfaces} />;
    case 'vorgh': return <Vorgh shoulder={shoulder} surfaces={surfaces} />;
  }
}

function Titan({ shoulder, surfaces }: Omit<Props, 'build'>) {
  return <group>
    {[-1, 1].map(side => <group key={side} position={[shoulder * 1.03 * side, .42, 0]} rotation={[0, 0, side * -.18]}>
      <mesh castShadow><boxGeometry args={[shoulder * .78, .2, .29]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <mesh castShadow position={[side * .025, .08, .01]}><boxGeometry args={[shoulder * .52, .07, .31]} /><primitive attach="material" object={surfaces.trim} /></mesh>
      <mesh position={[0, .015, .16]}><boxGeometry args={[shoulder * .48, .035, .012]} /><primitive attach="material" object={surfaces.glow} /></mesh>
      {[0, 1, 2].map(i => <mesh key={i} position={[side * (-.035 + i * .035), .055, .166]}><boxGeometry args={[.018, .035 + i * .012, .008]} /><primitive attach="material" object={surfaces.hair} /></mesh>)}
    </group>)}
    <mesh position={[0, .64, .115]}><boxGeometry args={[.12, .024, .018]} /><primitive attach="material" object={surfaces.glow} /></mesh>
    <mesh position={[0, .31, shoulder * .82]}><cylinderGeometry args={[.095, .095, .035, 20]} /><primitive attach="material" object={surfaces.trim} /></mesh>
    <mesh position={[0, .31, shoulder * .85]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.058, .015, 8, 20]} /><primitive attach="material" object={surfaces.glow} /></mesh>
    {[-1, 1].map(side => <group key={side} position={[side * shoulder * .62, .17, -.13]} rotation={[0, 0, side * .12]}>
      <mesh castShadow><cylinderGeometry args={[.025, .025, .32, 8]} /><primitive attach="material" object={surfaces.trim} /></mesh>
      <mesh position={[0, -.12, 0]}><sphereGeometry args={[.033, 8, 6]} /><primitive attach="material" object={surfaces.glow} /></mesh>
    </group>)}
    {[0, 1, 2].map(i => <mesh key={i} castShadow position={[0, .5 - i * .16, -shoulder * .88]} rotation={[1.15, 0, 0]}>
      <coneGeometry args={[.035, .16 - i * .02, 6]} /><primitive attach="material" object={surfaces.plate} />
    </mesh>)}
  </group>;
}

function Mim({ shoulder, surfaces }: Omit<Props, 'build'>) {
  return <group>
    <group position={[0, .62, .07]}>
      <mesh castShadow scale={[.92, 1.2, .72]}><sphereGeometry args={[.11, 18, 14]} /><primitive attach="material" object={surfaces.skin} /></mesh>
      <mesh position={[0, .025, .075]}><boxGeometry args={[.145, .018, .018]} /><primitive attach="material" object={surfaces.glow} /></mesh>
      <mesh castShadow position={[0, -.055, .07]} scale={[1, .4, 1]}><sphereGeometry args={[.075, 12, 8]} /><primitive attach="material" object={surfaces.plate} /></mesh>
    </group>
    {[-1, 1].map(side => <group key={side}>
      <mesh castShadow position={[side * shoulder * .98, .41, 0]} rotation={[0, 0, side * -.2]}><sphereGeometry args={[shoulder * .45, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55]} /><primitive attach="material" object={surfaces.skin} /></mesh>
      <mesh position={[side * shoulder * .83, .31, shoulder * .72]} rotation={[0, 0, side * .22]}><boxGeometry args={[.018, .29, .012]} /><primitive attach="material" object={surfaces.glow} /></mesh>
      <mesh castShadow position={[side * shoulder * .54, -.03, .005]} rotation={[.08, side * -.12, side * .18]}><dodecahedronGeometry args={[shoulder * .58, 0]} /><primitive attach="material" object={surfaces.skin} /></mesh>
      <mesh position={[side * shoulder * .55, -.03, shoulder * .48]} rotation={[0, 0, side * .18]}><boxGeometry args={[.018, .28, .012]} /><primitive attach="material" object={surfaces.glow} /></mesh>
    </group>)}
    {([[-.1, .06], [-.035, .09], [.035, .09], [.1, .06]] as const).map(([x, z], i) => <mesh key={i} position={[x, .03, z]} rotation={[0, 0, x * 2]}><cylinderGeometry args={[.008, .004, .42, 6]} /><primitive attach="material" object={surfaces.glow} /></mesh>)}
  </group>;
}

function Glitch({ shoulder, surfaces }: Omit<Props, 'build'>) {
  return <group>
    <mesh castShadow position={[0, .62, .025]} scale={[1, .92, .92]}><boxGeometry args={[.19, .19, .18]} /><primitive attach="material" object={surfaces.plate} /></mesh>
    <mesh position={[0, .64, .123]}><boxGeometry args={[.17, .035, .018]} /><primitive attach="material" object={surfaces.glow} /></mesh>
    {[-2, -1, 0, 1, 2].map(i => <mesh key={i} castShadow position={[0, .72 + Math.abs(i) * .018, -.055 - i * .035]} rotation={[.86 + i * .08, 0, 0]}><coneGeometry args={[.04 - Math.abs(i) * .004, .2 - Math.abs(i) * .015, 5]} /><primitive attach="material" object={surfaces.hair} /></mesh>)}
    {[-1, 1].map(side => <mesh key={side} position={[side * .105, .63, .01]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[.032, .01, 7, 14]} /><primitive attach="material" object={surfaces.glow} /></mesh>)}
    {[-1, 1].map(side => <group key={side} position={[side * shoulder * 1.06, .43, 0]} rotation={[0, 0, side * -.25]}>
      <mesh castShadow><octahedronGeometry args={[shoulder * .54, 0]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <mesh position={[0, .02, shoulder * .42]}><boxGeometry args={[shoulder * .62, .025, .015]} /><primitive attach="material" object={surfaces.glow} /></mesh>
    </group>)}
    {[-1, 1].map(side => <mesh key={side} castShadow position={[side * .13, .17, -.18]} rotation={[.28, 0, side * -.18]}><boxGeometry args={[.07, .4, .025]} /><primitive attach="material" object={surfaces.trim} /></mesh>)}
    {[0, 1, 2].map(i => <mesh key={i} position={[-.11 + i * .11, .28 - i * .055, shoulder * .79]} rotation={[0, 0, i * .35]}><boxGeometry args={[.045, .018, .012]} /><primitive attach="material" object={surfaces.glow} /></mesh>)}
  </group>;
}

function Lucky({ shoulder, surfaces }: Omit<Props, 'build'>) {
  return <group>
    {[-3, -2, -1, 0, 1, 2, 3].map(i => <mesh key={i} castShadow position={[i * .029, .71 + Math.abs(i) * .008, -.025]} rotation={[.35 + i * .045, 0, -i * .2]}><coneGeometry args={[.03, .2 - Math.abs(i) * .012, 7]} /><primitive attach="material" object={surfaces.hair} /></mesh>)}
    {[-1, 1].map(side => <mesh key={side} position={[side * .048, .64, .104]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.035, .006, 8, 16]} /><primitive attach="material" object={surfaces.trim} /></mesh>)}
    <mesh position={[0, .64, .105]}><boxGeometry args={[.035, .006, .01]} /><primitive attach="material" object={surfaces.trim} /></mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh castShadow position={[side * shoulder * .54, .15, -.075]} rotation={[.1, 0, side * .055]}><boxGeometry args={[shoulder * .95, .91, .035]} /><primitive attach="material" object={surfaces.body} /></mesh>
      <mesh position={[side * shoulder * .45, .11, -.052]} rotation={[.1, 0, side * .055]}><boxGeometry args={[shoulder * .68, .72, .012]} /><primitive attach="material" object={surfaces.secondary} /></mesh>
      <mesh position={[side * shoulder * .28, .31, shoulder * .74]} rotation={[0, 0, side * .43]}><boxGeometry args={[.035, .38, .025]} /><primitive attach="material" object={surfaces.trim} /></mesh>
      <mesh castShadow position={[side * shoulder * .34, .35, shoulder * .68]} rotation={[0, 0, side * .5]}><boxGeometry args={[shoulder * .34, .28, .025]} /><primitive attach="material" object={surfaces.trim} /></mesh>
    </group>)}
    {[.21, .11, .01].map(y => <mesh key={y} position={[.065, y, shoulder * .77]}><sphereGeometry args={[.015, 8, 6]} /><primitive attach="material" object={surfaces.trim} /></mesh>)}
    <mesh position={[-.12, .05, shoulder * .78]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[.055, .055, .012]} /><primitive attach="material" object={surfaces.glow} /></mesh>
  </group>;
}

function Vorgh({ shoulder, surfaces }: Omit<Props, 'build'>) {
  return <group>
    <mesh castShadow position={[0, .58, .095]} scale={[1.15, .7, 1.45]}><sphereGeometry args={[.105, 14, 10]} /><primitive attach="material" object={surfaces.skin} /></mesh>
    <mesh castShadow position={[0, .53, .17]} scale={[1.1, .42, 1]}><boxGeometry args={[.2, .12, .16]} /><primitive attach="material" object={surfaces.plate} /></mesh>
    {[-2, -1, 0, 1, 2].map(i => <mesh key={i} castShadow position={[i * .052, .7 - Math.abs(i) * .018, -.09]} rotation={[.55, 0, i * -.2]}><coneGeometry args={[.028, .17 - Math.abs(i) * .012, 6]} /><primitive attach="material" object={surfaces.plate} /></mesh>)}
    {[-1, 1].map(side => <group key={side}>
      <mesh castShadow position={[side * .075, .7, -.01]} rotation={[-.42, 0, side * -.58]}><coneGeometry args={[.038, .28, 7]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      <mesh castShadow position={[side * shoulder, .41, 0]} scale={[1.25, .8, 1]}><sphereGeometry args={[shoulder * .48, 12, 8]} /><primitive attach="material" object={surfaces.plate} /></mesh>
      {[0, 1, 2].map(i => <mesh key={`shoulder-${i}`} castShadow position={[side * (shoulder * .9 + i * .045), .48 - i * .035, -.02]} rotation={[0, 0, side * -.85]}><coneGeometry args={[.025, .16 - i * .018, 6]} /><primitive attach="material" object={surfaces.plate} /></mesh>)}
      {[0, 1, 2].map(i => <mesh key={i} castShadow position={[side * (.055 + i * .035), .49, .25]} rotation={[Math.PI / 2, 0, side * .08]}><coneGeometry args={[.012, .07, 5]} /><primitive attach="material" object={surfaces.skin} /></mesh>)}
    </group>)}
    {[-.1, -.035, .035, .1].map(x => <mesh key={x} position={[x, .54, .255]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[.012, .065, 5]} /><primitive attach="material" object={surfaces.skin} /></mesh>)}
    {[0, 1, 2, 3].map(i => <mesh key={i} castShadow position={[0, .49 - i * .14, -shoulder * .9]} rotation={[1.05, 0, 0]}><coneGeometry args={[.035, .2 - i * .025, 6]} /><primitive attach="material" object={surfaces.plate} /></mesh>)}
    {[-1, 1].map(side => <mesh key={side} position={[side * .11, .21, shoulder * .78]} rotation={[0, 0, side * .28]}><boxGeometry args={[.018, .25, .015]} /><primitive attach="material" object={surfaces.glow} /></mesh>)}
  </group>;
}
