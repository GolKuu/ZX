import { circleFighters } from '../../../src/game/data/characters/circleFighters.js';
import { teamActionsForBitmask } from '../../../src/game/network/InputCodec.js';
import type { ClientControlMessage } from '../../../src/game/network/protocol.js';
import type { RoomPlayer } from '../rooms/RoomTypes.js';
import type { TeamMatchRoom } from './TeamMatchRoom.js';

export class TeamRoomCommands {
  constructor(private readonly room: TeamMatchRoom) {}

  handle(player: RoomPlayer, message: ClientControlMessage) {
    if (message.type === 'selectCharacter') {
      this.selectCharacter(player, message.characterId);
    } else if (message.type === 'setReady') {
      this.setReady(player, message.ready);
    } else if (message.type === 'rematch') {
      this.rematch(player, message.ready);
    } else if (message.type === 'input') {
      this.input(player, message.payload);
    } else if (message.type === 'ping') {
      this.room.output.pong(player, message.clientTime);
    } else if (message.type === 'leave') {
      player.socket?.close(1000, 'Player left');
    }
  }

  private selectCharacter(player: RoomPlayer, characterId: string) {
    if (!['waiting', 'lobby'].includes(this.room.status)) return;
    if (!circleFighters.some((fighter) => fighter.id === characterId)) return;
    player.characterId = characterId;
    this.room.eachPlayer((item) => { item.ready = false; });
    this.room.output.room();
  }

  private setReady(player: RoomPlayer, ready: boolean) {
    if (!['waiting', 'lobby'].includes(this.room.status)) return;
    player.ready = ready;
    if (this.room.everyPlayer((item) => item.ready && item.connected)) {
      this.room.startMatch();
    }
    this.room.output.room();
  }

  private rematch(player: RoomPlayer, ready: boolean) {
    if (this.room.status !== 'finished' || !this.room.match) return;
    player.rematchReady = ready;
    if (this.room.everyPlayer((item) => item.rematchReady && item.connected)) {
      this.room.eachPlayer((item) => { item.rematchReady = false; });
      this.room.match.rematch(this.room.inputTimelines);
      this.room.status = 'playing';
      this.room.output.snapshot();
    }
    this.room.output.room();
  }

  private input(
    player: RoomPlayer,
    packet: Extract<ClientControlMessage, { type: 'input' }>['payload'],
  ) {
    const match = this.room.match;
    if (!['playing', 'disconnected'].includes(this.room.status) || !match) return;
    if (packet.matchId !== this.room.matchId) {
      this.room.output.error(player, 'MATCH_ID', 'Wrong match');
      return;
    }
    for (const action of teamActionsForBitmask(packet.actionBitmask)) {
      const validation = match.validateAction(player.playerId, action);
      if (!validation.ok) {
        this.room.output.error(player, validation.reason, 'Team action rejected');
        return;
      }
    }
    const error = player.input.enqueue(packet, match.tick);
    if (error) this.room.output.error(player, error, 'Input rejected');
  }
}
