'use client';

import {
  LUCKY_MOVEMENT_LIST,
  LUCKY_MOVE_LIST,
  type LuckyMoveListEntry,
} from '@/src/input';
import styles from './LuckyMoveList.module.css';

/**
 * Lucky's in-game move list.
 *
 * Every row is generated from the same catalogue the command matcher reads, so
 * this screen cannot drift from what the game accepts. Both notations are
 * shown: the keyboard column is what a player presses on the left side of the
 * screen, and the facing-relative column is the side-independent truth — which
 * is why nobody has to learn a second move list for the other side.
 */

const GROUP_ORDER = [
  'movement',
  'normal',
  'directional',
  'crouching',
  'aerial',
  'throw',
  'dual',
  'mechanic',
  'charge',
  'special',
  'enhanced',
  'super',
  'ultimate',
] as const;

const GROUP_TITLES: Readonly<Record<string, string>> = {
  movement: 'Передвижение и защита',
  normal: 'Базовые удары',
  directional: 'Удары с направлением',
  crouching: 'Удары в приседе',
  aerial: 'Удары в прыжке',
  throw: 'Броски',
  dual: 'Парные техники',
  mechanic: 'Механика Удачи',
  charge: 'Заряжаемые приёмы',
  special: 'Спецприёмы',
  enhanced: 'Усиленные приёмы',
  super: 'Супер-приёмы',
  ultimate: 'Ультимейт',
};

export function LuckyMoveList() {
  const entries = [...LUCKY_MOVEMENT_LIST, ...LUCKY_MOVE_LIST];
  return (
    <div className={styles.panel}>
      <p className={styles.legend}>
        Всё управление — только <strong>W A S D</strong> и{' '}
        <strong>J K I L</strong>. <strong>J</strong> и <strong>K</strong> — руки,
        плечи и локти; <strong>I</strong> и <strong>L</strong> — только ноги.
        Блок — удержание «назад», рывок — двойное нажатие направления.
        <br />
        Лицом вправо «вперёд» — это <strong>D</strong>; лицом влево «вперёд» —
        это <strong>A</strong>. Игра сама переворачивает направления.
      </p>
      {GROUP_ORDER.map((group) => {
        const rows = entries.filter((entry) => entry.category === group);
        if (rows.length === 0) return null;
        return (
          <section className={styles.group} key={group}>
            <h3 className={styles.groupTitle}>{GROUP_TITLES[group] ?? group}</h3>
            {rows.map((entry) => (
              <MoveRow entry={entry} key={`${entry.moveId}-${entry.keyboard}`} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function MoveRow({ entry }: { readonly entry: LuckyMoveListEntry }) {
  return (
    <div className={styles.row}>
      <span className={styles.name}>
        {entry.name}
        {entry.limb === 'none' ? null : (
          <span
            className={`${styles.limb} ${
              entry.limb === 'leg' ? styles.limbLeg : styles.limbUpper
            }`}
          >
            {entry.limb === 'leg' ? 'нога' : 'рука'}
          </span>
        )}
      </span>
      <span className={styles.keys}>{entry.keyboard}</span>
      <span className={styles.relative}>{entry.relative}</span>
      <span className={styles.cost}>{entry.cost}</span>
      <span className={styles.description}>{entry.description}</span>
    </div>
  );
}
