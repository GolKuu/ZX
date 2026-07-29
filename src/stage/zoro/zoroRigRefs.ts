import type { RefObject } from 'react';
import type { Group } from 'three';
import type { ZoroRig } from './zoroRig';

export type ZoroRigRefs = {
  readonly [Key in keyof ZoroRig]: RefObject<Group | null>;
};

export function readZoroRig(refs: ZoroRigRefs): ZoroRig | null {
  const root = refs.root.current;
  const torso = refs.torso.current;
  const head = refs.head.current;
  const leftArm = refs.leftArm.current;
  const rightArm = refs.rightArm.current;
  const leftLeg = refs.leftLeg.current;
  const rightLeg = refs.rightLeg.current;
  const leftSword = refs.leftSword.current;
  const rightSword = refs.rightSword.current;
  const mouthSword = refs.mouthSword.current;
  const slash = refs.slash.current;
  const projectile = refs.projectile.current;
  const aura = refs.aura.current;
  const echoes = refs.echoes.current;

  if (
    !root || !torso || !head || !leftArm || !rightArm
    || !leftLeg || !rightLeg || !leftSword || !rightSword
    || !mouthSword || !slash || !projectile || !aura || !echoes
  ) {
    return null;
  }
  return {
    root,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    leftSword,
    rightSword,
    mouthSword,
    slash,
    projectile,
    aura,
    echoes,
  };
}
