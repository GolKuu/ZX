import type { MoveFrameData } from '../sim/frame-data.js';
import { fixed } from '../sim/math.js';
import { buildMove, wall } from './mim/builder.js';
import {
  SEQUENCE_TECHNIQUES,
  type SequenceTechnique,
} from './sequenceTechniques.js';

export function buildSequenceTechniqueMoves(
  baseMoves: readonly MoveFrameData[],
): readonly MoveFrameData[] {
  return SEQUENCE_TECHNIQUES.map((technique) => {
    if (technique.patch === 'mimWallSmash') return mimWallSmash(technique.moveId);
    const source = baseMoves.find((move) => move.id === technique.baseMoveId);
    if (source === undefined) {
      throw new Error(`Sequence technique "${technique.moveId}" has no base move`);
    }
    return patchMove(source, technique);
  });
}

export function addSequenceCancelWindows(
  moves: readonly MoveFrameData[],
): readonly MoveFrameData[] {
  return moves.map((move) => {
    const targets = SEQUENCE_TECHNIQUES
      .filter((technique) => technique.starterMoveId === move.id)
      .map((technique) => technique.moveId);
    if (targets.length === 0) return move;
    const total = move.startup + move.active + move.recovery;
    const from = move.startup;
    const toExclusive = Math.min(total, move.startup + move.active + 8);
    return {
      ...move,
      cancels: [
        ...(move.cancels ?? []),
        { frames: { from, toExclusive }, into: targets },
      ],
    };
  });
}

function patchMove(
  source: MoveFrameData,
  technique: SequenceTechnique,
): MoveFrameData {
  const hitboxes = source.hitboxes.map((hitbox) => ({
    ...hitbox,
    hitId: `${technique.moveId}:${hitbox.hitId}`,
    boxes: technique.patch === 'projectile'
      ? hitbox.boxes.map((box) => ({
          ...box,
          offset: { ...box.offset, x: Math.max(box.offset.x, fixed(1.55)) },
          halfSize: { ...box.halfSize, x: Math.max(box.halfSize.x, fixed(0.72)) },
        }))
      : hitbox.boxes,
    hit: technique.patch === 'heavyKnockback'
      ? {
          ...hitbox.hit,
          knockback: {
            ...hitbox.hit.knockback,
            x: Math.round(hitbox.hit.knockback.x * 1.55),
          },
          wallBounce: hitbox.hit.wallBounce ?? {
            count: 1,
            horizontalSpeed: fixed(0.26),
            verticalSpeed: fixed(0.12),
            minimumHitstun: 26,
          },
        }
      : hitbox.hit,
  }));
  if (technique.patch === 'instantWall') {
    return {
      ...source,
      id: technique.moveId,
      startup: 5,
      active: 4,
      recovery: 14,
      cancels: undefined,
      walls: source.walls?.map((entry) => ({
        ...entry,
        spawnFrame: 5,
        materializeFrames: 2,
      })),
    };
  }
  return {
    ...source,
    id: technique.moveId,
    hitboxes,
    ...(technique.patch === 'projectile' ? { cooldownFrames: 30 } : {}),
  };
}

function mimWallSmash(moveId: string): MoveFrameData {
  return buildMove({
    id: moveId,
    attackLevel: 'mid',
    startup: 14,
    active: 5,
    recovery: 24,
    walls: [wall({
      kind: 'rear',
      at: [3.35, 1.05],
      size: [0.09, 1.05],
      spawnFrame: 9,
      materializeFrames: 3,
      lifetimeFrames: 96,
      integrity: 1,
      impactDamage: 36,
      impactHitstun: 14,
    })],
    hits: [{
      hitId: 'wall-smash-strike',
      from: 14,
      to: 19,
      box: [1.0, 1.16, 0.55, 0.48],
      damage: 72,
      hitstop: [11, 15],
      hitstun: 30,
      blockstun: 17,
      knockback: [0.34, 0.08],
      wallBounce: {
        count: 1,
        horizontalSpeed: fixed(0.22),
        verticalSpeed: fixed(0.1),
        minimumHitstun: 26,
      },
    }],
  });
}
