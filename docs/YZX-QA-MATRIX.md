# YZX — QA Matrix

Обозначения: `PASS` — автоматизировано или проверено по коду; `MANUAL` — нужна браузерная проверка; `OPEN` — известный пробел.

| Область | Проверка | Статус |
|---|---|---|
| Build | lint, TypeScript, production build, bundle budget | PASS |
| Combat | fixed 60 Hz, hit/block stun, guard, dash, KO, rounds | PASS |
| Input | P1 WASD + J/K/I/L, facing-relative motions | PASS |
| Input | P2 arrows + Num 1/2/4/5 | PASS |
| Pause | simulation advances only on `screen === fight` | PASS |
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

Последняя ручная визуальная проверка должна охватить обе стороны, все арены, паузу, экран управления, Local Versus readiness и мобильную ширину.
