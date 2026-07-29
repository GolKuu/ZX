'use client';

import {
  AANG_ELEMENTS,
  AANG_ELEMENT_INFO,
  type CombatFighterId,
} from '@/src/aang/combat/elements';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import styles from './AangElementHud.module.css';

export function AangElementHud() {
  const screen = useHudStore((state) => state.screen);
  const selection = useHudStore((state) => state.fighterSelection);
  if (screen !== 'fight') return null;
  return (
    <>
      {selection[0] === 'aang' && <ElementPanel fighterId="p1" />}
      {selection[1] === 'aang' && <ElementPanel fighterId="p2" />}
    </>
  );
}

function ElementPanel({ fighterId }: { readonly fighterId: CombatFighterId }) {
  const active = useRenderStore((state) => state.aangElements[fighterId]);
  const isPlayerOne = fighterId === 'p1';
  return (
    <aside
      className={`${styles.panel} ${isPlayerOne ? styles.left : styles.right}`}
      aria-label={`${isPlayerOne ? 'P1' : 'P2'} — выбор стихии`}
    >
      <header>
        <span>Мудрец стихий · {isPlayerOne ? 'P1' : 'P2'}</span>
        <strong style={{ color: AANG_ELEMENT_INFO[active].color }}>
          {AANG_ELEMENT_INFO[active].label}
        </strong>
      </header>
      <div className={styles.elements}>
        {AANG_ELEMENTS.map((element) => (
          <span
            key={element}
            data-active={active === element}
            style={{ '--element-color': AANG_ELEMENT_INFO[element].color } as React.CSSProperties}
          >
            <i />
            {AANG_ELEMENT_INFO[element].label}
          </span>
        ))}
      </div>
      <p>
        <b>{isPlayerOne ? 'J' : 'Num1'}</b> LP ·{' '}
        <b>{isPlayerOne ? 'K' : 'Num2'}</b> HP · ↓↓ + J/K/L/U меняет стихию
      </p>
    </aside>
  );
}
