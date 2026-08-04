'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { CombatSession } from '@/src/game/CombatSession';
import {
  readCombatResetVersion,
  combatRenderFrame,
  publishCombatFrame,
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
import {
  broadcastOnlineFrame,
  broadcastOnlineResult,
  getOnlineSnapshot,
  readRemoteInput,
  sendOnlineInput,
  subscribeOnline,
  takeRemoteFrame,
  takeRemoteResult,
} from '@/src/online/onlineSession';
import { reportOnlineMatchResult } from '@/src/online/onlineGlory';

interface InputSource {
  sample(
    facing: -1 | 1,
    attacksLocked?: boolean,
    context?: CommandContext,
  ): FighterInput;
  attach(target: EventTarget): void;
  detach(target: EventTarget): void;
  updateBindings(bindings: Parameters<KeyboardInputSource['updateBindings']>[0]): void;
  releaseAll(): void;
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

  public releaseAll(): void {
    this.keyboard.releaseAll();
    resetMobileInput();
  }
}

class OnlineRemoteInputSource implements InputSource {
  private lastSequence = -1;

  public sample(): FighterInput {
    const packet = readRemoteInput();
    if (packet.sequence !== this.lastSequence) {
      this.lastSequence = packet.sequence;
      return packet.input;
    }
    const input = packet.input;
    return {
      movement: input.movement,
      guard: input.guard,
      guardWhileWalking: input.guardWhileWalking,
      guardMode: input.guardMode,
      crouching: input.crouching,
      jump: input.jump,
      wallClimb: input.wallClimb,
    };
  }

  public attach(): void {}
  public detach(): void {}
  public updateBindings(): void {}
  public releaseAll(): void { this.lastSequence = -1; }
}

export function CombatGameLoop({
  fighterSelection,
}: {
  readonly fighterSelection: CharacterSelection;
}) {
  const onlineRole = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineSnapshot,
  ).role;
  const localFighterIndex = onlineRole === 'guest' ? 1 : 0;
  const playerOne = useMemo(
    () => new MobileAwareInputSource(new KeyboardInputSource({
      bindings: useControlStore.getState().bindings,
      commands: commandsFor(fighterSelection[localFighterIndex]),
      profile: profileFor(fighterSelection[localFighterIndex]),
    })),
    [fighterSelection, localFighterIndex],
  );
  const playerTwoAI = useMemo(
    () => onlineRole === 'host' ? new OnlineRemoteInputSource() : new KeyboardInputSource({
      bindings: PLAYER_TWO_BINDINGS,
      commands: commandsFor(fighterSelection[1]),
      profile: profileFor(fighterSelection[1]),
    }),
    [fighterSelection, onlineRole],
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
    const unsubscribeHud = useHudStore.subscribe((state, previous) => {
      if (state.screen !== previous.screen) {
        playerOne.releaseAll();
        playerTwoAI.releaseAll();
      }
      if (state.screen === 'result' && previous.screen !== 'result' && state.mode === 'online') {
        if (onlineRole === 'host') broadcastOnlineResult(state.result);
        reportOnlineMatchResult(state.result);
      }
    });
    return () => {
      unsubscribe();
      unsubscribeHud();
      playerOne.detach(window);
      playerTwoAI.detach(window);
      resetMobileInput();
    };
  }, [onlineRole, playerOne, playerTwoAI]);

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
      if (hud.mode !== 'online' || onlineRole === 'host') {
        session.advance(Math.min(delta, 0.1) * 1_000);
        const world = combatRenderFrame.world;
        if (hud.mode === 'online' && world !== null && world.frame % 2 === 0) {
          broadcastOnlineFrame(world, useHudStore.getState().snapshot);
        }
      } else if (onlineRole === 'guest') {
        const fighter = combatRenderFrame.world?.fighters.find(({ id }) => id === 'p2');
        sendOnlineInput(playerOne.sample(fighter?.facing ?? -1));
        const packet = takeRemoteFrame();
        if (packet !== null) {
          publishCombatFrame(packet.world, 0);
          useHudStore.getState().publishSnapshot(packet.hud);
        }
        const result = takeRemoteResult();
        if (result !== null) useHudStore.getState().openResult(result);
      }
    }
  }, -100);

  return null;
}
