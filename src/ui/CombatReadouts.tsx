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
  const level = meterSegments(fighter.superCharge, 3);
  return (
    <aside className={styles.energy} data-side={fighter.side}>
      <strong>{level}</strong>
      <div>
        <span><i style={{ width: `${fighter.superCharge}%` }} /></span>
        <b>Energy</b>
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
