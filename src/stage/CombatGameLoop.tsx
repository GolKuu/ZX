'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CombatSession } from '@/src/game/CombatSession';
import {
  readCombatResetVersion,
} from '@/src/game/combatRuntime';
import {
  DEFAULT_CONTEXT,
  type CommandContext,
  KeyboardInputSource,
  PLAYER_TWO_BINDINGS,
  commandsFor,
  profileFor,
} from '@/src/input';
import { useControlStore } from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';
import { readMobileControls, resetMobileInput } from '@/src/ui/MobileControls';
import type { CharacterSelection } from '@/src/data/characterRoster';
import type { FighterInput } from '@/src/sim/state';

interface InputSource {
  sample(
    facing: -1 | 1,
    attacksLocked?: boolean,
    context?: CommandContext,
  ): FighterInput;
  attach(target: EventTarget): void;
  detach(target: EventTarget): void;
  updateBindings(bindings: Parameters<KeyboardInputSource['updateBindings']>[0]): void;
}

class MobileAwareInputSource implements InputSource {
  public constructor(private readonly keyboard: KeyboardInputSource) {}

  public sample(
    facing: -1 | 1,
    attacksLocked = false,
    context: CommandContext = DEFAULT_CONTEXT,
  ): FighterInput {
    this.keyboard.setVirtualControls(readMobileControls());
    return this.keyboard.sample(facing, attacksLocked, context);
  }

  public updateBindings(
    bindings: Parameters<KeyboardInputSource['updateBindings']>[0],
  ): void {
    this.keyboard.updateBindings(bindings);
  }

  public attach(target: EventTarget): void {
    this.keyboard.attach(target);
  }

  public detach(target: EventTarget): void {
    this.keyboard.detach(target);
  }
}

export function CombatGameLoop({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  const playerOne = useMemo(
    () => new MobileAwareInputSource(new KeyboardInputSource({
      bindings: useControlStore.getState().bindings,
      commands: commandsFor(fighterSelection[0]),
      profile: profileFor(fighterSelection[0]),
    })),
    [fighterSelection],
  );
  const playerTwoAI = useMemo(
    () => new KeyboardInputSource({
      bindings: PLAYER_TWO_BINDINGS,
      commands: commandsFor(fighterSelection[1]),
      profile: profileFor(fighterSelection[1]),
    }),
    [fighterSelection],
  );
  const session = useMemo(
    () => new CombatSession(playerOne, playerTwoAI, fighterSelection),
    [fighterSelection, playerOne, playerTwoAI],
  );
  const handledReset = useRef(readCombatResetVersion());
  const handledMode = useRef(useHudStore.getState().mode);

  useEffect(() => {
    useControlStore.getState().hydrate();
    playerOne.updateBindings(useControlStore.getState().bindings);
    playerOne.attach(window);
    playerTwoAI.attach(window);
    const unsubscribe = useControlStore.subscribe((state, previous) => {
      if (state.bindings !== previous.bindings) {
        playerOne.updateBindings(state.bindings);
      }
    });
    return () => {
      unsubscribe();
      playerOne.detach(window);
      playerTwoAI.detach(window);
      resetMobileInput();
    };
  }, [playerOne, playerTwoAI]);

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

