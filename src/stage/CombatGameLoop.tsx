'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CombatSession } from '@/src/game/CombatSession';
import {
  readCombatResetVersion,
} from '@/src/game/combatRuntime';
import {
  KADE_COMMANDS,
  KeyboardInputSource,
  PLAYER_TWO_BINDINGS,
} from '@/src/input';
import { useControlStore } from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';

export function CombatGameLoop() {
  const keyboard = useMemo(
    () => new KeyboardInputSource({
      bindings: useControlStore.getState().bindings,
      commands: KADE_COMMANDS,
    }),
    [],
  );
  const secondKeyboard = useMemo(
    () => new KeyboardInputSource({
      bindings: PLAYER_TWO_BINDINGS,
      commands: KADE_COMMANDS,
    }),
    [],
  );
  const session = useMemo(
    () => new CombatSession(keyboard, secondKeyboard),
    [keyboard, secondKeyboard],
  );
  const handledReset = useRef(readCombatResetVersion());
  const handledMode = useRef(useHudStore.getState().mode);

  useEffect(() => {
    useControlStore.getState().hydrate();
    keyboard.updateBindings(useControlStore.getState().bindings);
    keyboard.attach(window);
    secondKeyboard.attach(window);
    const unsubscribe = useControlStore.subscribe((state, previous) => {
      if (state.bindings !== previous.bindings) {
        keyboard.updateBindings(state.bindings);
      }
    });
    return () => {
      unsubscribe();
      keyboard.detach(window);
      secondKeyboard.detach(window);
    };
  }, [keyboard, secondKeyboard]);

  useFrame((_, delta) => {
    const resetVersion = readCombatResetVersion();
    if (resetVersion !== handledReset.current) {
      handledReset.current = resetVersion;
      useHudStore.getState().resetPreview();
      session.reset();
    }
    const hud = useHudStore.getState();
    if (hud.mode !== handledMode.current) {
      handledMode.current = hud.mode;
      if (hud.mode !== null && hud.mode !== 'online') session.reset();
    }
    if (hud.screen === 'fight') {
      session.advance(Math.min(delta, 0.1) * 1_000);
    }
  }, -100);

  return null;
}
