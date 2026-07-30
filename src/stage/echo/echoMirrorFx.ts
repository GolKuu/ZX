/**
 * «Повтор» on stage: the mirror ECHO opens and the copy that steps out of it.
 *
 * The clone advances one step per copied hit and lunges on each of them, so the
 * long combo reads as seven separate blows rather than one slide. When the last
 * hit lands the glass breaks into its shards and the copy goes with it.
 */
import type { Group, Object3D } from 'three';
import { PROP_VISIBLE } from './echoMotion';
import {
  ECHO_MIRROR_SHARDS,
  type EchoSuperBeat,
} from './echoSuperTimeline';

export function layoutMirror(
  group: Group,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  group.visible = beat.cast > PROP_VISIBLE;
  if (!group.visible) return;
  group.position.set(facing * 1.15, 0, -0.25);
  const mirror = group.children[0];
  const clone = group.children[1];
  if (mirror !== undefined) layoutGlass(mirror, beat, facing);
  if (clone !== undefined) layoutClone(clone, beat, facing);
}

function layoutGlass(
  mirror: Object3D,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  const opened = beat.cast * (1 - beat.collapse);
  mirror.scale.set(Math.max(0.02, opened), 0.6 + opened * 0.4, 1);
  mirror.rotation.set(0, -facing * 0.42, 0);
  for (let index = 1; index <= ECHO_MIRROR_SHARDS; index += 1) {
    const shard = mirror.children[index];
    if (shard === undefined) continue;
    const angle = (index / ECHO_MIRROR_SHARDS) * Math.PI * 2;
    const flight = beat.collapse * (0.9 + (index % 3) * 0.35);
    shard.visible = beat.collapse > PROP_VISIBLE;
    shard.position.set(
      Math.cos(angle) * flight,
      1.24 + Math.sin(angle) * flight,
      facing * flight * 0.3,
    );
    shard.rotation.set(flight * 2.4, angle, flight * 3.1);
    shard.scale.setScalar(Math.max(0.001, 1 - beat.collapse * 0.7));
  }
}

function layoutClone(
  clone: Object3D,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  const step = Math.max(0, beat.comboHit) * 0.24;
  const gone = beat.collapse;
  clone.visible = gone < 0.85;
  clone.position.set(
    facing * (0.3 + step + beat.strike * 0.5),
    0,
    0.18 - gone * 0.4,
  );
  clone.rotation.set(0, facing * (0.2 - beat.strike * 0.5), 0);
  clone.scale.setScalar(Math.max(0.001, beat.cast * (1 - gone)));
}
