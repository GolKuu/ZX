import { OnlineMatchClient } from '../game/network/OnlineMatchClient';
import type { RoomCredentials } from '../game/network/protocol';

let activeClient: OnlineMatchClient | null = null;

export const onlineRoomStore = {
  connect(credentials: RoomCredentials) {
    if (
      activeClient &&
      activeClient.credentials.matchId === credentials.matchId &&
      activeClient.credentials.playerToken === credentials.playerToken
    ) {
      activeClient.connect();
      return activeClient;
    }
    activeClient?.destroy();
    activeClient = new OnlineMatchClient(credentials);
    activeClient.connect();
    return activeClient;
  },

  get() {
    return activeClient;
  },

  clear() {
    activeClient?.destroy();
    activeClient = null;
  },
};
