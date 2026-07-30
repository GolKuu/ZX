import type {
  AuthoredHitbox,
  HitData,
  MoveFrameData,
} from '../sim/frame-data.js';
import { fixed, type FixedBox } from '../sim/math.js';
import { IDOL_MOVE_IDS } from './idol-move-ids.js';

const closeRange = attackBox(1.16, 0.98, 0.82, 0.82);
const arenaWide = attackBox(4.8, 1.02, 4.9, 1.08);

export const IDOL_SUPER_MOVES: readonly MoveFrameData[] = [
  {
    id: IDOL_MOVE_IDS.highlight,
    startup: 12,
    active: 27,
    recovery: 24,
    hitboxes: [
      pulse('camera-flash', 12, closeRange, hit(26, 12)),
      pulse('dance-kick', 20, closeRange, hit(28, 14)),
      pulse('microphone-beat', 28, closeRange, hit(30, 16)),
      pulse('highlight-finale', 36, closeRange, hit(46, 24, 0.28, 0.2)),
    ],
  },
  {
    id: IDOL_MOVE_IDS.million,
    startup: 22,
    active: 69,
    recovery: 48,
    hitboxes: [
      ...[22, 32, 42, 52, 62, 72].map((frame, index) =>
        pulse(`crowd-clap-${index + 1}`, frame, arenaWide, hit(36, 20)),
      ),
      pulse('million-finale', 86, arenaWide, hit(84, 42, 0.38, 0.3)),
    ],
  },
  {
    id: IDOL_MOVE_IDS.cancel,
    startup: 18,
    active: 51,
    recovery: 92,
    hitboxes: [
      ...[18, 25, 32, 39, 46, 53].map((frame, index) =>
        pulse(`comment-${index + 1}`, frame, arenaWide, hit(45, 24)),
      ),
      pulse('ratio-wave', 64, arenaWide, hit(130, 62, 0.48, 0.34)),
    ],
  },
];

function pulse(
  hitId: string,
  frame: number,
  box: FixedBox,
  impact: HitData,
): AuthoredHitbox {
  return {
    hitId,
    frames: { from: frame, toExclusive: frame + 2 },
    boxes: [box],
    hit: impact,
  };
}

function hit(
  damage: number,
  hitstun: number,
  knockbackX = 0,
  knockbackY = 0,
): HitData {
  const finishingHit = knockbackX > 0;
  return {
    damage,
    hitstop: { attacker: finishingHit ? 11 : 5, defender: finishingHit ? 16 : 8 },
    hitstun,
    knockback: { x: fixed(knockbackX), y: fixed(knockbackY) },
    ...(finishingHit
      ? {
          wallBounce: {
            count: 1,
            horizontalSpeed: fixed(Math.max(0.22, knockbackX)),
            verticalSpeed: fixed(Math.max(0.18, knockbackY)),
            minimumHitstun: Math.min(hitstun, 34),
          },
        }
      : {}),
  };
}

function attackBox(
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
): FixedBox {
  return {
    offset: { x: fixed(x), y: fixed(y) },
    halfSize: { x: fixed(halfWidth), y: fixed(halfHeight) },
  };
}
