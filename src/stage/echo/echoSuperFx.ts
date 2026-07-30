/**
 * Turns a super beat into transforms on the prop groups built by
 * `EchoSuperEffects`. Positions are in ECHO's local space, so `facing` points
 * everything at the opponent without the caller mirroring anything.
 */
import type { Group, Object3D } from 'three';
import {
  ECHO_CHART_SHARDS,
  ECHO_MIRROR_SHARDS,
  type EchoSuperBeat,
} from './echoSuperTimeline';

/** Прыжков 37, Спама 82%, Ошибок 94% — the bars the finisher reads out. */
const CHART_VALUES = [0.37, 0.82, 0.94] as const;
const SWARM_FORWARD = 2.5;
const SWARM_RADIUS = 1.3;
const VISIBLE = 0.002;

/** «Анализ»: copies ring the target, then all of them swing at once. */
export function layoutHologramSwarm(
  group: Group,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  group.visible = beat.cast > VISIBLE;
  if (!group.visible) return;
  group.position.set(facing * SWARM_FORWARD, 0, 0);
  const total = group.children.length;
  const shown = Math.ceil(beat.cast * total);
  const radius = SWARM_RADIUS * (1 - beat.strike * 0.68);
  for (let index = 0; index < total; index += 1) {
    const copy = group.children[index];
    if (copy === undefined) continue;
    copy.visible = index < shown;
    const angle = (index / total) * Math.PI * 2 + beat.cast * 0.5;
    copy.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 2) * 0.34 + beat.strike * 0.12,
      Math.sin(angle) * radius * 0.55,
    );
    copy.rotation.set(0, -facing * angle, (index % 2 === 0 ? 1 : -1) * beat.strike * 0.34);
    copy.scale.setScalar(0.5 + beat.cast * 0.42 + beat.strike * 0.26);
  }
}

/** «Повтор»: the mirror opens, the clone walks its combo out of it. */
export function layoutMirror(
  group: Group,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  group.visible = beat.cast > VISIBLE;
  if (!group.visible) return;
  group.position.set(facing * 1.15, 0, -0.25);
  const mirror = group.children[0];
  const clone = group.children[1];
  if (mirror !== undefined) layoutGlass(mirror, beat, facing);
  if (clone !== undefined) layoutClone(clone, beat, facing);
}

/** «Статистика»: the panel rises, the error chart blows up on the verdict. */
export function layoutDashboard(
  group: Group,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  group.visible = beat.cast > VISIBLE;
  if (!group.visible) return;
  group.position.set(facing * 1.85, 1.5, 0.1);
  group.rotation.set(0, -facing * 0.26, 0);
  const panel = group.children[0];
  const bars = group.children[1];
  const shards = group.children[2];
  if (panel !== undefined) {
    panel.scale.set(0.4 + beat.cast * 0.6, beat.cast, 1);
  }
  if (bars !== undefined) layoutBars(bars, beat);
  if (shards !== undefined) burst(shards, beat.collapse, ECHO_CHART_SHARDS, 1.2);
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
    shard.visible = beat.collapse > VISIBLE;
    shard.position.set(
      Math.cos(angle) * flight,
      1.24 + Math.sin(angle) * flight,
      facing * flight * 0.3,
    );
    shard.rotation.set(flight * 2.4, angle, flight * 3.1);
    shard.scale.setScalar(Math.max(0.001, 1 - beat.collapse * 0.7));
  }
}

/**
 * The clone advances one step per copied hit and lunges on each of them, so the
 * long combo reads as seven separate blows rather than one slide.
 */
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

function layoutBars(bars: Object3D, beat: EchoSuperBeat): void {
  for (let index = 0; index < bars.children.length; index += 1) {
    const bar = bars.children[index];
    if (bar === undefined) continue;
    const value = CHART_VALUES[index] ?? 0.5;
    const last = index === bars.children.length - 1;
    const blown = last ? beat.collapse : beat.collapse * 0.3;
    bar.scale.set(
      1 + (last ? beat.collapse * 0.6 : 0),
      Math.max(0.001, value * beat.cast * (1 - blown)),
      1,
    );
  }
}

function burst(
  group: Object3D,
  amount: number,
  total: number,
  reach: number,
): void {
  group.visible = amount > VISIBLE;
  if (!group.visible) return;
  for (let index = 0; index < total; index += 1) {
    const shard = group.children[index];
    if (shard === undefined) continue;
    const angle = (index / total) * Math.PI * 2;
    const flight = amount * reach * (0.7 + (index % 4) * 0.22);
    shard.position.set(
      0.62 + Math.cos(angle) * flight,
      0.5 + Math.sin(angle) * flight,
      Math.sin(angle * 3) * 0.2,
    );
    shard.rotation.set(flight * 3.2, angle, flight * 2.1);
    shard.scale.setScalar(Math.max(0.001, 1 - amount * 0.65));
  }
}
