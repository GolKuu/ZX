'use client';

import { useEffect, useState } from 'react';
import {
  CHARACTER_ROSTER,
  type CharacterId,
} from '@/src/data/characterRoster';
import styles from './ModeFightPreview.module.css';

type PreviewPair = readonly [CharacterId, CharacterId];

const INITIAL_PAIR: PreviewPair = ['glitch', 'mim'];

export function ModeFightPreview() {
  const [fighters, setFighters] = useState<PreviewPair>(INITIAL_PAIR);

  useEffect(() => {
    setFighters(pickPreviewPair());
  }, []);

  return (
    <div aria-hidden="true" className={styles.preview}>
      <div className={styles.speedLines} />
      <PreviewFighter characterId={fighters[0]} side="left" />
      <PreviewFighter characterId={fighters[1]} side="right" />
      <div className={styles.impact}><i /><i /><i /></div>
      <div className={styles.floor} />
      <div className={styles.matchLabel}>
        <span>{displayNameFor(fighters[0])}</span>
        <b>VS</b>
        <span>{displayNameFor(fighters[1])}</span>
      </div>
    </div>
  );
}

function PreviewFighter({
  characterId,
  side,
}: {
  readonly characterId: CharacterId;
  readonly side: 'left' | 'right';
}) {
  return (
    <div className={styles.fighterFrame} data-side={side}>
      <i
        className={styles.fighter}
        data-character={characterId}
        style={{
          backgroundImage: `url('/sprites/reference-fighters/${characterId}-atlas.webp')`,
        }}
      />
    </div>
  );
}

function pickPreviewPair(): PreviewPair {
  const ids = CHARACTER_ROSTER.map(({ id }) => id);
  const values = new Uint32Array(2);
  crypto.getRandomValues(values);
  const firstIndex = (values[0] ?? 0) % ids.length;
  const secondIndex = (
    firstIndex + 1 + (values[1] ?? 0) % (ids.length - 1)
  ) % ids.length;
  return [ids[firstIndex] ?? INITIAL_PAIR[0], ids[secondIndex] ?? INITIAL_PAIR[1]];
}

function displayNameFor(characterId: CharacterId) {
  return CHARACTER_ROSTER.find(({ id }) => id === characterId)?.displayName ?? characterId;
}
