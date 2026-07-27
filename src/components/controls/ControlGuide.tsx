const rows = [
  { action: 'Движение', player1: 'A / D', player2: '← / →' },
  { action: 'Прыжок', player1: 'W', player2: '↑' },
  { action: 'Удар', player1: 'F', player2: 'Num 1' },
  { action: 'Блок', player1: 'G', player2: 'Num 2' },
  { action: 'Пауза', player1: 'P', player2: 'P' },
  { action: 'В меню', player1: 'Esc', player2: 'Esc' },
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
