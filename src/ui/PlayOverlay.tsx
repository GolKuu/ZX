'use client';

import { CombatHud } from './CombatHud';
import { useRenderStore } from '@/src/store/renderStore';
import { useHudStore } from '@/src/store/hudStore';
import { FightControlStrip } from './FightControlStrip';
import { FpsMeter } from './FpsMeter';
import { XrayCinematic } from './XrayCinematic';
import { MobileControls } from './MobileControls';
import { MobileModeToggle } from './MobileModeToggle';
import { MimSuperCinematic } from './MimSuperCinematic';
import { GlitchSuperCinematic } from './GlitchSuperCinematic';
import { LuckySuperCinematic } from './LuckySuperCinematic';
import { AaaVisualJudge } from './AaaVisualJudge';
import { GuidedModePanel } from './GuidedModePanel';
import styles from './PlayOverlay.module.css';

export function PlayOverlay() {
  const screen = useHudStore((state) => state.screen);
  const mobileMode = useHudStore((state) => state.mobileMode);

  return (
    <div className={styles.overlay}>
      <XrayCinematic />
      <MimSuperCinematic />
      <GlitchSuperCinematic />
      <LuckySuperCinematic />
      <CombatHud />
      <FightControlStrip />
      {screen === 'fight' && <GuidedModePanel />}
      {screen === 'fight' && (
        <>
          <MobileModeToggle />
          <MobileControls visible={mobileMode} />
        </>
      )}
      {process.env.NODE_ENV !== 'production' && <DevelopmentTools />}
    </div>
  );
}

function DevelopmentTools() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  const preview = useRenderStore((state) => state.triggerMimSuper);
  const previewGlitch = useRenderStore((state) => state.triggerGlitchSuper);
  const previewLucky = useRenderStore((state) => state.triggerLuckySuper);
  return (
    <>
      <aside className={styles.devTools} aria-label="Development tools">
        <span className={styles.fps}><FpsMeter /></span>
      <button type="button" onClick={() => preview('p1', 'mirrorArena')}>MIM · ARENA</button>
      <button type="button" onClick={() => preview('p1', 'falseOpening')}>MIM · BAIT</button>
      <button type="button" onClick={() => preview('p1', 'perfectBox')}>MIM · BOX</button>
      <button type="button" onClick={() => previewGlitch('p1', 'error')}>GLITCH L1</button>
      <button type="button" onClick={() => previewGlitch('p1', 'critical')}>GLITCH L3</button>
      <button type="button" onClick={() => previewGlitch('p1', 'patchNotes')}>GLITCH FIN</button>
      <button type="button" onClick={() => previewLucky('p1', 'impossibleOutcome')}>LUCKY FIN</button>
      <button
        aria-pressed={effectsEnabled}
        type="button"
        onClick={toggleEffects}
      >
        FX {effectsEnabled ? 'on' : 'off'}
      </button>
      </aside>
      <AaaVisualJudge />
    </>
  );
}
