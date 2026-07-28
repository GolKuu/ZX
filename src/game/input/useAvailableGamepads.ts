import { useEffect, useState } from 'react';

export type AvailableGamepad = {
  index: number;
  id: string;
  label: string;
};

function readGamepads(): AvailableGamepad[] {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
  return [...navigator.getGamepads()]
    .filter((gamepad): gamepad is Gamepad => Boolean(gamepad?.connected))
    .map((gamepad) => ({
      index: gamepad.index,
      id: `${gamepad.id}-${gamepad.index}`,
      label: gamepad.id || `Геймпад ${gamepad.index + 1}`,
    }));
}

export function useAvailableGamepads() {
  const [gamepads, setGamepads] = useState<AvailableGamepad[]>(readGamepads);

  useEffect(() => {
    const refresh = () => setGamepads(readGamepads());
    window.addEventListener('gamepadconnected', refresh);
    window.addEventListener('gamepaddisconnected', refresh);
    const interval = window.setInterval(refresh, 1_000);
    return () => {
      window.removeEventListener('gamepadconnected', refresh);
      window.removeEventListener('gamepaddisconnected', refresh);
      window.clearInterval(interval);
    };
  }, []);

  return gamepads;
}
