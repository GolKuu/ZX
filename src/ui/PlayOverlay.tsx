'use client';

import { CombatHud } from './CombatHud';
import { useRenderStore } from '@/src/store/renderStore';
import { useHudStore } from '@/src/store/hudStore';
import { FightControlStrip } from './FightControlStrip';
import { FpsMeter } from './FpsMeter';
import { XrayCinematic } from './XrayCinematic';
import { MobileControls } from './MobileControls';
import { MimSuperCinematic } from './MimSuperCinematic';
import { EchoSuperCinematic } from './EchoSuperCinematic';
import { ChronoSuperCinematic } from './ChronoSuperCinematic';
import { GlitchSuperCinematic } from './GlitchSuperCinematic';
import styles from './PlayOverlay.module.css';

export function PlayOverlay() {
  const screen = useHudStore((state) => state.screen);
  const mobileMode = useHudStore((state) => state.mobileMode);

  return (
    <div className={styles.overlay}>
      <XrayCinematic />
      <MimSuperCinematic />
      <EchoSuperCinematic />
      <ChronoSuperCinematic />
      <GlitchSuperCinematic />
      <CombatHud />
      <FightControlStrip />
      {screen === 'fight' && <MobileControls forcedVisible={mobileMode} />}
      {process.env.NODE_ENV !== 'production' && <DevelopmentTools />}
    </div>
  );
}

function DevelopmentTools() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  const preview = useRenderStore((state) => state.triggerMimSuper);
  const previewEcho = useRenderStore((state) => state.triggerEchoSuper);
  const previewChrono = useRenderStore((state) => state.triggerChronoSuper);
  const previewGlitch = useRenderStore((state) => state.triggerGlitchSuper);
  return (
    <aside className={styles.devTools} aria-label="Development tools">
      <span className={styles.fps}><FpsMeter /></span>
      <button type="button" onClick={() => preview('p1', 'prank')}>MIM · CLIP</button>
      <button type="button" onClick={() => preview('p1', 'hero')}>MIM · NET</button>
      <button type="button" onClick={() => preview('p1', 'altF4')}>MIM · SKILL</button>
      <button type="button" onClick={() => previewEcho('p1', 'analysis')}>ECHO L1</button>
      <button type="button" onClick={() => previewEcho('p1', 'repeat')}>ECHO L3</button>
      <button type="button" onClick={() => previewEcho('p1', 'statistics')}>ECHO FIN</button>
      <button type="button" onClick={() => previewChrono('p1', 'rewind')}>CHRONO L1</button>
      <button type="button" onClick={() => previewChrono('p1', 'outcomes')}>CHRONO L3</button>
      <button type="button" onClick={() => previewChrono('p1', 'inevitability')}>CHRONO FIN</button>
      <button type="button" onClick={() => previewGlitch('p1', 'error')}>GLITCH L1</button>
      <button type="button" onClick={() => previewGlitch('p1', 'critical')}>GLITCH L3</button>
      <button type="button" onClick={() => previewGlitch('p1', 'patchNotes')}>GLITCH FIN</button>
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
