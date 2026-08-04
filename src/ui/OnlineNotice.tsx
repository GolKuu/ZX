'use client';

import { useCallback, useEffect, useState } from 'react';
import { ARENAS } from '@/src/data/arenas';
import { CHARACTER_ROSTER, type CharacterId } from '@/src/data/characterRoster';
import {
  createOnlineRoom,
  getOnlineSnapshot,
  joinOnlineRoom,
  leaveOnlineRoom,
  normalizeRoomCode,
  selectionFromLobby,
  subscribeOnline,
  updateOnlineLobby,
  type OnlineSnapshot,
} from '@/src/online/onlineSession';
import { useHudStore } from '@/src/store/hudStore';
import styles from './OnlineNotice.module.css';

export function OnlineNotice() {
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const startOnlineMatch = useHudStore((state) => state.startOnlineMatch);
  const [online, setOnline] = useState<OnlineSnapshot>(getOnlineSnapshot);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => subscribeOnline(() => setOnline(getOnlineSnapshot())), []);
  useEffect(() => {
    if (online.status === 'fight') {
      startOnlineMatch(selectionFromLobby(online.lobby), online.lobby.arenaId);
    }
  }, [online.lobby, online.status, startOnlineMatch]);

  const back = useCallback(() => {
    void leaveOnlineRoom();
    openModeMenu();
  }, [openModeMenu]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') back();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [back]);

  if (online.status === 'idle' || online.status === 'error') {
    return (
      <OnlineShell back={back} title="Online battle">
        <p className={styles.lead}>Create a private room or enter a friend&apos;s six-character code.</p>
        <div className={styles.entryGrid}>
          <button className={styles.primaryAction} type="button" onClick={() => void createOnlineRoom()}>
            <strong>Create room</strong><span>Become Player 1 and invite a friend</span>
          </button>
          <form onSubmit={(event) => { event.preventDefault(); void joinOnlineRoom(joinCode); }}>
            <label htmlFor="room-code">Room code</label>
            <div className={styles.codeEntry}>
              <input
                id="room-code"
                aria-label="Six-character room code"
                autoComplete="off"
                inputMode="text"
                maxLength={6}
                placeholder="ABC234"
                value={joinCode}
                onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
              />
              <button disabled={joinCode.length !== 6} type="submit">Join</button>
            </div>
          </form>
        </div>
        {online.error !== null && <p className={styles.error} role="alert">{online.error}</p>}
      </OnlineShell>
    );
  }

  return (
    <OnlineShell back={back} title={online.status === 'connecting' ? 'Connecting…' : 'Private room'}>
      <RoomCode code={online.code} />
      <div className={styles.connection} data-connected={online.peerConnected}>
        <i />{online.peerConnected ? 'Opponent connected' : 'Waiting for opponent…'}
      </div>
      <div className={styles.loadoutGrid}>
        <PlayerLoadout online={online} role="host" />
        <PlayerLoadout online={online} role="guest" />
      </div>
      <label className={styles.arenaSelect}>
        <span>Arena</span>
        <select
          disabled={online.role !== 'host'}
          value={online.lobby.arenaId}
          onChange={(event) => updateOnlineLobby({ arenaId: event.target.value as typeof online.lobby.arenaId })}
        >
          {ARENAS.map((arena) => <option key={arena.id} value={arena.id}>{arena.name}</option>)}
        </select>
        {online.role !== 'host' && <small>Chosen by the host</small>}
      </label>
      {online.role === 'host' && (
        <button
          className={styles.startButton}
          disabled={!online.peerConnected || !online.lobby.hostReady || !online.lobby.guestReady}
          type="button"
          onClick={() => updateOnlineLobby({ phase: 'fight' })}
        >Start online fight</button>
      )}
    </OnlineShell>
  );
}

function PlayerLoadout({ online, role }: { readonly online: OnlineSnapshot; readonly role: 'host' | 'guest' }) {
  const isLocal = online.role === role;
  const fighter = role === 'host' ? online.lobby.hostFighter : online.lobby.guestFighter;
  const ready = role === 'host' ? online.lobby.hostReady : online.lobby.guestReady;
  const patchFighter = (value: CharacterId) => updateOnlineLobby(role === 'host' ? { hostFighter: value } : { guestFighter: value });
  const patchReady = () => updateOnlineLobby(role === 'host' ? { hostReady: !ready } : { guestReady: !ready });
  return (
    <section className={styles.playerCard} data-local={isLocal} data-ready={ready}>
      <span>{role === 'host' ? 'P1 · HOST' : 'P2 · GUEST'}{isLocal ? ' · YOU' : ''}</span>
      <select disabled={!isLocal || ready} value={fighter} onChange={(event) => patchFighter(event.target.value as CharacterId)}>
        {CHARACTER_ROSTER.map((character) => <option key={character.id} value={character.id}>{character.displayName}</option>)}
      </select>
      <button disabled={!isLocal || (role === 'guest' && !online.peerConnected)} type="button" onClick={patchReady}>
        {ready ? 'Ready ✓' : 'Mark ready'}
      </button>
    </section>
  );
}

function RoomCode({ code }: { readonly code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className={styles.roomCode} type="button" onClick={() => {
      void navigator.clipboard.writeText(code).then(() => setCopied(true));
    }}>
      <span>Room code</span><strong>{code}</strong><small>{copied ? 'Copied!' : 'Click to copy'}</small>
    </button>
  );
}

function OnlineShell({ back, children, title }: { readonly back: () => void; readonly children: React.ReactNode; readonly title: string }) {
  return (
    <div aria-label="Online battle" aria-modal="true" className={styles.scrim} role="dialog">
      <div className={styles.radar} aria-hidden="true"><i /><i /><i /></div>
      <main className={styles.panel}>
        <header><span>NETWORK MODE</span><h1>{title}</h1></header>
        {children}
      </main>
      <footer><button type="button" onClick={back}><kbd>Esc</kbd> Back to modes</button></footer>
    </div>
  );
}
