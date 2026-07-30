'use client';

import dynamic from 'next/dynamic';
import styles from './play.module.css';

const RenderExperience = dynamic(
  () => import('@/src/stage/RenderExperience').then((module) => module.RenderExperience),
  {
    ssr: false,
    loading: () => (
      <div aria-live="polite" className={styles.loading} role="status">
        <span />
        <p>Готовим арену…</p>
      </div>
    ),
  },
);

export function PlayRoute() {
  return <RenderExperience />;
}
