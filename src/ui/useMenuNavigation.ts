'use client';

import { useEffect, useRef } from 'react';

interface MenuNavigationOptions {
  readonly enabled?: boolean;
  readonly focus: number;
  readonly itemCount: number;
  readonly onBack?: () => void;
  readonly onConfirm: () => void;
  readonly setFocus: (index: number) => void;
}

interface PadEdges {
  up: boolean;
  down: boolean;
  confirm: boolean;
  back: boolean;
}

const RELEASED: PadEdges = {
  up: false,
  down: false,
  confirm: false,
  back: false,
};

export function useMenuNavigation({
  enabled = true,
  focus,
  itemCount,
  onBack,
  onConfirm,
  setFocus,
}: MenuNavigationOptions): void {
  const previousPad = useRef<PadEdges>(RELEASED);

  useEffect(() => {
    if (!enabled) return;
    const move = (delta: -1 | 1) => {
      setFocus((focus + delta + itemCount) % itemCount);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
        event.preventDefault();
        move(1);
      } else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        onConfirm();
      } else if (
        onBack !== undefined
        && (event.code === 'Escape' || event.code === 'Backspace')
      ) {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, focus, itemCount, onBack, onConfirm, setFocus]);

  useEffect(() => {
    if (!enabled) return;
    let animationFrame = 0;
    const poll = () => {
      const gamepad = navigator.getGamepads().find((candidate) => candidate !== null);
      const axis = gamepad?.axes[1] ?? 0;
      const current: PadEdges = {
        up: (gamepad?.buttons[12]?.pressed ?? false) || axis < -0.65,
        down: (gamepad?.buttons[13]?.pressed ?? false) || axis > 0.65,
        confirm: gamepad?.buttons[0]?.pressed ?? false,
        back: gamepad?.buttons[1]?.pressed ?? false,
      };
      const previous = previousPad.current;
      if (current.down && !previous.down) {
        setFocus((focus + 1) % itemCount);
      } else if (current.up && !previous.up) {
        setFocus((focus - 1 + itemCount) % itemCount);
      } else if (current.confirm && !previous.confirm) {
        onConfirm();
      } else if (current.back && !previous.back && onBack !== undefined) {
        onBack();
      }
      previousPad.current = current;
      animationFrame = window.requestAnimationFrame(poll);
    };
    animationFrame = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [enabled, focus, itemCount, onBack, onConfirm, setFocus]);
}
