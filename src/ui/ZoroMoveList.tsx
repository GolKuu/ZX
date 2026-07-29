'use client';

import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import {
  ZORO_ACTIONS,
  type ZoroActionId,
} from '@/src/stage/zoro/zoroActions';
import styles from './ZoroMoveList.module.css';

export function ZoroMoveList() {
  const activeAction = useRenderStore((state) => state.zoroAction);
  const stance = useRenderStore((state) => state.zoroStance);

  const play = (action: ZoroActionId): void => {
    const render = useRenderStore.getState();
    render.playZoroAction(action);
    render.triggerImpact();
    if (action !== 'swordStyles') {
      useHudStore.getState().registerPreviewHit();
    }
  };

  return (
    <section className={styles.panel} aria-label="Анимации Ророноа Зоро">
      <header>
        <div>
          <strong>Ророноа Зоро</strong>
          <span>Анимации приёмов</span>
        </div>
        <p>
          Стойка: <b>{stance === 'three' ? 'три меча' : 'один меч'}</b>
        </p>
      </header>
      <div className={styles.grid}>
        {ZORO_ACTIONS.map((action) => (
          <button
            key={action.id}
            className={action.id === activeAction ? styles.active : ''}
            data-kind={action.kind}
            type="button"
            onClick={() => play(action.id)}
          >
            <kbd>{action.hotkey}</kbd>
            <span>
              <b>{action.name}</b>
              <small>{action.input}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
