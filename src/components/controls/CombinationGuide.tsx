const combinations = [
  ['Защита + лёгкая атака', 'Захват рядом, низкая защита издалека'],
  ['Защита + тяжёлая атака', 'Возврат инерции'],
  ['Защита + спецатака', 'Combo Break или суперприём'],
  ['Защита + направление назад', 'Выход из комбо'],
  ['Направление + атака', 'Альтернативный приём'],
  ['J × 4 / K × 3', 'Лёгкое / тяжёлое Auto Combo'],
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
    </section>
  );
}
