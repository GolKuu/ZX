import { ECHO_MOVE_IDS } from '../../data/echo-combat-moves.js';
import { ECHO_SPECIAL_MOVE_IDS } from '../../data/echo-special-moves.js';
import { ECHO_SUPER_MOVE_IDS } from '../../data/echo-super-moves.js';
import { FIXED_SCALE, type FighterSnapshot } from '../../sim/index.js';
import type { Group } from 'three';
import type { EchoReadout } from './echoObservation.js';
import {
  hideEchoFx,
  showClones,
  showFragments,
  showPaths,
  showReticle,
} from './echoSpriteFxElements.js';

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
  hideEchoFx(groups);
  const moveId = fighter.action?.moveId ?? '';
  const probing = moveId === ECHO_MOVE_IDS.lp;
  const predicting = moveId === ECHO_MOVE_IDS.hp;
  const punishing = moveId === ECHO_MOVE_IDS.lk || moveId === ECHO_MOVE_IDS.hk;
  const perfect = moveId === ECHO_SUPER_MOVE_IDS.analysis;
  const overload = moveId === ECHO_SUPER_MOVE_IDS.repeat;
  const final = moveId === ECHO_SUPER_MOVE_IDS.statistics;
  const scanning = moveId === ECHO_SPECIAL_MOVE_IDS.patternScan;
  const mirroring = moveId === ECHO_SPECIAL_MOVE_IDS.behavioralMirror;
  const locking = moveId === ECHO_SPECIAL_MOVE_IDS.predictionLock;
  const distance = opponent === null
    ? 2.2
    : Math.min(
      3.5,
      Math.max(1.1, Math.abs(opponent.position.x - fighter.position.x) / FIXED_SCALE),
    );
  const signal = Math.max(
    readout.confidence,
    readout.habitStrength,
    readout.scanPulse * 0.8,
    probing || scanning || perfect || overload || final ? 1 : 0,
  );
  const forecast = Math.max(
    readout.lockPulse,
    predicting || locking || perfect || final ? 1 : 0,
  );
  const echoStrength = Math.max(
    readout.confidence,
    punishing || mirroring || perfect || overload || final ? 0.9 : 0,
  );

  showReticle(
    groups.reticle,
    forward * distance,
    signal,
    time,
    progress,
    final,
    readout.habit,
  );
  showPaths(
    groups.paths,
    forward,
    distance,
    forecast,
    progress,
    final,
    readout.habit,
  );
  showFragments(groups.data, forward, signal, time, readout.habit);
  showClones(
    groups.clones,
    forward,
    distance,
    echoStrength,
    progress,
    perfect,
    overload,
    final,
    readout.habit,
  );
}
