# Glitch — production report

## Результат

Glitch интегрирован как mobile rushdown / air-combo teleporter. Боец имеет 850 HP,
38 авторских действий, 18 защитных состояний, процедурный 18-кадровый idle,
ограниченные Spatial Shift-маршруты, четыре EX-варианта, два Super и
hit-confirmed Ultimate.

## Mim vs Glitch

| Метрика | Mim | Glitch |
|---|---:|---:|
| Боевые действия | 27 | 38 |
| Авторские hit-события | 27 | 42 |
| Действия с hurtbox timeline | 16 | 28 |
| Действия с cancel windows | 12 | 17 |
| Защитные состояния | базовый runtime-набор | 18 именованных runtime-состояний |
| Главная механика | стены, counter и trick routes | Spatial Shift, air routing, Reality Collapse |
| Supers + Ultimate | 2 + 1 | 2 + 1 hit-confirmed sequence |
| AI | difficulty profiles | Easy / Normal / Hard / Story |
| Защита от infinites | общие hitstun/physics rules | juggle limit 6, decay 3f, repeat damage 72% |
| Автотесты персонажа | regression suite | 25 Glitch tests + общий regression suite |

Glitch превосходит Mim по числу действий, hit timelines, hurt timelines и
вариативности перемещения. Mim сохраняет более детализированные отдельные
contact panels; Glitch компенсирует это семантическими procedural poses,
энергетическим шарфом и VFX, которые не закрывают контакт.

## Полный moveset

Формат кадров: startup / active / recovery.

| Действие | Кадры | Уровень | Урон | Назначение |
|---|---:|---|---:|---|
| Phase Jab (J) | 5/3/8 | high | 28 | interrupt, combo starter |
| Rift Elbow (K) | 9/4/13 | mid | 48 | advancing pushback |
| Low Vector Sweep (I) | 11/4/15 | low | 54 | low-profile mix |
| Breakpoint Axe (L) | 17/5/18 | overhead | 82 | counter-hit ground bounce |
| Crouch Light | 5/3/9 | mid | 25 | crouch starter |
| Crouch Medium | 8/4/12 | low | 43 | low route |
| Crouch Heavy | 13/5/18 | mid | 72 | launcher |
| Air Light | 5/4/8 | high | 27 | air starter |
| Air Medium | 8/5/12 | mid | 46 | air route |
| Air Heavy | 13/5/18 | overhead | 74 | spike |
| Aerial Launcher | 10/4/14 | mid | 52 | juggle extension |
| Air Finisher | 15/5/24 | mid | 88 | forced route end |
| Air Throw | 7/3/24 | throw | 68 | airborne grapple |
| Launcher | 9/4/16 | mid | 55 | ground-to-air route |
| Sweep | 12/4/20 | low | 61 | knockdown |
| Anti-Air | 7/5/23 | mid | 63 | upper invulnerability |
| Normal Throw | 6/3/22 | throw | 72 | grounded grapple, side switch |
| Throw Escape | 0/8/14 | defense | 0 | back+J+K, grapple-only tech |
| Throw Escape Release | 0/1/13 | defense | 0 | visible tech recovery |
| Dual Phase Break | 8/5/14 | mid | 51 | teleport route |
| Dual Vector Cross | 12/6/17 | high+low | 66 | two-level sequence |
| Spatial Dash | 4/8/9 | movement | 0 | short spatial approach |
| Shift Forward | 7/5/13 | movement | 0 | bounded teleport forward |
| Shift Backward | 6/4/12 | movement | 0 | bounded teleport retreat |
| Air Shift | 6/4/15 | movement | 0 | one air teleport route |
| Spatial Double Jump | 3/5/10 | movement | 0 | one extra air rise |
| Rift Uppercut | 8/6/25 | mid | 76 | DP anti-air |
| Phase Break | 14/5/20 | overhead | 84 | overhead special |
| Reality Slice | 18/7/24 | mid | 73 | ranged space wave |
| Teleport Strike | 10/4/19 | mid | 66 | cross-up approach |
| EX Rift Uppercut | 6/7/21 | mid | 96 | enhanced DP |
| EX Phase Break | 11/6/17 | overhead | 104 | enhanced overhead |
| EX Reality Slice | 14/10/20 | mid | 94 | enhanced wave |
| EX Teleport Strike | 8/5/16 | mid | 89 | enhanced cross-up |
| Rift Sequence | 11/58/24 | mid | 202 | multi-point Super |
| Reality Collapse | 16/36/32 | mid+overhead | 178 | 360f mobility/cancel status |
| Fourth God starter | 13/5/21 | mid | 36 | confirm gate |
| Fourth God sequence | 16/106/68 | mid | 562 | confirmed cinematic Ultimate |

