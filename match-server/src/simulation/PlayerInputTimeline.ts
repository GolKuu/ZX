import type {
  InputFrame,
  PlayerId,
  PlayerInputFrame,
} from '../../../src/game/core/types.js';
import {
  decodeNetworkInput,
  type RawNetworkInput,
} from '../../../src/game/network/InputCodec.js';
import type {
  GameplayInputPacket,
} from '../../../src/game/network/protocol.js';

const EMPTY_RAW: RawNetworkInput = { actionBitmask: 0, direction: 0 };
const MAX_TICK_DRIFT = 120;

type QueuedInput = {
  packet: GameplayInputPacket;
  raw: RawNetworkInput;
};

export class PlayerInputTimeline {
  private readonly queued = new Map<number, QueuedInput>();
  private current: RawNetworkInput = EMPTY_RAW;
  private previous: RawNetworkInput = EMPTY_RAW;
  private lastReceivedSequence = 0;
  private processedSequence = 0;
  private acknowledgedTick = 0;

  constructor(private readonly inputDelayTicks: number) {}

  enqueue(packet: GameplayInputPacket, serverTick: number) {
    if (packet.sequence <= this.lastReceivedSequence) return 'OLD_SEQUENCE';
    if (
      packet.tick < Math.max(0, serverTick - MAX_TICK_DRIFT) ||
      packet.tick > serverTick + MAX_TICK_DRIFT
    ) return 'TICK_DRIFT';
    if (packet.acknowledgedTick > serverTick) return 'FUTURE_ACK';
    const scheduledTick = Math.max(
      serverTick + this.inputDelayTicks,
      packet.tick + this.inputDelayTicks,
    );
    if (scheduledTick > serverTick + MAX_TICK_DRIFT) return 'FUTURE_INPUT';
    this.lastReceivedSequence = packet.sequence;
    this.acknowledgedTick = packet.acknowledgedTick;
    this.queued.set(scheduledTick, {
      packet,
      raw: {
        actionBitmask: packet.actionBitmask,
        direction: packet.direction,
      },
    });
    return null;
  }

  frame(serverTick: number): PlayerInputFrame {
    const due = [...this.queued.entries()]
      .filter(([tick]) => tick <= serverTick)
      .sort(([first], [second]) => first - second);
    due.forEach(([tick, queued]) => {
      this.current = queued.raw;
      this.processedSequence = queued.packet.sequence;
      this.queued.delete(tick);
    });
    const frame = decodeNetworkInput(this.current, this.previous);
    this.previous = this.current;
    return frame;
  }

  get lastProcessedSequence() {
    return this.processedSequence;
  }

  get lastAcknowledgedTick() {
    return this.acknowledgedTick;
  }

  reset() {
    this.queued.clear();
    this.current = EMPTY_RAW;
    this.previous = EMPTY_RAW;
    this.lastReceivedSequence = 0;
    this.processedSequence = 0;
    this.acknowledgedTick = 0;
  }
}

export function makeInputFrame(
  playerId: PlayerId,
  own: PlayerInputFrame,
  opponent: PlayerInputFrame,
): InputFrame {
  return playerId === 'player1'
    ? { player1: own, player2: opponent }
    : { player1: opponent, player2: own };
}
