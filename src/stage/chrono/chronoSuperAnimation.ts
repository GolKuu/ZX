import { MathUtils, type Group } from 'three';
import {
  CHRONO_SUPER_MOVE_IDS,
} from '@/src/data/chrono-super-moves';
import type { ChronoRig } from './chronoRig';

export function applyChronoSuperAnimation(
  rig: ChronoRig,
  moveId: string,
  progress: number,
  facing: -1 | 1,
): boolean {
  if (moveId === CHRONO_SUPER_MOVE_IDS.rewind) {
    clockCollapse(rig, progress, facing);
    return true;
  }
  if (moveId === CHRONO_SUPER_MOVE_IDS.outcomes) {
    parallelExecution(rig, progress, facing);
    return true;
  }
  if (moveId === CHRONO_SUPER_MOVE_IDS.inevitability) {
    absoluteTimeline(rig, progress, facing);
    return true;
  }
  return false;
}

function clockCollapse(
  rig: ChronoRig,
  progress: number,
  facing: -1 | 1,
): void {
  const authority = envelope(progress, 0.04, 0.22, 0.78, 0.98);
  const strikes = pulseTrain(progress, 5, 0.26, 0.7);
  rig.root.position.x += facing * strikes * 0.22;
  rig.torso.rotation.y += facing * authority * 0.22;
  rig.head.rotation.y -= facing * authority * 0.08;
  rig.leftArm.rotation.z += authority * 0.72;
  rig.rightArm.rotation.z -= authority * 0.72;
  rig.coat.rotation.z -= facing * strikes * 0.12;
  showSuperClock(rig, facing, authority, 1.06);
}

function parallelExecution(
  rig: ChronoRig,
  progress: number,
  facing: -1 | 1,
): void {
  const authority = envelope(progress, 0.03, 0.18, 0.84, 0.99);
  const convergence = envelope(progress, 0.42, 0.54, 0.72, 0.82);
  rig.root.position.y += authority * 0.04;
  rig.torso.rotation.y += facing * authority * 0.12;
  rig.leftArm.rotation.z += authority * 0.5;
  rig.rightArm.rotation.z -= authority * 0.5;
  rig.leftArm.position.x -= authority * 0.13;
  rig.rightArm.position.x += authority * 0.13;
  rig.head.rotation.y -= facing * convergence * 0.14;
  showSuperClock(rig, facing, Math.max(authority * 0.65, convergence), 1.32);
}

function absoluteTimeline(
  rig: ChronoRig,
  progress: number,
  facing: -1 | 1,
): void {
  const verdict = envelope(progress, 0.04, 0.16, 0.7, 0.96);
  const fracture = envelope(progress, 0.68, 0.76, 0.87, 0.94);
  rig.root.position.y += verdict * 0.06;
  rig.torso.rotation.y += facing * verdict * 0.08;
  rig.head.rotation.y -= facing * verdict * 0.06;
  rig.leftArm.rotation.z += verdict * 0.34;
  rig.rightArm.rotation.z -= verdict * 0.92;
  rig.rightArm.position.x += facing * verdict * 0.16;
  rig.coat.rotation.z -= facing * fracture * 0.2;
  showSuperClock(rig, facing, Math.max(verdict * 0.52, fracture), 1.62);
}

function showSuperClock(
  rig: ChronoRig,
  facing: -1 | 1,
  amount: number,
  size: number,
): void {
  rig.effect.visible = amount > 0.02;
  rig.effect.position.set(facing * 0.86, 1.26, 0.2);
  rig.effect.rotation.z = facing * amount * Math.PI * 1.6;
  rig.effect.scale.setScalar(size * (0.62 + amount * 0.38));
  rig.fragments.rotation.z += facing * amount * 0.24;
}

function pulseTrain(
  progress: number,
  count: number,
  start: number,
  end: number,
): number {
  const window = MathUtils.clamp((progress - start) / (end - start), 0, 1);
  return Math.pow(Math.max(0, Math.sin(window * Math.PI * count)), 5);
}

function envelope(
  value: number,
  start: number,
  peak: number,
  release: number,
  end: number,
): number {
  if (value <= start || value >= end) return 0;
  if (value < peak) return MathUtils.smoothstep(value, start, peak);
  if (value <= release) return 1;
  return 1 - MathUtils.smoothstep(value, release, end);
}
