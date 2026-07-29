'use client';

import { useEffect, type RefObject } from 'react';
import { getEffectAnimation } from './effects';
import { AANG_MOTIONS } from './motions';
import type { AangMove, OpponentReaction, RigPart } from '../types';

const PARTS: readonly RigPart[] = [
  'root',
  'body',
  'head',
  'frontArm',
  'backArm',
  'frontLeg',
  'backLeg',
  'staff',
];

const NEUTRAL = 'translate(0px, 0px) rotate(0deg)';

export function useAangAnimation(
  stageRef: RefObject<HTMLDivElement | null>,
  move: AangMove,
  replayToken: number,
): void {
  useEffect(() => {
    const stage = stageRef.current;
    const motion = AANG_MOTIONS[move.id];
    if (stage === null || motion === undefined) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 1 : motion.durationMs;
    const animations: Animation[] = [];

    for (const part of PARTS) {
      const target = stage.querySelector<SVGGraphicsElement>(`[data-part="${part}"]`);
      if (target === null) continue;
      let current = NEUTRAL;
      const keyframes = motion.poses.map((pose) => {
        current = pose.transforms[part] ?? current;
        return { offset: pose.at, transform: current };
      });
      animations.push(target.animate(keyframes, animationOptions(duration)));
    }

    const effect = getEffectAnimation(motion.effect);
    const effectTarget = stage.querySelector<SVGGraphicsElement>(effect.selector);
    if (effectTarget !== null) {
      animations.push(
        effectTarget.animate([...effect.keyframes], animationOptions(duration)),
      );
    }

    const opponent = stage.querySelector<SVGGraphicsElement>('[data-opponent]');
    if (opponent !== null) {
      animations.push(
        opponent.animate(
          opponentKeyframes(motion.reaction),
          animationOptions(duration),
        ),
      );
    }

    const glowTargets = stage.querySelectorAll<SVGElement>('[data-glow]');
    if (move.category === 'mechanic' || move.category === 'super') {
      glowTargets.forEach((target) => {
        animations.push(target.animate(glowKeyframes(), animationOptions(duration)));
      });
    }

    const progress = stage.querySelector<HTMLElement>('[data-progress]');
    if (progress !== null) {
      animations.push(
        progress.animate(
          [
            { transform: 'scaleX(0)' },
            { transform: 'scaleX(1)' },
          ],
          { duration, easing: 'linear' },
        ),
      );
    }

    return () => animations.forEach((animation) => animation.cancel());
  }, [move, replayToken, stageRef]);
}

function animationOptions(duration: number): KeyframeAnimationOptions {
  return {
    duration,
    easing: 'cubic-bezier(.22,.75,.22,1)',
    fill: 'none',
  };
}

function opponentKeyframes(reaction: OpponentReaction): Keyframe[] {
  const shared = [{ offset: 0, transform: NEUTRAL }, { offset: 0.42, transform: NEUTRAL }];
  const finish = { offset: 1, transform: NEUTRAL };
  switch (reaction) {
    case 'flinch':
      return [...shared, { offset: 0.52, transform: 'translate(15px, 0px) rotate(8deg)' }, finish];
    case 'push':
      return [...shared, { offset: 0.62, transform: 'translate(52px, 0px) rotate(5deg)' }, finish];
    case 'wall':
      return [...shared, { offset: 0.7, transform: 'translate(105px, 0px) rotate(10deg)' }, finish];
    case 'launch':
      return [...shared, { offset: 0.62, transform: 'translate(35px, -68px) rotate(18deg)' }, finish];
    case 'knockdown':
      return [...shared, { offset: 0.66, transform: 'translate(45px, 35px) rotate(72deg)' }, finish];
    case 'none':
      return [shared[0] ?? finish, finish];
  }
}

function glowKeyframes(): Keyframe[] {
  return [
    { offset: 0, opacity: 0.45, filter: 'drop-shadow(0 0 0 var(--element))' },
    { offset: 0.35, opacity: 1, filter: 'drop-shadow(0 0 9px var(--element))' },
    { offset: 0.78, opacity: 1, filter: 'drop-shadow(0 0 15px white)' },
    { offset: 1, opacity: 0.65, filter: 'drop-shadow(0 0 2px var(--element))' },
  ];
}
