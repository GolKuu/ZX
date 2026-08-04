'use client';

import { useCallback, useEffect, useState } from 'react';
import { ARENAS } from '@/src/data/arenas';
import { CHARACTER_ROSTER, type CharacterId } from '@/src/data/characterRoster';
import {
  getOnlineSnapshot,
  leaveOnlineRoom,
  selectionFromLobby,
  subscribeOnline,
  updateOnlineLobby,
  type OnlineSnapshot,
} from '@/src/online/onlineSession';
import { useHudStore } from '@/src/store/hudStore';
import { MatchmakingSearch, OnlineEntry } from './OnlineEntry';
import styles from './OnlineNotice.module.css';

export function OnlineNotice() {
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const startOnlineMatch = useHudStore((state) => state.startOnlineMatch);
  const [online, setOnline] = useState<OnlineSnapshot>(getOnlineSnapshot);

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
      <OnlineShell back={back} title="Онлайн-бой">
        <OnlineEntry error={online.error} />
      </OnlineShell>
    );
  }

  if (online.status === 'matching') {
    return (
      <OnlineShell back={back} title="Ищем соперника">
        <MatchmakingSearch />
      </OnlineShell>
    );
  }

  return (
    <OnlineShell back={back} title={online.status === 'connecting' ? 'Подключение…' : 'Комната боя'}>
      <RoomCode code={online.code} />
      <div className={styles.connection} data-connected={online.peerConnected}>
        <i />{online.peerConnected ? 'Соперник подключён' : 'Ожидаем соперника…'}
      </div>
      <div className={styles.loadoutGrid}>
        <PlayerLoadout online={online} role="host" />
        <PlayerLoadout online={online} role="guest" />
      </div>
      <label className={styles.arenaSelect}>
        <span>Арена</span>
        <select
          disabled={online.role !== 'host'}
          value={online.lobby.arenaId}
          onChange={(event) => updateOnlineLobby({ arenaId: event.target.value as typeof online.lobby.arenaId })}
        >
          {ARENAS.map((arena) => <option key={arena.id} value={arena.id}>{arena.name}</option>)}
        </select>
        {online.role !== 'host' && <small>Выбирает создатель комнаты</small>}
      </label>
      {online.role === 'host' && (
        <button
          className={styles.startButton}
          disabled={!online.peerConnected || !online.lobby.hostReady || !online.lobby.guestReady}
          type="button"
          onClick={() => updateOnlineLobby({ phase: 'fight' })}
        >Начать онлайн-бой</button>
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
        {ready ? 'Готов ✓' : 'Я готов'}
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
      <span>Код комнаты</span><strong>{code}</strong><small>{copied ? 'Скопировано!' : 'Нажмите, чтобы скопировать'}</small>
    </button>
  );
}

function OnlineShell({ back, children, title }: { readonly back: () => void; readonly children: React.ReactNode; readonly title: string }) {
  return (
    <div aria-label="Онлайн-бой" aria-modal="true" className={styles.scrim} role="dialog">
      <div className={styles.radar} aria-hidden="true"><i /><i /><i /></div>
      <main className={styles.panel}>
        <header><span>СЕТЕВОЙ РЕЖИМ</span><h1>{title}</h1></header>
        {children}
      </main>
      <footer><button type="button" onClick={back}><kbd>Esc</kbd> Назад к режимам</button></footer>
    </div>
  );
}
