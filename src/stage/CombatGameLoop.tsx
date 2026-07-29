'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CombatSession } from '@/src/game/CombatSession';
import {
  readCombatResetVersion,
} from '@/src/game/combatRuntime';
import {
  AANG_COMMANDS,
  CHRONO_COMMANDS,
  ECHO_COMMANDS,
  GLITCH_COMMANDS,
  IDOL_COMMANDS,
  KADE_COMMANDS,
  KeyboardInputSource,
  MIM_COMMANDS,
  PLAYER_TWO_BINDINGS,
} from '@/src/input';
import { useControlStore } from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';
import type {
  CharacterId,
  CharacterSelection,
} from '@/src/data/characterRoster';

export function CombatGameLoop({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  const keyboard = useMemo(
    () => new KeyboardInputSource({
      bindings: useControlStore.getState().bindings,
      commands: commandsFor(fighterSelection[0]),
    }),
    [fighterSelection],
  );
  const secondKeyboard = useMemo(
    () => new KeyboardInputSource({
      bindings: PLAYER_TWO_BINDINGS,
      commands: commandsFor(fighterSelection[1]),
    }),
    [fighterSelection],
  );
  const session = useMemo(
    () => new CombatSession(keyboard, secondKeyboard, fighterSelection),
    [fighterSelection, keyboard, secondKeyboard],
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
      useHudStore.getState().resetMatchUi();
      session.reset();
      handledMode.current = useHudStore.getState().mode;
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

function commandsFor(characterId: CharacterId) {
  if (characterId === 'aang') return AANG_COMMANDS;
  if (characterId === 'chrono') return CHRONO_COMMANDS;
  if (characterId === 'echo') return ECHO_COMMANDS;
  if (characterId === 'glitch') return GLITCH_COMMANDS;
  if (characterId === 'idol') return IDOL_COMMANDS;
  if (characterId === 'mim') return MIM_COMMANDS;
  return KADE_COMMANDS;
}
