import { ECHO_MOVE_IDS } from '@/src/data/echo-combat-moves';
import { ECHO_SPECIAL_MOVE_IDS } from '@/src/data/echo-special-moves';
import { ECHO_SUPER_MOVE_IDS } from '@/src/data/echo-super-moves';
import { FIXED_SCALE, type FighterSnapshot } from '@/src/sim';
import type { Group, Object3D } from 'three';
import type { EchoReadout } from './echoObservation';

export interface EchoSpriteFxGroups {
  readonly clones: Group | null;
  readonly data: Group | null;
  readonly paths: Group | null;
  readonly reticle: Group | null;
}

export function layoutEchoSpriteFx(
  groups: EchoSpriteFxGroups,
  readout: EchoReadout,
  fighter: FighterSnapshot,
  opponent: FighterSnapshot | null,
  progress: number,
  time: number,
  forward: -1 | 1,
): void {
  hide(groups);
  const moveId = fighter.action?.moveId ?? '';
  const probing = moveId === ECHO_MOVE_IDS.lp;
  const predicting = moveId === ECHO_MOVE_IDS.hp;
  const punishing = moveId === ECHO_MOVE_IDS.lk || moveId === ECHO_MOVE_IDS.hk;
  const perfect = moveId === ECHO_SUPER_MOVE_IDS.analysis;
  const overload = moveId === ECHO_SUPER_MOVE_IDS.repeat;
  const final = moveId === ECHO_SUPER_MOVE_IDS.statistics;
  const patternScan = moveId === ECHO_SPECIAL_MOVE_IDS.patternScan;
  const behavioralMirror = moveId === ECHO_SPECIAL_MOVE_IDS.behavioralMirror;
  const predictionLock = moveId === ECHO_SPECIAL_MOVE_IDS.predictionLock;
  const distance = opponent === null
    ? 2.2
    : Math.min(
      3.5,
      Math.max(1.1, Math.abs(opponent.position.x - fighter.position.x) / FIXED_SCALE),
    );
  const signal = Math.max(
    readout.confidence,
    readout.scanPulse * 0.8,
    probing || patternScan || perfect || overload || final ? 1 : 0,
  );

  reticle(groups.reticle, forward * distance, signal, time, progress, final);
  paths(
    groups.paths,
    forward,
    distance,
    Math.max(
      readout.lockPulse,
      predicting || predictionLock || perfect || final ? 1 : 0,
    ),
    progress,
    final,
  );
  fragments(groups.data, forward, signal, time);
  clones(
    groups.clones,
    forward,
    distance,
    Math.max(
      readout.confidence,
      punishing || behavioralMirror || overload || final ? 0.9 : 0,
    ),
    progress,
    overload,
    final,
  );
}

function reticle(
  group: Group | null,
  x: number,
  amount: number,
  time: number,
  progress: number,
  final: boolean,
): void {
  if (group === null || amount < 0.02) return;
  group.visible = true;
  group.position.set(x, 1.24, 0.16);
  group.rotation.z = time * (final ? 0.92 : 0.38);
  const collapse = final ? 1 - progress * 0.42 : 1;
  group.scale.setScalar((0.62 + amount * 0.48) * collapse);
  group.children.forEach((ring, index) => {
    ring.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.016;
  });
}

function paths(
  group: Group | null,
  forward: -1 | 1,
  distance: number,
  amount: number,
  progress: number,
  final: boolean,
): void {
  if (group === null || amount < 0.03) return;
  group.visible = true;
  group.children.forEach((line, index) => {
    const isOutcome = index === 3;
    line.visible = !final || progress < 0.58 || isOutcome;
    const branch = (index - 3) * (final ? 0.18 * (1 - progress) : 0.12);
    line.position.set(
      forward * distance * (0.34 + index * 0.075),
      0.72 + index * 0.16,
      0.12 + Math.abs(index - 3) * 0.012,
    );
    line.rotation.z = forward * (-0.38 + index * 0.125 + branch);
    line.scale.x = amount * (isOutcome ? 1.2 : 0.78);
  });
}

function fragments(
  group: Group | null,
  forward: -1 | 1,
  amount: number,
  time: number,
): void {
  if (group === null || amount < 0.03) return;
  group.visible = true;
  group.children.forEach((fragment, index) => {
    const phase = time * (0.5 + (index % 3) * 0.08) + index * 1.7;
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

function clones(
  group: Group | null,
  forward: -1 | 1,
  distance: number,
  amount: number,
  progress: number,
  overload: boolean,
  final: boolean,
): void {
  if (group === null || amount < 0.48) return;
  group.visible = true;
  group.children.forEach((clone, index) => {
    const outcome = index === 2;
    clone.visible = !final || progress < 0.62 || outcome;
    const spread = overload ? (index - 2) * 0.42 : (index - 2) * 0.22;
    clone.position.set(
      forward * distance * (0.28 + index * 0.105),
      Math.abs(index - 2) * 0.05,
      -0.08 + Math.abs(index - 2) * 0.015,
    );
    clone.rotation.z = spread * (1 - progress * 0.45);
    clone.scale.setScalar((0.52 + amount * 0.2) * (outcome ? 1.08 : 0.9));
  });
}

function hide(groups: EchoSpriteFxGroups): void {
  (Object.values(groups) as Array<Object3D | null>).forEach((group) => {
    if (group !== null) group.visible = false;
  });
}
