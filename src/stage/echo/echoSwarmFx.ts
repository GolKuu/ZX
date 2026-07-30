/**
 * «Анализ» on stage: the copies ECHO projects around the target.
 *
 * Positions are in ECHO's local space, so `facing` alone puts the ring around
 * the opponent. Copies fade in one by one and converge on the hit frame — the
 * volley reads as the pattern closing in, not as a puff of particles.
 */
import type { Group } from 'three';
import { PROP_VISIBLE } from './echoMotion';
import type { EchoSuperBeat } from './echoSuperTimeline';

const FORWARD = 2.5;
const RADIUS = 1.3;

export function layoutHologramSwarm(
  group: Group,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  group.visible = beat.cast > PROP_VISIBLE;
  if (!group.visible) return;
  group.position.set(facing * FORWARD, 0, 0);
  const total = group.children.length;
  const shown = Math.ceil(beat.cast * total);
  const radius = RADIUS * (1 - beat.strike * 0.68);
  for (let index = 0; index < total; index += 1) {
    const copy = group.children[index];
    if (copy === undefined) continue;
    const angle = (index / total) * Math.PI * 2 + beat.cast * 0.5;
    const lean = (index % 2 === 0 ? 1 : -1) * beat.strike * 0.34;
    copy.visible = index < shown;
    copy.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 2) * 0.34 + beat.strike * 0.12,
      Math.sin(angle) * radius * 0.55,
    );
    copy.rotation.set(0, -facing * angle, lean);
    copy.scale.setScalar(0.5 + beat.cast * 0.42 + beat.strike * 0.26);
  }
}
