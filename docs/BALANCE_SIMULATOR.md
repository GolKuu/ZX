# Balance Simulator

Headless-симулятор запускает настоящую `CombatSimulation` в режиме ИИ против ИИ.
Оба бойца получают один уровень сложности, матчи используют фиксированные seed,
а для каждой пары поровну меняются стороны.

## Полный прогон

```bash
npm ci
npm run balance
```

По умолчанию проверяются все 15 персонажей: 120 пар с зеркальными матчами,
500 матчей на пару, всего 60 000 матчей. Значение меньше 500 отклоняется,
если явно не передан `--allow-small-run`.

```bash
npm run balance -- \
  --matches 500 \
  --seed 3249283110 \
  --difficulty HARD \
  --output artifacts/balance
```

Для быстрой проверки:

```bash
npm run balance:smoke
```

## Артефакты

- `balance-report.json` — конфигурация, результаты пар, персонажей и нарушения целей;
- `pair-summary.csv` — win rate, длительность и метрики каждой пары;
- `character-summary.csv` — общий win rate и средние метрики персонажа;
- `replays.jsonl` — компактная запись каждого матча: seed, стороны, результат,
  checksum и статистика.

Replay воспроизводится по номеру строки:

```bash
npm run balance:replay -- artifacts/balance/replays.jsonl 1
```

Команда завершится с ошибкой, если winner или checksum отличаются.

## Метрики

- `averageDamage` — фактически снятое здоровье за матч;
- `averageComboLength` и `maxComboLength` — средняя максимальная и рекордная серия;
- `autoCombosPerMatch` — переходы на 2/3 ступень light/heavy Auto Combo;
- `blocksPerMatch`, `perfectBlocksPerMatch`;
- `comboEscapesPerMatch`, `comboBreaksPerMatch`;
- `momentumReversalsPerMatch`;
- `specialMovesPerMatch` — запуски special и super;
- `averageDurationSeconds` — только активное время боя, без countdown.

## Цели

- нейтральный матч: 48–52%;
- персонаж с преимуществом: 52–57%;
- любая пара: не хуже 60–40%;
- общий win rate персонажа: 47–53%.

Нарушения сохраняются в `violations`. Для обязательного ненулевого exit code
используйте `--fail-on-targets`. CI запускает короткий детерминированный smoke-run;
полный прогон требуется перед публичным балансным релизом.
