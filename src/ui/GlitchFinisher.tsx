'use client';

import type { GlitchSuperKind } from '@/src/data/glitch-super-moves';
import styles from './GlitchFinisher.module.css';
import motion from './GlitchFinisherMotion.module.css';

const CODE_ROWS = [
  'opponent.mesh[07] ............ purged',
  'rig.spine_02 ................. null',
  'material.skin ........... 0x000000',
  'collision.hurtbox ............ false',
  'memory.entity .............. deleted',
] as const;

const PIXELS = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  left: `${(index * 37 + 9) % 92}%`,
  top: `${(index * 53 + 7) % 88}%`,
}));

export function GlitchFinisher({
  fighterId,
  kind,
  version,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: GlitchSuperKind;
  readonly version: number;
}) {
  return (
    <section
      key={version}
      aria-label={`${fighterId.toUpperCase()} GLITCH ultimate: Patch Notes`}
      aria-live="assertive"
      className={`${styles.finisher} ${motion.timeline}`}
      data-kind={kind}
      data-side={fighterId}
      role="status"
    >
      <div className={`${styles.noise} ${motion.noise}`} aria-hidden="true" />
      {kind === 'error' && <ErrorStage />}
      {kind === 'critical' && <CriticalStage />}
      {kind === 'patchNotes' && <PatchNotesStage />}
      <div className={`${styles.finalFlash} ${motion.finalFlash}`} aria-hidden="true" />
    </section>
  );
}

function ErrorStage() {
  return (
    <section className={`${styles.errorStage} ${motion.errorStage}`}>
      <header className={motion.errorTitle}>
        <span>Level 1 Super</span>
        <h2>Ошибка</h2>
        <i>Error_01 // render thread unstable</i>
      </header>
      <div className={`${styles.opponent} ${motion.opponent}`}>
        <b>OPPONENT.dll</b>
        <div className={styles.silhouette} aria-hidden="true">
          {PIXELS.map((pixel) => (
            <i key={pixel.id} style={{ left: pixel.left, top: pixel.top }} />
          ))}
        </div>
        <small>TEXTURE STREAM // 04 FPS</small>
      </div>
      <div className={styles.lagMeter}>
        <span>FRAME LOSS</span><b>96.7%</b>
        <i><u /></i>
      </div>
    </section>
  );
}

function CriticalStage() {
  return (
    <section className={`${styles.bsodStage} ${motion.bsodStage}`}>
      <div className={styles.bsodCopy}>
        <em>Level 3 Super</em>
        <b>:(</b>
        <h2>Критическая ошибка</h2>
        <p>Система боя столкнулась с проблемой. Противник будет удалён.</p>
        <small>Stop code: OPPONENT_STILL_EXISTS</small>
      </div>
      <div className={styles.terminal}>
        <span>GLITCH@SYSTEM:~$</span>
        <strong className={motion.command}>DELETE OPPONENT</strong>
        <kbd className={motion.enterKey}>Enter</kbd>
      </div>
      <div className={`${styles.codeVictim} ${motion.codeVictim}`}>
        {CODE_ROWS.map((row) => <code key={row}>{row}</code>)}
      </div>
    </section>
  );
}

function PatchNotesStage() {
  return (
    <section className={`${styles.patchStage} ${motion.patchStage}`}>
      <div className={styles.patchWindow}>
        <div className={styles.windowBar}>
          <span><i /><i /><i /></span>
          <b>PATCH_NOTES.md</b>
          <small>GLITCH OS</small>
        </div>
        <div className={styles.patchBody}>
          <span>Ultimate finisher</span>
          <h2>Patch Notes</h2>
          <h3>Version 2.0</h3>
          <div className={styles.removed}>
            <i>−</i>
            <strong>Removed opponent</strong>
            <small>Resolved a persistent combat entity.</small>
          </div>
          <button className={motion.saveButton} tabIndex={-1} type="button">
            Save
          </button>
          <i className={`${styles.cursor} ${motion.cursor}`} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
