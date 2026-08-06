'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { CombatSession } from '@/src/game/CombatSession';
import {
  readCombatResetVersion,
  combatRenderFrame,
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
  private lastInput: FighterInput = {};

  public constructor(private readonly keyboard: KeyboardInputSource) {}

  public sample(
    facing: -1 | 1,
    attacksLocked = false,
    context: CommandContext = DEFAULT_CONTEXT,
  ): FighterInput {
    this.keyboard.setVirtualControls(readMobileControls());
    this.lastInput = this.keyboard.sample(facing, attacksLocked, context);
    return this.lastInput;
  }

  public readLastSample(): FighterInput { return this.lastInput; }

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
  const isOnline = onlineRole !== null;
  const localInput = useMemo(
    () => new MobileAwareInputSource(new KeyboardInputSource({
      bindings: useControlStore.getState().bindings,
      commands: commandsFor(fighterSelection[localFighterIndex]),
      profile: profileFor(fighterSelection[localFighterIndex]),
    })),
    [fighterSelection, localFighterIndex],
  );
  const remoteInput = useMemo(() => new OnlineRemoteInputSource(), []);
  const playerTwoAI = useMemo(
    () => new KeyboardInputSource({
      bindings: PLAYER_TWO_BINDINGS,
      commands: commandsFor(fighterSelection[1]),
      profile: profileFor(fighterSelection[1]),
    }),
    [fighterSelection],
  );
  const playerOne = isOnline && onlineRole === 'guest' ? remoteInput : localInput;
  const playerTwo = isOnline
    ? onlineRole === 'guest' ? localInput : remoteInput
    : playerTwoAI;
  const session = useMemo(
    () => new CombatSession(playerOne, playerTwo, fighterSelection),
    [fighterSelection, playerOne, playerTwo],
  );
  const handledReset = useRef(readCombatResetVersion());
  const handledMode = useRef(useHudStore.getState().mode);
  const lastSentInput = useRef('');

  useEffect(() => {
    useControlStore.getState().hydrate();
    localInput.updateBindings(useControlStore.getState().bindings);
    localInput.attach(window);
    if (!isOnline) playerTwoAI.attach(window);
    const unsubscribe = useControlStore.subscribe((state, previous) => {
      if (state.bindings !== previous.bindings) {
        localInput.updateBindings(state.bindings);
      }
    });
    const unsubscribeHud = useHudStore.subscribe((state, previous) => {
      if (state.screen !== previous.screen) {
        localInput.releaseAll();
        playerTwoAI.releaseAll();
      }
      if (state.screen === 'victory' && previous.screen !== 'victory' && state.mode === 'online') {
        if (onlineRole === 'host') broadcastOnlineResult(state.result);
      }
      if (state.screen === 'result' && previous.screen !== 'result' && state.mode === 'online') {
        reportOnlineMatchResult(state.result);
      }
    });
    return () => {
      unsubscribe();
      unsubscribeHud();
      localInput.detach(window);
      playerTwoAI.detach(window);
      resetMobileInput();
    };
  }, [isOnline, localInput, onlineRole, playerTwoAI]);

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
      if (hud.mode !== 'online' || onlineRole === 'host' || onlineRole === 'guest') {
        // Both peers run the deterministic combat step locally. This makes the
        // attack, hitstop and impact VFX happen on the input frame instead of
        // waiting for a broadcast from the host. Host snapshots remain useful
        // for diagnostics/recovery, while the local prediction owns rendering.
        session.advance(Math.min(delta, 0.1) * 1_000);
        if (hud.mode === 'online') {
          const world = combatRenderFrame.world;
          // CombatSession already sampled the local source for this fixed
          // step. Reuse that exact packet; sampling a second time here would
          // consume one-frame attack presses before they reach the peer.
          const localInputPacket = localInput.readLastSample();
          const serializedInput = JSON.stringify(localInputPacket);
          if (serializedInput !== lastSentInput.current) {
            lastSentInput.current = serializedInput;
            sendOnlineInput(localInputPacket);
          }
          if (onlineRole === 'host' && world !== null && world.frame % 2 === 0) {
            broadcastOnlineFrame(world, useHudStore.getState().snapshot);
          }
        }
        const result = takeRemoteResult();
        if (result !== null) useHudStore.getState().openVictory(result);
      }
    }
  }, -100);

  return null;
}
