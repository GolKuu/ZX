/**
 * ECHO's three supers on the geometry rig.
 *
 * Every pose is driven by the beat from `echoSuperTimeline`, which is derived
 * from the move's own frame data — the animation cannot drift away from the
 * frame the hitbox lands on.
 */
import type { FighterRig } from '../fighterRig';
import { layoutDashboard, layoutHologramSwarm, layoutMirror } from './echoSuperFx';
import type { EchoSuperBeat } from './echoSuperTimeline';

export function applyEchoSuperAnimation(
  rig: FighterRig,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  if (beat.kind === 'analysis') analysis(rig, beat, facing);
  else if (beat.kind === 'repeat') repeat(rig, beat, facing);
  else statistics(rig, beat, facing);
}

/**
 * «Анализ» — ECHO reads the pattern, the copies ring the target and every one
 * of them swings on the same frame. «Предсказуемо.»
 */
function analysis(rig: FighterRig, beat: EchoSuperBeat, facing: -1 | 1): void {
  const lead = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  lead.position.x += facing * (beat.read * 0.18 + beat.strike * 0.42);
  lead.position.y += beat.read * 0.26 - beat.strike * 0.1;
  lead.rotation.z += facing * (beat.read * -1.24 - beat.strike * 0.46);
  support.rotation.z -= facing * (beat.read * 0.4 + beat.strike * 0.22);
  rig.head.rotation.z += facing * beat.read * 0.16;
  rig.torso.rotation.y += facing * (beat.read * -0.24 + beat.strike * 0.52);
  rig.root.position.x += facing * (beat.strike * 0.2 - beat.read * 0.08);
  ringFlare(rig, beat.cast * 0.3 + beat.strike, facing * 0.9);
  layoutHologramSwarm(rig.aura, beat, facing);
}

/**
 * «Повтор» — ECHO opens a mirror, stays out of the way while the copy of the
 * opponent runs their own combo, and closes the glass on the last hit.
 */
function repeat(rig: FighterRig, beat: EchoSuperBeat, facing: -1 | 1): void {
  const lead = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  const watching = beat.cast * (1 - beat.collapse);
  lead.position.x += facing * beat.read * 0.36;
  lead.rotation.z += facing * (beat.read * -1.42 + watching * 0.5);
  support.rotation.z -= facing * (beat.read * 0.62 - watching * 0.3);
  rig.torso.rotation.y += facing * (beat.read * -0.5 + watching * -0.24);
  rig.torso.rotation.z += facing * beat.strike * 0.12;
  rig.head.rotation.y += facing * watching * 0.3;
  rig.root.position.x -= facing * (beat.read * 0.24 + watching * 0.12);
  ringFlare(rig, watching * 0.5 + beat.strike * 0.6, facing * -0.7);
  layoutMirror(rig.projectile, beat, facing);
}

/**
 * «Статистика» — the match turns into a read-out. ECHO holds still, presents
 * the panel and points once: «Я победил тебя твоими привычками.»
 */
function statistics(
  rig: FighterRig,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  const lead = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  const present = beat.cast * (1 - beat.strike * 0.5);
  lead.position.x += facing * (present * 0.2 + beat.strike * 0.46);
  lead.position.y += present * 0.3;
  lead.rotation.z += facing * (present * -1.1 - beat.strike * 0.72);
  support.position.y += present * 0.2;
  support.rotation.z -= facing * present * 0.9;
  rig.head.rotation.z += facing * beat.read * 0.1;
  rig.torso.rotation.y += facing * (present * -0.18 + beat.strike * 0.34);
  rig.root.position.y += beat.strike * 0.06 - beat.collapse * 0.02;
  ringFlare(rig, present * 0.4 + beat.collapse * 0.8, facing * 1.4);
  layoutDashboard(rig.slash, beat, facing);
}

/** The halo rings answer every beat, so the supers read as one character. */
function ringFlare(rig: FighterRig, amount: number, roll: number): void {
  rig.echoes.scale.setScalar(1 + amount * 0.34);
  rig.echoes.rotation.z += roll * amount * 0.3;
  rig.echoes.rotation.y += roll * amount * 0.5;
}
