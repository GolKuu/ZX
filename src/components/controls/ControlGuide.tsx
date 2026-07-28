const rows = [
  { action: 'Движение', player1: 'A / D', player2: '← / →' },
  { action: 'Прыжок / приседание', player1: 'H / S', player2: '↑ / ↓' },
  { action: 'Лёгкая / тяжёлая', player1: 'J / K', player2: 'Num 1 / 2' },
  { action: 'Спецатака / блок', player1: 'L / ;', player2: 'Num 3 / 0' },
  { action: 'Захват / супер', player1: 'U / I', player2: 'Num Enter / +' },
  { action: 'Пауза', player1: 'Esc', player2: 'Esc' },
];

export function ControlGuide() {
  return (
    <div className="control-table" role="table" aria-label="Управление игроками">
      <div className="control-table__row control-table__head" role="row">
        <span>Действие</span>
        <span>Игрок 1</span>
        <span>Игрок 2</span>
      </div>
      {rows.map((row) => (
        <div className="control-table__row" role="row" key={row.action}>
          <strong>{row.action}</strong>
          <kbd>{row.player1}</kbd>
          <kbd>{row.player2}</kbd>
        </div>
      ))}
    </div>
  );
}
