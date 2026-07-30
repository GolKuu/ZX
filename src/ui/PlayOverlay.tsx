'use client';

import { CombatHud } from './CombatHud';
import { useRenderStore } from '@/src/store/renderStore';
import { FightControlStrip } from './FightControlStrip';
import { FpsMeter } from './FpsMeter';
import { XrayCinematic } from './XrayCinematic';
import { MimSuperCinematic } from './MimSuperCinematic';
import { EchoSuperCinematic } from './EchoSuperCinematic';
import { IdolCinematicLayer } from './idol-cinematics/IdolCinematicLayer';
import { ChronoSuperCinematic } from './ChronoSuperCinematic';
import styles from './PlayOverlay.module.css';

export function PlayOverlay() {
  return (
    <div className={styles.overlay}>
      <XrayCinematic />
      <MimSuperCinematic />
      <EchoSuperCinematic />
      <IdolCinematicLayer />
      <ChronoSuperCinematic />
      <CombatHud />
      <FightControlStrip />
      {process.env.NODE_ENV !== 'production' && <DevelopmentTools />}
    </div>
  );
}

function DevelopmentTools() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  const preview = useRenderStore((state) => state.triggerMimSuper);
  const previewEcho = useRenderStore((state) => state.triggerEchoSuper);
  const previewIdol = useRenderStore((state) => state.triggerIdolSuper);
  const previewChrono = useRenderStore((state) => state.triggerChronoSuper);
  return (
    <aside className={styles.devTools} aria-label="Development tools">
      <span className={styles.fps}><FpsMeter /></span>
      <button type="button" onClick={() => preview('p1', 'prank')}>MIM L1</button>
      <button type="button" onClick={() => preview('p1', 'hero')}>MIM L3</button>
      <button type="button" onClick={() => preview('p1', 'altF4')}>ALT+F4</button>
      <button type="button" onClick={() => previewEcho('p1', 'analysis')}>ECHO L1</button>
      <button type="button" onClick={() => previewEcho('p1', 'repeat')}>ECHO L3</button>
      <button type="button" onClick={() => previewEcho('p1', 'statistics')}>ECHO FIN</button>
      <button type="button" onClick={() => previewIdol('p1', 'idol.super.highlight')}>IDOL L1</button>
      <button type="button" onClick={() => previewIdol('p1', 'idol.super.million')}>IDOL L3</button>
      <button type="button" onClick={() => previewIdol('p1', 'idol.ultimate.cancel')}>IDOL FIN</button>
      <button type="button" onClick={() => previewChrono('p1', 'rewind')}>CHRONO L1</button>
      <button type="button" onClick={() => previewChrono('p1', 'outcomes')}>CHRONO L3</button>
      <button type="button" onClick={() => previewChrono('p1', 'inevitability')}>CHRONO FIN</button>
      <button
        aria-pressed={effectsEnabled}
        type="button"
        onClick={toggleEffects}
      >
        FX {effectsEnabled ? 'on' : 'off'}
      </button>
    </aside>
  );
}
