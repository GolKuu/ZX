import { InputBuffer } from '../core/InputBuffer';
import {
  GAME_ACTIONS,
  type CombatAction,
  type PlayerId,
} from '../core/types';
import type {
  GamepadBinding,
  GamepadInputProfile,
  PlayerInputAssignment,
} from './InputProfile';

type ConnectionListener = (playerId: PlayerId, gamepadLabel: string) => void;

export class GamepadProvider {
  private assignments = new Map<PlayerId, PlayerInputAssignment>();
  private previousActions = new Map<PlayerId, Set<CombatAction>>();
  private connectionState = new Map<PlayerId, boolean>();
  private attached = false;

  constructor(
    private readonly buffer: InputBuffer,
    private readonly onDisconnected: ConnectionListener,
    private readonly onReconnected: ConnectionListener,
    private readonly deadZone = 0.25,
  ) {}

  configure(assignments: Record<PlayerId, PlayerInputAssignment>) {
    this.assignments = new Map(
      Object.values(assignments)
        .filter((assignment) => assignment.device.kind === 'gamepad')
        .map((assignment) => [assignment.playerId, assignment]),
    );
    this.previousActions.clear();
    this.connectionState.clear();
  }

  attach() {
    if (this.attached) return;
    window.addEventListener('gamepadconnected', this.handleConnectionChange);
    window.addEventListener('gamepaddisconnected', this.handleConnectionChange);
    this.attached = true;
  }

  detach() {
    if (!this.attached) return;
    window.removeEventListener('gamepadconnected', this.handleConnectionChange);
    window.removeEventListener('gamepaddisconnected', this.handleConnectionChange);
    this.previousActions.forEach((_actions, playerId) => this.buffer.clearPlayer(playerId));
    this.previousActions.clear();
    this.attached = false;
  }

  poll() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = [...navigator.getGamepads()];
    this.assignments.forEach((assignment, playerId) => {
      const device = assignment.device;
      if (device.kind !== 'gamepad') return;
      const pad = this.findAssignedGamepad(pads, assignment);
      this.updateConnection(playerId, device.gamepadLabel, Boolean(pad));
      this.updateActions(playerId, pad, assignment.gamepadProfile);
    });
  }

  private findAssignedGamepad(
    pads: (Gamepad | null)[],
    assignment: PlayerInputAssignment,
  ) {
    const device = assignment.device;
    if (device.kind !== 'gamepad') return null;
    const indexed = pads[device.gamepadIndex];
    if (indexed?.connected) return indexed;
    return pads.find((pad) => pad?.connected && pad.id === device.gamepadLabel) ?? null;
  }

  private updateConnection(playerId: PlayerId, label: string, connected: boolean) {
    const previous = this.connectionState.get(playerId);
    if (previous === connected) return;
    this.connectionState.set(playerId, connected);
    if (connected) this.onReconnected(playerId, label);
    else this.onDisconnected(playerId, label);
  }

  private updateActions(
    playerId: PlayerId,
    gamepad: Gamepad | null,
    profile: GamepadInputProfile,
  ) {
    const previous = this.previousActions.get(playerId) ?? new Set<CombatAction>();
    const current = new Set<CombatAction>();
    if (gamepad) {
      GAME_ACTIONS.forEach((action) => {
        if (profile.bindings[action].some((binding) => this.isActive(gamepad, binding))) {
          current.add(action);
        }
      });
      if (profile.scheme === 'CLASSIC') {
        Object.entries(profile.classicBindings ?? {}).forEach(([action, bindings]) => {
          if (bindings?.some((binding) => this.isActive(gamepad, binding))) {
            current.add(action as CombatAction);
          }
        });
      }
    }

    current.forEach((action) => this.buffer.press(playerId, action));
    previous.forEach((action) => {
      if (!current.has(action)) this.buffer.release(playerId, action);
    });
    this.previousActions.set(playerId, current);
  }

  private isActive(gamepad: Gamepad, binding: GamepadBinding) {
    if (binding.type === 'button') return Boolean(gamepad.buttons[binding.index]?.pressed);
    const value = gamepad.axes[binding.axis] ?? 0;
    return binding.direction < 0 ? value < -this.deadZone : value > this.deadZone;
  }

  private readonly handleConnectionChange = () => this.poll();
}
