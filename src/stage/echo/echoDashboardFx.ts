/**
 * «Статистика» on stage: the analytics panel the finisher turns the match into.
 *
 * The bars carry the read-out the cinematic prints — прыжков 37, спама 82%,
 * ошибок 94% — and the error bar is the one that blows apart on the verdict.
 */
import type { Group, Object3D } from 'three';
import { PROP_VISIBLE } from './echoMotion';
import {
  ECHO_CHART_SHARDS,
  type EchoSuperBeat,
} from './echoSuperTimeline';

const CHART_VALUES = [0.37, 0.82, 0.94] as const;

export function layoutDashboard(
  group: Group,
  beat: EchoSuperBeat,
  facing: -1 | 1,
): void {
  group.visible = beat.cast > PROP_VISIBLE;
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
  if (shards !== undefined) burstChart(shards, beat.collapse);
}

function layoutBars(bars: Object3D, beat: EchoSuperBeat): void {
  const total = bars.children.length;
  for (let index = 0; index < total; index += 1) {
    const bar = bars.children[index];
    if (bar === undefined) continue;
    const value = CHART_VALUES[index] ?? 0.5;
    const errors = index === total - 1;
    const blown = errors ? beat.collapse : beat.collapse * 0.3;
    bar.scale.set(
      1 + (errors ? beat.collapse * 0.6 : 0),
      Math.max(0.001, value * beat.cast * (1 - blown)),
      1,
    );
  }
}

function burstChart(group: Object3D, amount: number): void {
  group.visible = amount > PROP_VISIBLE;
  if (!group.visible) return;
  for (let index = 0; index < ECHO_CHART_SHARDS; index += 1) {
    const shard = group.children[index];
    if (shard === undefined) continue;
    const angle = (index / ECHO_CHART_SHARDS) * Math.PI * 2;
    const flight = amount * 1.2 * (0.7 + (index % 4) * 0.22);
    shard.position.set(
      0.62 + Math.cos(angle) * flight,
      0.5 + Math.sin(angle) * flight,
      Math.sin(angle * 3) * 0.2,
    );
    shard.rotation.set(flight * 3.2, angle, flight * 2.1);
    shard.scale.setScalar(Math.max(0.001, 1 - amount * 0.65));
  }
}
