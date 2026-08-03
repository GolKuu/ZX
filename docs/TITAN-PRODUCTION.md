# Titan — production matrix

## Comparison with Mim

| Area | Mim baseline | Titan implementation |
|---|---:|---:|
| Authored combat moves | 4 normals plus specials/supers | 35 moves across normals, grapples, specials, enhanced routes and cinematics |
| Body profiles | head, torso, legs; low/air profiles | heavyweight head, wide torso, legs; crouch/air profiles |
| Core mechanic | walls, feints and mobility | 10 typed grapples, limited armour, guard damage and guard break |
| Idle | hand-authored loop | 18-frame breath, fist tension and reactor pulse |
| Defence | standing/crouching guard family | 17 named block/impact/escape/armour states |
| Cinematics | two supers and ultimate | Continental Slam, Siege Engine and hit-confirmed World Anchor |
| AI | deterministic loadout | range-aware strike/throw mix with documented difficulty intent |
| Regression | character and sprite suites | frame, command, armour, grapple and roster contract tests |

## Full moveset

Titan's complete runtime moveset now applies a **15% damage increase** after
authored move values are loaded; frame timing, armour and recovery are unchanged.

| Group | Moves |
|---|---|
| Standing | Piston Hammer, Bulkhead Backfist, Seismic Stomp, Siege Ram |
| Crouching | Crouch Light, Crouch Medium, Crouch Heavy, Sweep |
| Air / utility | Air Light, Air Medium, Air Heavy, Launcher, Anti-Air |
| Grapples | Normal Throw, Command Grab, Anti-Air Grab, Air Throw, Wall Throw, Ground Slam, Armoured Grab, Carry, Corner Reposition, Throw Escape |
| Specials | Dual Technique, Armour Charge, Reactor Breaker |
| Enhanced | Enhanced Ground Slam, Armour Charge and Command Grab |
| Supers | Continental Slam, Siege Engine |
| Ultimate | World Anchor |

## Grapple table

| Grab | Startup | Active | Recovery | Pair role |
|---|---:|---:|---:|---|
| Normal Throw | 8 | 3 | 24 | normal |
| Command Grab | 11 | 3 | 30 | command → slam |
| Anti-Air Grab | 9 | 3 | 27 | airborne |
| Air Throw | 7 | 3 | 23 | air |
| Wall Throw | 13 | 3 | 31 | wall splat |
| Ground Slam | 5 | 3 | 27 | ground impact |
| Armoured Grab | 18 | 3 | 35 | two armour hits |
| Carry | 15 | 3 | 34 | forward carry |
| Corner Reposition | 10 | 3 | 28 | side reposition |
| Throw Escape | 3 | 2 | 16 | release |

Every grab owns separate frame data and a paired presentation duration. A failed
grab has a dedicated 34-frame miss recovery. Grabs are unblockable, wall
piercing and explicitly defeat strike armour.

## Blocks and armour

Titan ships standing and crouching start/hold/light impact/heavy impact/release,
chip reaction, guard crush, guard break, throw escape, perfect block, armour
block and block-stun recovery presentation states. Armour is authored only on
selected startup/active frames, has a finite hit count, keeps incoming damage
and leaves at least 20 recovery frames. Throws and guard-break attacks are the
counterplay.

## Size and regression verification

The collision model uses three independent heavyweight hurtboxes plus crouching
and airborne profiles. Grapple tests run against the generic collision engine,
so small, normal and wide opponents use the same deterministic grab box without
renderer teleportation. `tests/titan-character.test.mjs` verifies exact normals,
body contract, unique grabs, miss recovery, armour limits, armour-breaking
throws and hit-confirmed cinematics. The complete existing suite verifies Mim
and every other fighter remains unchanged.

## Independent visual critique

Final internal score: **89/100** after the secondary-detail pass.

- Design and mass: 9/10
- Procedural graphic detail: 9/10
- Idle and movement: 9/10
- Normal uniqueness: 9/10
- Blocks: 8/10
- Grapples: 18/20
- Armour: 9/10
- Supers and Ultimate: 4/5
- Synchronization and stability: 10/10
- Mim parity/regression: 4/5

Remaining art-direction gap: the procedural metal now has hydraulics, vents,
edge metal, plate scratches and reactor-driven secondary motion. Bespoke
texture-painted deformation is still out of scope because the project forbids
heavy external binary assets.

## Commands

- Development: `npm run dev`
- Tests: `npm test`
- Production build: `npm run build`
