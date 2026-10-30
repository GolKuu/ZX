import { SUPER_METER_STOCKS } from '@/src/hud/superMeter';
import { TITAN_MOVE_IDS } from '@/src/data/titan/ids';
import { titanSuperCostForMove } from '@/src/data/titan/supers';
import type { HudSnapshot } from '@/src/hud/types';
import { meterSegments } from './meterSegments';
import styles from './CombatReadouts.module.css';

export function CombatReadouts({ snapshot }: {
  readonly snapshot: HudSnapshot;
}) {
  return (
    <>
      <ComboCounter snapshot={snapshot} />
      {snapshot.fighters.map((fighter) => (
        <EnergyMeter fighter={fighter} key={fighter.id} />
      ))}
    </>
  );
}

function EnergyMeter({ fighter }: {
  readonly fighter: HudSnapshot['fighters'][number];
}) {
  const charge = Math.max(0, Math.min(100, fighter.superCharge));
  const level = meterSegments(charge, SUPER_METER_STOCKS);
  const titan = fighter.displayName === 'TITAN';
  const minimumCost = titan
    ? (titanSuperCostForMove(TITAN_MOVE_IDS.continentalSlam) ?? 100)
    : Math.ceil(100 / SUPER_METER_STOCKS);
  const ready = charge >= minimumCost;
  return (
    <aside
      className={styles.energy}
      data-side={fighter.side}
      data-ultimate={fighter.ultimateReady}
      data-ready={ready}
      aria-label={`${fighter.playerTag} energy ${Math.round(charge)} percent, ${level} super stocks${fighter.ultimateReady ? ', ultimate ready' : ''}`}
    >
      <strong>{level}</strong>
      <div>
        <div className={styles.energyLabel}><b>SUPER DRIVE</b><em>{Math.round(charge)}%</em></div>
        <span className={styles.segments} role="meter" aria-label="Super energy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={charge}>
          {Array.from({ length: SUPER_METER_STOCKS }, (_, index) => <span key={index} data-full={level > index}><i style={{ width: `${Math.max(0, Math.min(100, charge * SUPER_METER_STOCKS - index * 100))}%` }} /></span>)}
        </span>
        <b className={styles.readyLabel}>{fighter.ultimateReady ? 'ULTIMATE ARMED' : ready ? (titan ? 'SUPER READY / FULL DRIVE' : `SUPER READY / LV ${level}`) : titan ? 'SUPER REQUIRES FULL DRIVE' : 'BUILD ENERGY / ATTACK + DEFEND'}</b>
      </div>
    </aside>
  );
}

function ComboCounter({ snapshot }: { readonly snapshot: HudSnapshot }) {
  const combo = snapshot.combo;
  if (combo === null || combo.hits < 2) return null;
  const attacker = snapshot.fighters.find(({ id }) => id === combo.attackerId);
  return (
    <aside
      aria-live="polite"
      className={styles.combo}
      data-side={attacker?.side ?? 'right'}
    >
      <div><strong>{combo.hits}</strong><span>Hits</span></div>
      <p>{combo.damage} <b>Dmg</b></p>
    </aside>
  );
}
