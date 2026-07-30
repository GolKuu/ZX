/**
 * Stage timeline for ECHO's three supers, read straight from their frame data.
 *
 * The beats are plain numbers and this file never imports three.js, so the
 * timing can be tested like frame data. The rig code turns a beat into
 * transforms; nothing here knows about bones, meshes or the camera.
 *
 * Hit frames come from the authored hitboxes, so a copy on stage always swings
 * on the frame the simulation actually checks a hitbox.
 */

import {
  ECHO_SUPER_MOVES,
  echoSuperKindForMove,
  type EchoSuperKind,
} from '../../data/echo-super-moves.js';
import type { MoveFrameData } from '../../sim/frame-data.js';
import { totalMoveFrames } from '../../sim/index.js';

/** Copies ECHO projects around the target in «Анализ» — one per hitbox. */
export const ECHO_HOLOGRAM_COPIES = 12;
/** Fragments the mirror of «Повтор» breaks into once the clone is done. */
export const ECHO_MIRROR_SHARDS = 6;
/** Bars on the «Статистика» panel: прыжки, спам, ошибки. */
export const ECHO_CHART_BARS = 3;
/** Fragments the exploding error chart throws. */
export const ECHO_CHART_SHARDS = 10;

export interface EchoSuperBeat {
  readonly kind: EchoSuperKind;
  /** ECHO reads the pattern: lead hand up, visor on the target. */
  readonly read: number;
  /** Holograms, mirror or dashboard are on stage. */
  readonly cast: number;
  /** A hit is landing right now. */
  readonly strike: number;
  /** Index of the last copied hit that landed, -1 before the first. */
  readonly comboHit: number;
  /** The stage tears itself down: copies fold, glass and charts blow up. */
  readonly collapse: number;
}

interface SuperShape {
  readonly kind: EchoSuperKind;
  readonly hits: readonly number[];
  readonly castIn: number;
  readonly castHold: number;
  readonly castOut: number;
  readonly collapseSpan: number;
}

/** Frames a hit stays readable on stage after it lands. */
const HIT_DECAY = 8;
/** Frames of anticipation before a hit that the copies telegraph. */
const HIT_TELL = 3;

const SHAPES = buildShapes();

export function echoSuperBeat(
  moveId: string,
  frame: number,
): EchoSuperBeat | null {
  const shape = SHAPES.get(moveId);
  if (shape === undefined) return null;
  const first = shape.hits[0] ?? 0;
  const last = shape.hits[shape.hits.length - 1] ?? first;
  return {
    kind: shape.kind,
    read: ramp(frame, 0, first * 0.75) * (1 - ramp(frame, first, first + 10)),
    cast: ramp(frame, shape.castIn, first)
      * (1 - ramp(frame, shape.castHold, shape.castOut)),
    strike: strikeAt(shape.hits, frame),
    comboHit: comboHitAt(shape.hits, frame),
    collapse: ramp(frame, last, last + shape.collapseSpan),
  };
}

export function isEchoSuperMove(moveId: string): boolean {
  return SHAPES.has(moveId);
}

function buildShapes(): ReadonlyMap<string, SuperShape> {
  const shapes = new Map<string, SuperShape>();
  for (const move of ECHO_SUPER_MOVES) {
    const kind = echoSuperKindForMove(move.id);
    if (kind !== null) shapes.set(move.id, shapeFor(move, kind));
  }
  return shapes;
}

/**
 * Hits that share a frame are one beat: «Анализ» fires all twelve holograms on
 * the same frame, and the stage should read as one volley, not twelve.
 */
function shapeFor(move: MoveFrameData, kind: EchoSuperKind): SuperShape {
  const hits = [...new Set(move.hitboxes.map((box) => box.frames.from))]
    .sort((left, right) => left - right);
  const first = hits[0] ?? move.startup;
  const last = hits[hits.length - 1] ?? first;
  const tail = Math.max(1, totalMoveFrames(move) - last);
  return {
    kind,
    hits,
    castIn: Math.round(first * 0.35),
    castHold: last + Math.round(tail * 0.25),
    castOut: last + Math.round(tail * 0.7),
    collapseSpan: Math.max(1, Math.round(tail * 0.5)),
  };
}

function strikeAt(hits: readonly number[], frame: number): number {
  let strongest = 0;
  for (const hit of hits) {
    const offset = frame - hit;
    if (offset < -HIT_TELL || offset > HIT_DECAY) continue;
    const weight = offset < 0
      ? ((offset + HIT_TELL) / HIT_TELL) * 0.3
      : 1 - offset / HIT_DECAY;
    strongest = Math.max(strongest, weight);
  }
  return strongest;
}

function comboHitAt(hits: readonly number[], frame: number): number {
  let landed = -1;
  for (let index = 0; index < hits.length; index += 1) {
    if ((hits[index] ?? Infinity) <= frame) landed = index;
  }
  return landed;
}

function ramp(value: number, start: number, end: number): number {
  const span = Math.max(1, end - start);
  const clamped = Math.max(0, Math.min(1, (value - start) / span));
  return clamped * clamped * (3 - 2 * clamped);
}
