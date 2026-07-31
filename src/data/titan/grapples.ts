import { titanMove } from './builder.js';
import { TITAN_MOVE_IDS as ID } from './ids.js';

const grab = (
  id: string,
  startup: number,
  recovery: number,
  damage: number,
  reach: number,
  kind: Parameters<typeof titanMove>[0]['grapple'],
  options: Partial<Parameters<typeof titanMove>[0]> = {},
) => titanMove({
  id, startup, active: 3, recovery, damage, reach, height: 1.16,
  level: 'grab', grapple: kind, onWhiffFollowUp: ID.throwMiss, ...options,
});

export const TITAN_GRAPPLE_MOVES = [
  grab(ID.normalThrow, 8, 24, 82, 0.66, ['normal', 24]),
  grab(ID.commandGrab, 11, 30, 116, 0.72, ['command', 32], {
    onHitFollowUp: ID.groundSlam,
  }),
  grab(ID.antiAirGrab, 9, 27, 96, 0.64, ['antiAir', 28], {
    height: 1.94, launch: true, targetSize: 'airborne',
  }),
  grab(ID.airThrow, 7, 23, 90, 0.66, ['air', 24], {
    height: 1.58, targetSize: 'airborne',
  }),
  grab(ID.wallThrow, 13, 31, 124, 0.74, ['wall', 34], {
    wallSplat: true,
  }),
  grab(ID.groundSlam, 5, 27, 104, 0.61, ['slam', 30], {
    height: 0.72, wallSplat: true,
  }),
  grab(ID.armouredGrab, 18, 35, 132, 0.76, ['armoured', 38], {
    armour: [4, 17, 2],
  }),
  grab(ID.carry, 15, 34, 112, 0.76, ['carry', 42], {
    lunge: 0.42,
  }),
  grab(ID.cornerReposition, 10, 28, 92, 0.69, ['reposition', 30], {
    lunge: 0.82,
  }),
  titanMove({
    id: ID.throwMiss, startup: 0, active: 1, recovery: 34,
    damage: 0, reach: 0, height: 0, level: 'grab',
  }),
  titanMove({
    id: ID.throwEscape, startup: 3, active: 2, recovery: 16,
    damage: 24, reach: 0.55, height: 1.24, level: 'grab',
    grapple: ['escape', 14], onWhiffFollowUp: ID.throwMiss,
  }),
] as const;

export const TITAN_GRAPPLE_TABLE = [
  ['Normal Throw', 8, 3, 24, 'normal'],
  ['Command Grab', 11, 3, 30, 'command'],
  ['Anti-Air Grab', 9, 3, 27, 'antiAir'],
  ['Air Throw', 7, 3, 23, 'air'],
  ['Wall Throw', 13, 3, 31, 'wall'],
  ['Ground Slam', 5, 3, 27, 'slam'],
  ['Armoured Grab', 18, 3, 35, 'armoured'],
  ['Carry', 15, 3, 34, 'carry'],
  ['Corner Reposition', 10, 3, 28, 'reposition'],
  ['Throw Escape', 3, 2, 16, 'escape'],
] as const;
