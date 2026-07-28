const rows = [
  { action: 'Движение', player1: 'A / D', player2: '← / →' },
  { action: 'Прыжок', player1: 'H', player2: '↑' },
  { action: 'Лёгкая / тяжёлая', player1: 'J / K', player2: 'Num 1 / 2' },
  { action: 'Спецатака', player1: 'L', player2: 'Num 3' },
  { action: 'Защита', player1: ';', player2: 'Num 0' },
  { action: 'Пауза', player1: 'Esc', player2: 'Esc' },
];

export function ControlGuide() {
  return (
    <div className="control-table" role="table" aria-label="Упрощённое управление">
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
