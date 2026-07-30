import type { CSSProperties } from 'react';
import type { ChronoSuperKind } from '@/src/data/chrono-super-moves';
import base from './ChronoCinematicScene.module.css';
import fx from './ChronoCinematicFx.module.css';

const CLOCK_TICKS = Array.from({ length: 12 }, (_, index) => index);
const CLOCK_FIELD = Array.from({ length: 18 }, (_, index) => index);
const PARALLEL_CHRONOS = Array.from({ length: 7 }, (_, index) => index);
const TIMELINE_CLOCKS = Array.from({ length: 48 }, (_, index) => index);
const IMPACTS = Array.from({ length: 6 }, (_, index) => index);

export function ChronoCinematicScene({
  kind,
  side,
}: {
  readonly kind: ChronoSuperKind;
  readonly side: 'p1' | 'p2';
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} CHRONO: ${titleFor(kind)}`}
      aria-live="assertive"
      className={base.scene}
      data-kind={kind}
      data-side={side}
      role="status"
    >
      <header className={base.header}>
        <span>{kind === 'rewind' ? 'Super 1' : kind === 'outcomes' ? 'Super 2' : 'Ultimate'}</span>
        <strong>{titleFor(kind)}</strong>
        <i>CHRONO // THE EXPECTED RESULT</i>
      </header>
      <Clock />
      {kind === 'rewind' && <Rewind />}
      {kind === 'outcomes' && <Outcomes />}
      {kind === 'inevitability' && <Inevitability />}
      <div className={base.flash} aria-hidden="true" />
      <footer className={base.footer}>
        <span>ΔT</span>
        {footerFor(kind)}
      </footer>
    </section>
  );
}

function Clock() {
  return (
    <div className={base.clock} aria-hidden="true">
      {CLOCK_TICKS.map((tick) => (
        <i key={tick} style={{ transform: `rotate(${tick * 30}deg)` }} />
      ))}
      <span className={base.hour} />
      <span className={base.minute} />
      <span className={base.second} />
      <b />
    </div>
  );
}

function Rewind() {
  return (
    <div className={fx.rewind} aria-hidden="true">
      <div className={fx.freezeCode}>00:00:00:00 <span>TIME COLLAPSED</span></div>
      <div className={fx.clockField}>
        {CLOCK_FIELD.map((clock) => (
          <i key={clock} style={indexedStyle(clock)}><b /></i>
        ))}
      </div>
      <div className={fx.chronoMark}>C</div>
      <div className={fx.targetMark}>×</div>
      <div className={fx.echoes}>
        {IMPACTS.map((impact) => <i key={impact} />)}
      </div>
      <div className={fx.impacts}>
        {IMPACTS.map((impact) => <i key={impact}>×</i>)}
      </div>
      <blockquote className={fx.clockVerdict}>
        <span>We can go back.</span>
        <strong>Time's up.</strong>
      </blockquote>
    </div>
  );
}

function Outcomes() {
  return (
    <div className={fx.outcomes} aria-hidden="true">
      <div className={fx.parallelCount}><strong>100%</strong><span>CONSENSUS</span></div>
      <div className={fx.parallelChronos}>
        {PARALLEL_CHRONOS.map((variant) => (
          <i key={variant} style={indexedStyle(variant)}>
            <b />
            <span />
            <em />
          </i>
        ))}
      </div>
      <div className={fx.convergence} />
      <blockquote className={fx.parallelVerdict}>
        <span>All outcomes agree.</span>
        <strong>We already won.</strong>
        <em>Probability: 100%.</em>
      </blockquote>
    </div>
  );
}

function Inevitability() {
  return (
    <div className={fx.inevitability} aria-hidden="true">
      <div className={fx.timelineDust}>
        {TIMELINE_CLOCKS.map((clock) => (
          <i key={clock} style={indexedStyle(clock)} />
        ))}
      </div>
      <div className={fx.realities}><i /><i /><i /><i /></div>
      <div className={fx.infinity}>1,000+<span>FUTURES EXAMINED</span></div>
      <div className={fx.chronoWalk}><i /><b /><span /><em /></div>
      <blockquote>
        <span>I examined every possible future.</span>
        <strong>None of them end with your victory.</strong>
      </blockquote>
      <div className={fx.snap}><i /><b>REALITY FRACTURE</b></div>
      <div className={fx.finalStrike} />
      <div className={fx.finalResult}>
        <strong>The expected result.</strong>
        <span>There was never another ending.</span>
      </div>
    </div>
  );
}

function titleFor(kind: ChronoSuperKind): string {
  if (kind === 'rewind') return 'CLOCK COLLAPSE';
  if (kind === 'outcomes') return 'PARALLEL EXECUTION';
  return 'ABSOLUTE TIMELINE';
}

function footerFor(kind: ChronoSuperKind): string {
  if (kind === 'rewind') return 'ALL CLOCKS // ZERO';
  if (kind === 'outcomes') return 'ALL OUTCOMES // AGREE';
  return 'NO ALTERNATE ENDING';
}

function indexedStyle(index: number): CSSProperties {
  return { '--index': index } as CSSProperties;
}
