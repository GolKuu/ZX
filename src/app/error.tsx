'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { reportClientError } from '@/src/lib/client-errors';
import styles from './error.module.css';

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    reportClientError(error, {
      digest: error.digest,
      source: 'app.error_boundary',
    });
  }, [error]);

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>SYSTEM INTERRUPTION</p>
      <h1>The clash lost sync.</h1>
      <p>The error was recorded. Retry this screen or return to the arena entrance.</p>
      <div className={styles.actions}>
        <button type="button" onClick={reset}>Retry</button>
        <Link href="/">Return home</Link>
      </div>
    </main>
  );
}
