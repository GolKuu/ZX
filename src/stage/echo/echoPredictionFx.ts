import { ECHO_MOVE_IDS } from '@/src/data/echo-combat-moves';
import type { FighterSnapshot } from '@/src/sim';
import type { Group, Object3D } from 'three';
import type { EchoReadout } from './echoObservation';

const VISIBLE = 0.025;

export function layoutEchoPredictionFx(
  group: Group,
  readout: EchoReadout,
  fighter: FighterSnapshot,
  opponent: FighterSnapshot | null,
  time: number,
): void {
  const reticle = group.children[0];
  const trajectories = group.children[1];
  const fragments = group.children[2];
  const clone = group.children[3];
  const facing = fighter.facing;
  const localDistance = opponent === null
    ? 2.2
    : Math.min(3.2, Math.abs(opponent.position.x - fighter.position.x) / 1000);
  const moveId = fighter.action?.moveId ?? '';
  const probing = moveId === ECHO_MOVE_IDS.lp;
  const predicting = moveId === ECHO_MOVE_IDS.hp;
  const punishing = moveId === ECHO_MOVE_IDS.lk || moveId === ECHO_MOVE_IDS.hk;
  const signal = Math.max(
    readout.confidence,
    readout.scanPulse * 0.75,
    probing ? 0.8 : 0,
  );

  group.visible = signal > VISIBLE || predicting || punishing;
  if (!group.visible) return;

  group.position.set(0, 0, 0.08);
  if (reticle !== undefined) {
    layoutReticle(
      reticle,
      facing * localDistance,
      signal,
      readout.lockPulse,
      time,
    );
  }
  if (trajectories !== undefined) {
    layoutTrajectories(
      trajectories,
      facing,
      localDistance,
      Math.max(readout.lockPulse, predicting ? 1 : 0),
      time,
    );
  }
  if (fragments !== undefined) {
    layoutFragments(fragments, facing, signal, time);
  }
  if (clone !== undefined) {
    layoutAdaptiveClone(
      clone,
      facing,
      localDistance,
      Math.max(readout.confidence, punishing ? 0.72 : 0),
      time,
    );
  }
}

function layoutReticle(
  reticle: Object3D,
  x: number,
  signal: number,
  lock: number,
  time: number,
): void {
  reticle.visible = signal > VISIBLE;
  reticle.position.set(x, 1.15, -0.18);
  reticle.rotation.set(0, 0, time * (0.22 + lock * 0.5));
  reticle.scale.setScalar(0.42 + signal * 0.62);
  reticle.children.forEach((child, index) => {
    child.rotation.z = time * (index % 2 === 0 ? 0.7 : -0.54);
    child.scale.setScalar(0.72 + index * 0.2 + lock * 0.12);
  });
}

function layoutTrajectories(
  trajectories: Object3D,
  facing: -1 | 1,
  distance: number,
  amount: number,
  time: number,
): void {
  trajectories.visible = amount > VISIBLE;
  trajectories.children.forEach((line, index) => {
    const spread = (index - 2) * 0.22;
    const forecast = 0.55 + index * 0.13;
    line.position.set(
      facing * distance * forecast,
      0.72 + index * 0.19 + Math.sin(time * 2 + index) * 0.035,
      spread,
    );
    line.rotation.set(0, 0, facing * (-0.34 + index * 0.16));
    line.scale.y = Math.max(0.01, amount * (0.5 + index * 0.12));
  });
}

function layoutFragments(
  fragments: Object3D,
  facing: -1 | 1,
  amount: number,
  time: number,
): void {
  fragments.visible = amount > VISIBLE;
  fragments.children.forEach((fragment, index) => {
    const phase = time * (0.34 + (index % 3) * 0.08) + index * 1.7;
    const radius = 0.62 + (index % 4) * 0.16;
    fragment.position.set(
      facing * (0.22 + Math.cos(phase) * radius),
      1.2 + Math.sin(phase * 1.3) * 0.72,
      -0.15 + Math.sin(phase) * 0.24,
    );
    fragment.rotation.set(0, phase, phase * 0.4);
    fragment.scale.x = Math.max(0.01, amount);
  });
}

function layoutAdaptiveClone(
  clone: Object3D,
  facing: -1 | 1,
  distance: number,
  amount: number,
  time: number,
): void {
  clone.visible = amount > 0.5;
  if (!clone.visible) return;
  const pulse = 0.92 + Math.sin(time * 5.4) * 0.035;
  clone.position.set(facing * distance * 0.62, 0, -0.32);
  clone.rotation.set(0, -facing * 0.28, facing * Math.sin(time * 1.7) * 0.025);
  clone.scale.setScalar(pulse * (0.5 + amount * 0.35));
}
