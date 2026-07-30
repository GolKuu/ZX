import type { ChronoSuperKind } from '@/src/data/chrono-super-moves';
import base from './ChronoCinematicScene.module.css';
import fx from './ChronoCinematicFx.module.css';

const CLOCK_TICKS = Array.from({ length: 12 }, (_, index) => index);
const OUTCOMES = Array.from({ length: 143 }, (_, index) => index);
const IMPACTS = Array.from({ length: 6 }, (_, index) => index);
const DEFEATS = ['KO', 'RING OUT', 'BREAK', 'TIME UP'] as const;

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
        <span>{kind === 'rewind' ? 'Level 1 Super' : kind === 'outcomes' ? 'Level 3 Super' : 'Ultimate Finisher'}</span>
        <strong>{titleFor(kind)}</strong>
        <i>CHRONO // TEMPORAL AUTHORITY</i>
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
      <div className={fx.freezeCode}>00:00:00:00 <span>TIME LOCKED</span></div>
      <div className={fx.chronoMark}>C</div>
      <div className={fx.targetMark}>×</div>
      <div className={fx.echoes}>
        {IMPACTS.map((impact) => <i key={impact} />)}
      </div>
      <div className={fx.impacts}>
        {IMPACTS.map((impact) => <i key={impact}>×</i>)}
      </div>
      <strong className={fx.damage}>DAMAGE // RELEASED</strong>
    </div>
  );
}

function Outcomes() {
  return (
    <div className={fx.outcomes} aria-hidden="true">
      <div className={fx.outcomeCount}><strong>143</strong><span>ИСХОДА</span></div>
      <div className={fx.timelineGrid}>
        {OUTCOMES.map((outcome) => (
          <i
            data-result={outcome % 4}
            data-selected={outcome === 71}
            key={outcome}
          >
            <b>{String(outcome + 1).padStart(3, '0')}</b>
            <span>{DEFEATS[outcome % DEFEATS.length]}</span>
          </i>
        ))}
      </div>
      <div className={fx.selected}>TIMELINE 071 <b>SELECTED</b></div>
    </div>
  );
}

function Inevitability() {
  return (
    <div className={fx.inevitability} aria-hidden="true">
      <div className={fx.realities}><i /><i /><i /><i /></div>
      <div className={fx.infinity}>1,000+<span>ALTERNATIVE REALITIES</span></div>
      <blockquote>«Я проверил все варианты.»</blockquote>
      <div className={fx.snap}><i /><b>SNAP</b></div>
      <div className={fx.finalStrike} />
      <div className={fx.ejected}>×<i>ARENA LIMIT</i></div>
    </div>
  );
}

function titleFor(kind: ChronoSuperKind): string {
  if (kind === 'rewind') return 'ПЕРЕМОТКА';
  if (kind === 'outcomes') return '143 ИСХОДА';
  return 'НЕИЗБЕЖНОСТЬ';
}

function footerFor(kind: ChronoSuperKind): string {
  if (kind === 'rewind') return 'DEFERRED IMPACT · SYNCHRONIZED';
  if (kind === 'outcomes') return 'ONE FUTURE REMAINS';
  return 'ALL TIMELINES COLLAPSED';
}
