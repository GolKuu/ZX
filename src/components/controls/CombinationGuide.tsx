const combinations = [
  ['Защита + лёгкая атака', 'Захват рядом, низкая защита издалека'],
  ['Защита + тяжёлая атака', 'Возврат инерции'],
  ['Защита + спецатака', 'Combo Break за один защитный сегмент'],
  ['Защита + направление назад', 'Combo Escape в отмеченное окно'],
  ['Направление + атака', 'Альтернативный приём'],
  ['Серия J / K с паузами', 'Auto Combo только в разрешённые окна приёма'],
];

export function CombinationGuide() {
  return (
    <section className="combination-guide" aria-labelledby="combination-title">
      <h2 id="combination-title">Комбинации кнопок</h2>
      <p>Комбинации используют ваши назначенные основные кнопки автоматически.</p>
      <div>
        {combinations.map(([input, result]) => (
          <article key={input}>
            <strong>{input}</strong>
            <span>{result}</span>
          </article>
        ))}
      </div>
      <aside className="rhythm-guide">
        <span>ТЕМП</span>
        <div>
          <strong>Не нажимайте атаки вслепую</strong>
          <p>
            Быстрые повторные нажатия заполняют оранжевую шкалу. Перегрузка
            блокирует атаки на 36 кадров и даёт сопернику усиленный контрудар.
            Движение, осмысленные попадания и точная защита снижают перегрузку.
          </p>
        </div>
      </aside>
    </section>
  );
}
