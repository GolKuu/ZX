'use client';

import { useEffect, type CSSProperties } from 'react';
import type { GlitchSuperKind } from '@/src/data/glitch-super-moves';
import {
  GLITCH_SUPER_MOVE_IDS,
} from '@/src/data/glitch-super-moves';
import {
  speakGlitchFinalLine,
  speakGlitchMove,
} from '@/src/stage/glitch/glitchVoiceLines';
import styles from './GlitchFinisher.module.css';
import motion from './GlitchFinisherMotion.module.css';
import stage from './GlitchSuperStages.module.css';
import system from './GlitchSystemFailure.module.css';

const UPDATE_MESSAGES = [
  'Compatibility check failed',
  'Opponent package is obsolete',
  'Downloading impossible geometry',
  'Applying reality hotfix',
  'Rollback unavailable',
] as const;

const FAILURE_ROWS = [
  'FATAL_EXCEPTION // 0x0000DEAD',
  'kernel.fighter_state = CORRUPT',
  'timeline.sync ............. LOST',
  'reality.bounds ........... FALSE',
] as const;

const CINEMATIC_LABELS = {
  error: 'Critical Error',
  critical: 'Patch Notes',
  patchNotes: 'System Failure',
} as const;

export function GlitchFinisher({
  fighterId,
  kind,
  version,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: GlitchSuperKind;
  readonly version: number;
}) {
  useEffect(() => {
    speakGlitchMove(GLITCH_SUPER_MOVE_IDS[kind]);
    if (kind !== 'patchNotes') return undefined;
    const finalLine = window.setTimeout(
      () => speakGlitchFinalLine(version),
      2_650,
    );
    return () => window.clearTimeout(finalLine);
  }, [kind, version]);

  return (
    <section
      key={version}
      aria-label={`${fighterId.toUpperCase()} GLITCH ${CINEMATIC_LABELS[kind]}`}
      aria-live="assertive"
      className={`${styles.finisher} ${motion.timeline}`}
      data-kind={kind}
      data-side={fighterId}
      role="status"
    >
      <div className={`${styles.noise} ${motion.noise}`} aria-hidden="true" />
      {kind === 'error' && <CriticalErrorStage />}
      {kind === 'critical' && <PatchNotesStage />}
      {kind === 'patchNotes' && <SystemFailureStage version={version} />}
      <div className={`${styles.finalFlash} ${motion.finalFlash}`} aria-hidden="true" />
    </section>
  );
}

function CriticalErrorStage() {
  return (
    <section className={`${stage.critical} ${motion.errorStage}`}>
      <div className={stage.brokenHud} aria-hidden="true">
        <span><i /></span>
        <b>99 // ERROR // 01</b>
        <span><i /></span>
      </div>
      <header className={`${stage.criticalTitle} ${motion.errorTitle}`}>
        <span>Q + E // SUPER_01</span>
        <h2>CRITICAL<br />ERROR</h2>
        <i>Working as intended.</i>
      </header>
      <div className={`${stage.realitySlices} ${motion.opponent}`} aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <i
            key={index}
            style={{
              '--slice-right': `${(index % 3) * 4}%`,
              '--slice-shift': `${(index % 2) * 2.2 - 1.1}cqw`,
              '--slice-top': `${index * 7.4}%`,
              '--slice-width': `${62 + (index % 4) * 8}%`,
            } as CSSProperties}
          />
        ))}
        <strong>GLITCH attacks between frames</strong>
      </div>
      <div className={stage.errorLog}>
        <b>WORLD_RENDERER.EXE</b>
        <span>Containment: FAILED</span>
        <span>Hit confirmation: 100%</span>
        <code>Not a bug. Feature.</code>
      </div>
    </section>
  );
}

function PatchNotesStage() {
  return (
    <section className={stage.patchNotes}>
      <div className={stage.warningFlood} aria-hidden="true">
        {UPDATE_MESSAGES.map((message, index) => (
          <article
            key={message}
            style={{
              '--window-delay': `${index * 0.22 + 0.32}s`,
              '--window-left': `${2 + (index % 2) * 68}%`,
              '--window-top': `${7 + index * 17}%`,
            } as CSSProperties}
          >
            <b>⚠ UPDATE REQUIRED</b>
            <span>{message}</span>
            <i />
          </article>
        ))}
      </div>
      <div className={stage.updateWindow}>
        <header>
          <span><i /><i /><i /></span>
          <b>GLITCH_OS // PATCH NOTES</b>
          <small>×</small>
        </header>
        <main>
          <em>Q + R // SUPER_02</em>
          <h2>VERSION<br />MISMATCH</h2>
          <p>Opponent build is incompatible with this reality.</p>
          <div className={stage.updateBar}><i /></div>
          <strong>INSTALLING CHAOS... 99%</strong>
        </main>
      </div>
      <div className={stage.patchToast}>
        <b>PATCH DEPLOYED</b>
        <span>Opponent overwhelmed successfully.</span>
      </div>
    </section>
  );
}

function SystemFailureStage({ version }: { readonly version: number }) {
  const finalLines = ['FATAL EXCEPTION', 'KERNEL PANIC', 'SYSTEM FAILURE'] as const;
  return (
    <section className={system.systemFailure}>
      <div className={system.blackout}>
        <span>NO SIGNAL</span>
      </div>
      <div className={system.crashDialog}>
        <header>FIGHTER PROCESS</header>
        <main>
          <i>×</i>
          <div>
            <h2>Opponent.exe stopped responding.</h2>
            <p>The program has crossed an invalid reality boundary.</p>
          </div>
        </main>
        <footer><button type="button">WAIT</button><button type="button">END PROCESS</button></footer>
      </div>
      <div className={system.failureRows}>
        {FAILURE_ROWS.map((row) => <code key={row}>{row}</code>)}
      </div>
      <div className={system.voidRift} aria-hidden="true">
        <div className={system.voidGlitch}>
          <i /><i /><i /><i /><i />
        </div>
        <b>GLITCH</b>
      </div>
      <div className={system.failureFinal}>
        <small>Q + F // ULTIMATE</small>
        <strong>{finalLines[version % finalLines.length]}</strong>
      </div>
    </section>
  );
}
