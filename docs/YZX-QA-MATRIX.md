# YZX — QA Matrix

Обозначения: `PASS` — автоматизировано или проверено по коду; `MANUAL` — нужна браузерная проверка; `OPEN` — известный пробел.

| Область | Проверка | Статус |
|---|---|---|
| Build | lint, TypeScript, production build, bundle budget | PASS |
| Combat | fixed 60 Hz, hit/block stun, guard, dash, KO, best-of-three rounds | PASS |
| Combat | roster-authored AI loadouts, including MIM runtime data | PASS |
| Combat | deterministic combo damage scaling with a 55% floor | PASS |
| Input | P1 WASD + J/K/I/L, facing-relative motions | PASS |
| Input | P2 arrows + Num 1/2/4/5 | PASS |
| Pause | simulation and Canvas rendering advance only on `screen === fight` | PASS |
| Pause | held/buffered input clears on every screen transition | PASS |
| Flow | fighter → arena → explicit ready → fight | PASS |
| Encoding | UTF-8/mojibake source gate | PASS |
| Training | real combat logic, infinite timer, idle dummy, reset | PASS |
| Tutorial | first playable movement lesson with failure feedback/reset | PASS |
| Story | playable prologue entry and chapter map | PASS |
| Progression | five fighters × three PvE-only branches | PASS |
| Three.js | DPR cap, sRGB, ACES, current PCF shadow type | PASS |
| Three.js | upstream R3F use of deprecated `THREE.Clock` | OPEN |
| Localization | complete RU and EN key coverage | OPEN |
| Training | guard/reversal settings and live hitbox viewer UI | OPEN |
| Tutorial | lessons 2–12 playable success detectors | OPEN |
| Visual | 720p/1080p/1440p/4K screenshots and console | MANUAL |

Последний автоматизированный прогон: ESLint и TypeScript без ошибок, 214 combat-тестов и 3 utility-теста пройдены, production build и bundle budget пройдены (705.1 KB gzip суммарного route + lazy JavaScript).

Последняя ручная визуальная проверка должна охватить обе стороны, все арены, паузу, экран управления, Local Versus readiness и мобильную ширину.
