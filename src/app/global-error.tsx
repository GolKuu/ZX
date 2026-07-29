'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { reportClientError } from '@/src/lib/client-errors';
import styles from './error.module.css';

type GlobalErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportClientError(error, {
      digest: error.digest,
      source: 'app.global_error_boundary',
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className={styles.page}>
          <p className={styles.eyebrow}>CRITICAL INTERRUPTION</p>
          <h1>Circle Clash stopped.</h1>
          <p>The error was recorded safely. Retry, or reload the application.</p>
          <div className={styles.actions}>
            <button type="button" onClick={reset}>Retry</button>
            <Link href="/">Reload</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
