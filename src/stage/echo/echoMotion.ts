/** Easing windows shared by ECHO's normals and supers. */
import { smooth } from '../fighterRig';

/** Rises over the enter window, holds, then falls over the exit window. */
export function heldMotion(
  progress: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
): number {
  return smoothRange(progress, enterStart, enterEnd)
    * (1 - smoothRange(progress, exitStart, exitEnd));
}

/** A single hump that peaks at `peak` — the wind-up of a normal. */
export function motionWindow(
  progress: number,
  enterStart: number,
  peak: number,
  exitEnd: number,
): number {
  return heldMotion(progress, enterStart, peak, peak, exitEnd);
}

export function smoothRange(
  value: number,
  start: number,
  end: number,
): number {
  return smooth(Math.max(0, Math.min(1, (value - start) / (end - start))));
}
