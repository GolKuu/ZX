import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { createRoomCode } from './roomCode';
import type { OnlineRole } from './types';

type Ticket = { readonly ticketId: string; readonly joinedAt: number };
type MatchCallback = (code: string, role: OnlineRole) => void;

let queue: RealtimeChannel | null = null;

export async function startMatchmaking(
  client: SupabaseClient,
  onMatch: MatchCallback,
  onError: () => void,
): Promise<void> {
  await stopMatchmaking(client);
  const ticket: Ticket = { ticketId: crypto.randomUUID(), joinedAt: Date.now() };
  let matched = false;
  let pending: { guestId: string; code: string } | null = null;
  queue = client.channel('circle-clash:matchmaking:v1', {
    config: { broadcast: { self: false }, presence: { key: ticket.ticketId } },
  });

  const offerPair = async () => {
    if (matched || queue === null) return;
    const tickets = Object.values(queue.presenceState()).flat()
      .map((entry) => entry as unknown as Ticket)
      .filter((entry) => typeof entry.ticketId === 'string')
      .sort((a, b) => a.joinedAt - b.joinedAt || a.ticketId.localeCompare(b.ticketId));
    const index = tickets.findIndex(({ ticketId }) => ticketId === ticket.ticketId);
    const partner = index % 2 === 0 ? tickets[index + 1] : tickets[index - 1];
    if (partner === undefined || index % 2 !== 0) return;
    pending ??= { guestId: partner.ticketId, code: createRoomCode() };
    await queue.send({
      type: 'broadcast', event: 'offer',
      payload: { from: ticket.ticketId, to: pending.guestId, code: pending.code },
    });
  };

  queue
    .on('presence', { event: 'sync' }, () => { void offerPair(); })
    .on('broadcast', { event: 'offer' }, ({ payload }) => {
      const offer = payload as { from?: string; to?: string; code?: string };
      if (matched || offer.to !== ticket.ticketId || typeof offer.code !== 'string') return;
      matched = true;
      void queue?.send({
        type: 'broadcast', event: 'accept',
        payload: { from: ticket.ticketId, to: offer.from, code: offer.code },
      }).then(() => onMatch(offer.code!, 'guest'));
    })
    .on('broadcast', { event: 'accept' }, ({ payload }) => {
      const accept = payload as { from?: string; to?: string; code?: string };
      if (matched || accept.to !== ticket.ticketId || pending === null) return;
      if (accept.from !== pending.guestId || accept.code !== pending.code) return;
      matched = true;
      onMatch(pending.code, 'host');
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await queue?.track(ticket);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError();
      }
    });
}

export async function stopMatchmaking(client: SupabaseClient | null): Promise<void> {
  if (queue === null) return;
  const active = queue;
  queue = null;
  if (client !== null) await client.removeChannel(active);
}
