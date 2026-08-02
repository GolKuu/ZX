import type { Group } from 'three';

export function animateScarf(
  group: Group | null,
  time: number,
  actionFrame: number,
  active: boolean,
): void {
  if (group === null) return;
  if (!active) {
    group.rotation.z = 0.05;
    group.scale.set(1, 1, 1);
    group.position.y = 0;
    return;
  }
  const combatSnap = actionFrame > 0 ? Math.sin(actionFrame * 1.8) * 0.04 : 0;
  group.rotation.z = 0.05 + Math.sin(time * 3.1) * 0.045 + combatSnap;
  group.scale.y = 0.96 + Math.sin(time * 4.2 + 0.6) * 0.045;
  group.position.y = Math.sin(time * 2.7) * 0.018;
}

export function showGuardRift(
  group: Group | null,
  guardFrames: number,
  blockstun: number,
  crouching: boolean,
): void {
  if (group === null) return;
  group.visible = true;
  group.position.set(
    0.36,
    crouching ? 0.64 : blockstun > 14 ? 1.24 : 1.42,
    0.08,
  );
  const open = Math.min(1, guardFrames / 4);
  const impact = blockstun > 0 ? Math.min(1, blockstun / 18) : 0;
  group.scale.set(0.55 + open * 0.4 + impact * 0.22, 1.1 + impact * 0.32, 1);
  group.rotation.z = (crouching ? -0.52 : -0.18) + impact * 0.08;
}

export function showAttackTears(
  group: Group | null,
  progress: number,
  frame: number,
  normal: boolean,
): void {
  if (group === null) return;
  const impact = progress > 0.29 && progress < (normal ? 0.72 : 0.9);
  group.visible = impact && frame % 3 !== 1;
  group.position.x = (frame % 2 === 0 ? 0.14 : -0.12) * (0.5 + progress);
  group.scale.set(0.8 + progress * 0.45, 0.85 + progress * 0.18, 1);
}

export function showCorruptData(
  group: Group | null,
  progress: number,
  frame: number,
): void {
  if (group === null) return;
  const rawTravel = clamp((progress - 0.24) / 0.64);
  const steppedTravel = Math.floor(rawTravel * 9) / 9;
  group.visible = progress > 0.22 && progress < 0.91;
  group.position.set(0.65 + steppedTravel * 3, 1.15, 0.16);
  group.rotation.set(frame * 0.23, frame * 0.31, frame * 0.17);
  group.scale.setScalar(
    (0.72 + Math.sin(rawTravel * Math.PI) * 0.46)
    * (frame % 5 === 0 ? 1.34 : 1),
  );
}

export function showLagSpike(
  field: Group | null,
  ghosts: Group | null,
  screenTear: Group | null,
  progress: number,
  frame: number,
): void {
  if (field !== null) {
    field.visible = progress > 0.16 && progress < 0.92;
    field.rotation.y = Math.floor(progress * 10) * 0.42;
    field.scale.setScalar(0.45 + Math.sin(progress * Math.PI) * 0.88);
  }
  if (ghosts !== null) {
    ghosts.visible = progress > 0.22 && progress < 0.82 && frame % 4 !== 1;
    ghosts.position.set(frame % 2 === 0 ? -0.38 : 0.3, frame % 3 === 0 ? 0.06 : -0.02, 0);
  }
  if (screenTear !== null) {
    screenTear.visible = progress > 0.28 && progress < 0.76 && frame % 3 !== 1;
    screenTear.position.x = frame % 2 === 0 ? -0.82 : 0.64;
    screenTear.scale.y = frame % 5 === 0 ? 1.15 : 1;
  }
}

export function showDesync(
  ghosts: Group | null,
  tears: Group | null,
  progress: number,
  frame: number,
): void {
  if (ghosts !== null) {
    ghosts.visible = progress > 0.08 && progress < 0.94;
    const delayed = Math.floor(progress * 7) / 7;
    ghosts.position.set(-0.48 - delayed * 0.5, delayed * 0.24, -0.05);
    ghosts.rotation.z = frame % 6 === 0 ? -0.08 : 0.03;
  }
  if (tears !== null) tears.scale.x = 1.25 + Math.sin(progress * Math.PI) * 0.8;
}

export function hideGlitchEffects(...groups: Array<Group | null>): void {
  groups.forEach((group) => {
    if (group !== null) group.visible = false;
  });
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