Каждое атакующее действие содержит startup/impact sound, VFX definition,
hitstop, knockback и camera intent. Телепорты имеют startup tell, только 2–3
кадра пустого hurtbox, recovery 12–19 кадров и cooldown 42+ кадров.

## Защита

| Группа | Реализованные состояния | Игровое правило |
|---|---|---|
| Stand block | start, hold, light impact, heavy impact, release | разлом перед руками |
| Crouch block | start, hold, light impact, heavy impact, release | наклонный разлом у ног |
| Air block | отдельная воздушная pose-ветка | сохраняет читаемый силуэт |
| Cross-up | block turn | смена направления штатным facing |
| Damage through guard | chip reaction | отдельный короткий feedback |
| Guard failure | guard crush, guard break | разлом разрушается, 36f stun |
| Throw defense | throw escape, release | реальный 8f grapple-only tech |
| Precision defense | perfect block | первые 3f guard, hitstun уменьшается на 4f |
| Recovery | block-stun recovery | отдельная transition pose |

Perfect Block не гарантирует punish: он только сокращает blockstun. Throw Escape
не отражает strikes и имеет 14f whiff recovery.

## Matchup tests

Авторитетная симуляция подтверждает, что J/K/I/L попадают:

| Соперник | Результат |
|---|---|
| Mim | 4/4 PASS |
| Lucky | 4/4 PASS |
| Titan | 4/4 PASS |
| Vorgh | 4/4 PASS |
| Glitch, зеркально в обе стороны | 8/8 PASS |

Отдельно проверены реальный Perfect Block, grapple-only Throw Escape,
counter-hit-only Breakpoint Axe bounce, teleport mirroring/cooldown и
air-combo forced drop.

## Регрессия и качество

- `npm run build`: PASS.
- ESLint и TypeScript: PASS.
- Combat tests: 186/186 PASS.
- Glitch targeted tests: 25/25 PASS.
- Keep-awake utility tests: 3/3 PASS.
- Asset budget: 125 файлов, 4792.9 KB, PASS.
- Sprite quality: 67 padded 2x textures, PASS.
- Next.js production build и bundle budget: PASS.
- `/play` production route собран как static page.

In-app Browser не был доступен в текущей сессии (нет подключённого browser
runtime), поэтому проверка матча выполнена через авторитетный deterministic
CombatEngine, debug hitboxes и двустороннее зеркалирование.

## Независимый критик

Промежуточная оценка была 87/100 и REJECTED только из-за недостижимого Throw
Escape. После критики добавлены настоящий grapple-only tech, отдельный release,
real grapple metadata для ground/air throw и counter-hit-only bounce.

Историческая независимая оценка: **92/100**. После введения общего минимального
порога 97/100 результат имеет статус **REJECTED до повторной доработки и оценки**.

| Категория | Балл |
|---|---:|
| Дизайн и силуэт | 9/10 |
| Пиксельная графика | 9/10 |
| Idle и movement | 9/10 |
| Уникальность четырёх normals | 10/10 |
| Блоки и защита | 9/10 |
| Spatial Shift | 13/15 |
| Воздушная система | 8/10 |
| Specials, Supers и Ultimate | 9/10 |
| Hitbox и баланс | 5/5 |
| VFX, звук и стабильность | 5/5 |
| Соответствие Mim | 5/5 |

## Изменённые файлы

Glitch-only:

- `src/data/glitch/*`
- `src/data/glitch-ai.ts`
- `src/data/glitch-combat-moves.ts`
- `src/data/glitch-super-moves.ts`
- `src/input/glitchCommands.ts`
- `src/stage/glitch/*`
- `src/audio/GlitchSoundController.ts`
- `tests/glitch-combat.test.mjs`
- `docs/GLITCH-PRODUCTION.md`

Минимальные обратно совместимые общие расширения:

- `src/sim/frame-data.ts`, `state.ts`, `copy.ts`
- `src/sim/engine-input.ts`, `combat-engine.ts`, `physics.ts`, `resolve.ts`
- `src/sim/move-validation.ts`
- `src/game/combatSetup.ts`, `CombatSession.ts`, `XrayController.ts`
- `src/data/meter-moves.ts`
- `src/stage/sprite2d/Sprite2DFighter.tsx`, `spritePose.ts`
- `src/stage/RenderScene.tsx` — удалён только устаревший unused import
- `tsconfig.sim-tests.json`

Ни один Mim move, sprite, animation или balance parameter ради Glitch не
изменялся.

## Команды

```powershell
npm run dev
npx tsc -p tsconfig.sim-tests.json
node --test tests/glitch-combat.test.mjs
npm run build
```
