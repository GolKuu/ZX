import { circleFighters } from '../../../src/game/data/characters/circleFighters.js';
import type { PlayerId } from '../../../src/game/core/types.js';
import type {
  ClientControlMessage,
  OnlineRoomStatus,
} from '../../../src/game/network/protocol.js';
import type { AuthoritativeMatch } from '../simulation/AuthoritativeMatch.js';
import type { PlayerInputTimeline } from '../simulation/PlayerInputTimeline.js';
import type { RoomOutput } from './RoomOutput.js';
import type { RoomPlayer } from './RoomTypes.js';

const PLAYER_IDS: readonly PlayerId[] = ['player1', 'player2'];

type CommandHost = {
  matchId: string;
  status: () => OnlineRoomStatus;
  setStatus: (status: OnlineRoomStatus) => void;
  match: () => AuthoritativeMatch | null;
  players: () => Partial<Record<PlayerId, RoomPlayer>>;
  inputs: () => Record<PlayerId, PlayerInputTimeline>;
  startMatch: () => void;
  output: RoomOutput;
  now: () => number;
};

export class RoomCommands {
  constructor(private readonly host: CommandHost) {}

  handle(player: RoomPlayer, message: ClientControlMessage) {
    if (message.type === 'selectCharacter') this.selectCharacter(player, message.characterId);
    else if (message.type === 'setReady') this.setReady(player, message.ready);
    else if (message.type === 'rematch') this.setRematch(player, message.ready);
    else if (message.type === 'input') this.receiveInput(player, message.payload);
    else if (message.type === 'ping') {
      this.host.output.error(player, 'PONG_COMPAT', String(message.clientTime));
      player.socket?.send(JSON.stringify({
        type: 'pong',
        clientTime: message.clientTime,
        serverTime: this.host.now(),
      }));
    } else if (message.type === 'leave') {
      player.socket?.close(1000, 'Player left');
    }
  }

  private selectCharacter(player: RoomPlayer, characterId: string) {
    if (!['waiting', 'lobby'].includes(this.host.status())) return;
    if (!circleFighters.some((fighter) => fighter.id === characterId)) return;
    player.characterId = characterId;
    PLAYER_IDS.forEach((id) => {
      const item = this.host.players()[id];
      if (item) item.ready = false;
    });
    this.host.output.broadcastRoom();
  }

  private setReady(player: RoomPlayer, ready: boolean) {
    if (!['waiting', 'lobby'].includes(this.host.status())) return;
    player.ready = ready;
    if (this.everyPlayer((item) => item.ready && item.connected)) this.host.startMatch();
    this.host.output.broadcastRoom();
  }

  private setRematch(player: RoomPlayer, ready: boolean) {
    const match = this.host.match();
    if (this.host.status() !== 'finished' || !match) return;
    player.rematchReady = ready;
    if (this.everyPlayer((item) => item.rematchReady && item.connected)) {
      PLAYER_IDS.forEach((id) => {
        this.host.players()[id]!.rematchReady = false;
      });
      match.rematch(this.host.inputs());
      this.host.setStatus('playing');
      this.host.output.broadcastSnapshot();
    }
    this.host.output.broadcastRoom();
  }

  private receiveInput(
    player: RoomPlayer,
    packet: Extract<ClientControlMessage, { type: 'input' }>['payload'],
  ) {
    const match = this.host.match();
    if (this.host.status() !== 'playing' || !match) return;
    if (packet.matchId !== this.host.matchId) {
      this.host.output.error(player, 'MATCH_ID', 'Wrong match');
      return;
    }
    const error = player.input.enqueue(packet, match.tick);
    if (error) this.host.output.error(player, error, 'Input rejected');
  }

  private everyPlayer(predicate: (player: RoomPlayer) => boolean) {
    return PLAYER_IDS.every((id) => {
      const player = this.host.players()[id];
      return player ? predicate(player) : false;
    });
  }
}
