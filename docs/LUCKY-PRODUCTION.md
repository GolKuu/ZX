# Lucky — production sheet

## Mim vs Lucky

| Категория | Mim | Lucky | Статус Lucky |
|---|---:|---:|---|
| Базовые normals | 4 | 13, включая 4 основные | выше |
| Specials | 3+ story/wall | 6 обычных + 6 enhanced | выше |
| Supers / Ultimate | 2 / 1 | 2 / 1 | равно |
| Уникальный ресурс | стены и story tools | Luck 0–100, 4 порога, Jackpot | равно/выше |
| Защитные состояния | отдельные block poses | stand/crouch, impact, release, crush/read | равно |
| Процедурный визуал | sprite rig | процедурный 2× pixel rig, 4 strike sprites, toon fallback | равно/выше |
| AI | полный профиль | neutral, punish, combo, 4 сложности движка | равно |

## Основные атаки

| Кнопка | Приём | Уровень | Startup / Active / Recovery | Урон |
|---|---|---|---:|---:|
| J | Quick Draw | high | 5 / 3 / 9 | 28 |
| K | Loaded Shoulder | mid, advancing | 10 / 4 / 14 | 56 |
| I | Sliding Bet | low, low-profile | 12 / 5 / 16 | 48 |
| L | Fortune Heel | anti-air launcher | 15 / 5 / 17 | 72 |

Дополнительно реализованы crouching light/medium/heavy, sweep,
aerial light/medium/heavy, ground throw и air throw. У каждого движения есть
отдельные hitbox frames, у Sliding Bet и crouching normals — низкий hurtbox.

## Specials и стоимость Luck

| Приём | Обычный | Enhanced | Цена |
|---|---|---|---:|
| Lucky Step | QCF+J | QCF+J+Super | 25 |
| Loaded Strike | QCF+I | QCF+I+Super | 25 |
| Probability Shift | QCB+I | QCB+I+Super | 25 |
| Risky Counter | DP+J | DP+J+Super | 25 |
| Fortune Break | QCB+L | QCB+L+Super | 50 |
| Jackpot Rush | QCF+L | QCF+L+Super | 75 |

Winning Streak стоит 34 энергии, House Advantage — 100. Impossible Outcome
требует 100 энергии и либо 75+ Luck, либо критическое HP. Cinematic damage
запускается только после подтверждённого стартового hitbox.

## Luck Meter

Luck растёт в авторитетной симуляции за подтверждённые удары Lucky: +5 за
лёгкий и +8 за сильный контакт, +4 за трёхкадровый Lucky Guard. Пороговые
состояния: 0–24, 25–49, 50–74,
75–99 и Jackpot 100. HUD всегда показывает текущее значение, подготовленный
бонус, точную доступную технику, стоимость, списание и результат. Усиление
проверяется через `minimumResource` и списывается движком через `resourceCost`
при `moveStarted`, поэтому
отмена/промах не создаёт бесплатных циклов. Скрытых бросков RNG и instant-win
нет.

## Защитная таблица

| Состояние | Симуляция | Представление |
|---|---|---|
| Stand block start/hold/release | guard + blockstun | скрещённые руки, кольцо |
| Light/heavy impact | hitstop | разный масштаб кольца и recoil |
| Crouch block | crouch + guard | низкий общий stance |
| Cross-up turn | opponent-facing helper | безопасное зеркалирование |
| Chip reaction | block chip | HUD health + impact pose |
| Guard crush/break | blockstun/hitstun | слом стойки через recoil |
| Throw escape | engine throw window | возврат в neutral |
| Lucky Guard / failed | точный guard / extra stun | золотое кольцо / recoil |

## Проверки

- Unit: уникальность четырёх normals, точные frame data, настоящие air/ground
  throws, авторитетные resource gates, multi-hit Supers, Luck gain/spend/clamp,
  одноразовый Ultimate и отсутствие instant-win normals.
- Regression: общий `npm test` включает все combat, determinism, AI, input,
  HUD и Mim suites.
- Matchups: Lucky доступен в character select и использует общий AI engine
  без чтения input. Punish windows остаются в recovery frame data.

## Управление

- Движение: `WASD`; блок: `Left Shift`.
- Атаки: `J` / `K` / `I` / `L`.
- Enhanced: удерживать `U` во время special motion.
- Super: `U`; Ultimate: `O`.
- Запуск: `npm run dev`; production build: `npm run build`.
