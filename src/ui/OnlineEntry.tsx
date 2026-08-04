'use client';

import { useState } from 'react';
import {
  createOnlineRoom,
  findOnlineMatch,
  joinOnlineRoom,
  leaveOnlineRoom,
  normalizeRoomCode,
} from '@/src/online/onlineSession';
import styles from './OnlineNotice.module.css';

export function OnlineEntry({ error }: { readonly error: string | null }) {
  const [joinCode, setJoinCode] = useState('');
  return (
    <>
      <p className={styles.lead}>Найдите случайного соперника или пригласите друга по коду комнаты.</p>
      <div className={styles.entryGrid}>
        <button className={styles.primaryAction} type="button" onClick={() => void findOnlineMatch()}>
          <strong>Быстрый подбор</strong><span>Автоматически найти свободного игрока</span>
        </button>
        <button className={styles.primaryAction} type="button" onClick={() => void createOnlineRoom()}>
          <strong>Создать комнату</strong><span>Стать игроком 1 и пригласить друга</span>
        </button>
        <form onSubmit={(event) => { event.preventDefault(); void joinOnlineRoom(joinCode); }}>
          <label htmlFor="room-code">Код комнаты</label>
          <div className={styles.codeEntry}>
            <input
              id="room-code"
              aria-label="Шестизначный код комнаты"
              autoComplete="off"
              maxLength={6}
              placeholder="ABC234"
              value={joinCode}
              onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
            />
            <button disabled={joinCode.length !== 6} type="submit">Войти</button>
          </div>
        </form>
      </div>
      {error !== null && <p className={styles.error} role="alert">{error}</p>}
    </>
  );
}

export function MatchmakingSearch() {
  return (
    <div className={styles.searching} role="status">
      <i aria-hidden="true" />
      <strong>Подбор игрока…</strong>
      <span>Окно можно оставить открытым — бой начнётся автоматически.</span>
      <button type="button" onClick={() => void leaveOnlineRoom()}>Отменить поиск</button>
    </div>
  );
}
