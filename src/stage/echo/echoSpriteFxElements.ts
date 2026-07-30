import type { Group, Object3D } from 'three';
import type { EchoHabit } from './echoObservation.js';
import type { EchoSpriteFxGroups } from './echoSpriteFxLayout.js';

export function showReticle(
  group: Group | null,
  x: number,
  amount: number,
  time: number,
  progress: number,
  final: boolean,
  habit: EchoHabit,
): void {
  if (group === null || amount < 0.02) return;
  group.visible = true;
  group.position.set(x, habit === 'jump' ? 1.42 : 1.24, 0.16);
  group.rotation.z = time * (final ? 0.92 : habit === 'cadence' ? 0.72 : 0.38);
  const collapse = final ? 1 - progress * 0.42 : 1;
  const guardTightening = habit === 'guard' ? 0.84 : 1;
  group.scale.setScalar((0.62 + amount * 0.48) * collapse * guardTightening);
  group.children.forEach((ring, index) => {
    ring.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.016;
  });
}

export function showPaths(
  group: Group | null,
  forward: -1 | 1,
  distance: number,
  amount: number,
  progress: number,
  final: boolean,
  habit: EchoHabit,
): void {
  if (group === null || amount < 0.03) return;
  group.visible = true;
  group.children.forEach((line, index) => {
    const isOutcome = index === 3;
    line.visible = !final || progress < 0.58 || isOutcome;
    const branch = (index - 3) * (final ? 0.18 * (1 - progress) : 0.12);
    const jumpArc = habit === 'jump' ? Math.abs(index - 3) * 0.08 : 0;
    const dashReach = habit === 'dash' ? 0.08 * index : 0;
    line.position.set(
      forward * distance * (0.34 + index * 0.075 + dashReach),
      0.72 + index * 0.16 + jumpArc,
      0.12 + Math.abs(index - 3) * 0.012,
    );
    line.rotation.z = forward * (-0.38 + index * 0.125 + branch);
    line.scale.x = amount * (isOutcome ? 1.2 : 0.78);
  });
}

export function showFragments(
  group: Group | null,
  forward: -1 | 1,
  amount: number,
  time: number,
  habit: EchoHabit,
): void {
  if (group === null || amount < 0.03) return;
  group.visible = true;
  const cadence = habit === 'cadence' ? 1.8 : 1;
  group.children.forEach((fragment, index) => {
    const phase = time * cadence * (0.5 + (index % 3) * 0.08) + index * 1.7;
    const radius = 0.52 + (index % 4) * 0.17;
    fragment.position.set(
      forward * (0.12 + Math.cos(phase) * radius),
      1.18 + Math.sin(phase * 1.27) * 0.76,
      0.1 + Math.sin(phase) * 0.04,
    );
    fragment.rotation.z = phase * 0.7;
    fragment.scale.x = amount;
  });
}

export function showClones(
  group: Group | null,
  forward: -1 | 1,
  distance: number,
  amount: number,
  progress: number,
  perfect: boolean,
  overload: boolean,
  final: boolean,
  habit: EchoHabit,
): void {
  if (group === null || amount < 0.48) return;
  group.visible = true;
  group.children.forEach((clone, index) => {
    const outcome = index === 2;
    const counterBeat = Math.max(0, Math.min(1, progress * 7 - index * 0.72));
    clone.visible = (!final || progress < 0.62 || outcome)
      && (!perfect || counterBeat > 0);
    const spread = overload ? (index - 2) * 0.42 : (index - 2) * 0.22;
    const habitLift = habit === 'jump' ? Math.abs(index - 2) * 0.13 : 0;
    const counterLunge = perfect ? counterBeat * 0.38 : 0;
    clone.position.set(
      forward * (distance * (0.28 + index * 0.105) + counterLunge),
      Math.abs(index - 2) * 0.05 + habitLift,
      -0.08 + Math.abs(index - 2) * 0.015,
    );
    clone.rotation.z = spread * (1 - progress * 0.45)
      + (perfect ? (1 - counterBeat) * 0.18 : 0);
    clone.scale.setScalar((0.52 + amount * 0.2) * (outcome ? 1.08 : 0.9));
  });
}

export function hideEchoFx(groups: EchoSpriteFxGroups): void {
  (Object.values(groups) as Array<Object3D | null>).forEach((group) => {
    if (group !== null) group.visible = false;
  });
}
