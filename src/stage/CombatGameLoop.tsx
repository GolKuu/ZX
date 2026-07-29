'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CombatSession } from '@/src/game/CombatSession';
import {
  readCombatResetVersion,
} from '@/src/game/combatRuntime';
import { KADE_COMMANDS, KeyboardInputSource } from '@/src/input';
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
  const session = useMemo(() => new CombatSession(keyboard), [keyboard]);
  const handledReset = useRef(readCombatResetVersion());

  useEffect(() => {
    useControlStore.getState().hydrate();
    keyboard.updateBindings(useControlStore.getState().bindings);
    keyboard.attach(window);
    const unsubscribe = useControlStore.subscribe((state, previous) => {
      if (state.bindings !== previous.bindings) {
        keyboard.updateBindings(state.bindings);
      }
    });
    return () => {
      unsubscribe();
      keyboard.detach(window);
    };
  }, [keyboard]);

  useFrame((_, delta) => {
    const resetVersion = readCombatResetVersion();
    if (resetVersion !== handledReset.current) {
      handledReset.current = resetVersion;
      useHudStore.getState().resetPreview();
      session.reset();
    }
    if (useHudStore.getState().screen === 'fight') {
      session.advance(Math.min(delta, 0.1) * 1_000);
    }
  }, -100);

  return null;
}
