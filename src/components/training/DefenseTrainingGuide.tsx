import { balanceConfig } from '../../game/config/balanceConfig';

const timingStates = [
  {
    tone: 'early',
    title: 'Слишком рано',
    text: 'Блок удерживался дольше точного окна: защита работает, но тратит больше шкалы.',
  },
  {
    tone: 'success',
    title: 'Успешно',
    text: 'Точный или идеальный блок попал в окно и получил отдельный эффект.',
  },
  {
    tone: 'late',
    title: 'Слишком поздно',
    text: 'Блок нажат после доступного окна либо выбрана неверная высота защиты.',
  },
] as const;

export function DefenseTrainingGuide() {
  return (
    <section className="defense-training-guide" aria-labelledby="defense-training-title">
      <div>
        <p className="eyebrow">Кадровая подсказка</p>
        <h2 id="defense-training-title">Читай защиту прямо во время боя</h2>
        <p>
          При включённых боевых подсказках арена показывает результат тайминга,
          окно Combo Escape и оставшиеся защитные сегменты каждого игрока.
        </p>
      </div>

      <div className="defense-timing-grid">
        {timingStates.map((state) => (
          <article className={`defense-timing-card defense-timing-card--${state.tone}`} key={state.title}>
            <span>{state.title}</span>
            <p>{state.text}</p>
          </article>
        ))}
      </div>

      <div className="defense-window-grid">
        <article>
          <strong>Точный блок</strong>
          <span>{balanceConfig.preciseBlockWindowFrames} кадров до попадания</span>
        </article>
        <article>
          <strong>Идеальный блок</strong>
          <span>{balanceConfig.perfectBlockWindowFrames} кадра до попадания</span>
        </article>
        <article>
          <strong>Combo Escape</strong>
          <span>узкое окно {balanceConfig.comboEscapeWindowFrames} кадра</span>
        </article>
        <article>
          <strong>Защитные сегменты</strong>
          <span>◆ × {balanceConfig.maxDefenseSegments}; Combo Break тратит один</span>
        </article>
      </div>
    </section>
  );
}
