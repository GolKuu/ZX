# Circle Clash Ultimate — Vertical Slice

> **Agent brief.** This file is the single source of truth for building this project.
> Read it fully before writing any code. Re-read §1 before starting each new task.

A browser-based 3D anime fighting game. This repository builds a **10-day vertical slice**, not the full game.

**Goal of the slice:** prove that hitting someone feels good, that the Clash mechanic reads as a moment, and that it runs at 60 FPS in a browser.

---

## 1. THE RULES — read before every task

These are hard constraints. Violating any of them is a defect, even if the code works.

| # | Rule |
|---|---|
| **R1** | **Build only what is listed in §4.** If a feature is not in §4, it does not exist. Do not add it. Do not stub it. Do not "prepare for it." |
| **R2** | **The simulation never imports Three.js, React, or any DOM API.** `src/sim/` has zero rendering dependencies. This is checked and must stay true. |
| **R3** | **React never re-renders during a match.** No `useState` in the game loop. No Zustand hooks inside R3F components. Per-frame data flows through refs. |
| **R4** | **Simulation is authoritative; animation reads it.** Set the animation mixer time directly from `(stateId, stateFrame)`. Never let the mixer own the timeline. Never let root motion move the character. |
| **R5** | **Fixed timestep 60 Hz.** The sim ticks at exactly 1/60s with an accumulator. Rendering interpolates. Cap catch-up at 5 ticks per frame. |
| **R6** | **Frame data lives in a data table, never in code branches.** Adding a move means adding a row, not writing an `if`. |
| **R7** | **Deploy after every task.** The `main` branch must always be playable at the public URL. A broken deploy blocks all other work. |
| **R8** | **No new dependencies without checking §3.** The stack is pinned. |
| **R9** | **Do not optimize before §11 says to.** Correctness and feel first. |
| **R10** | **When blocked for more than 30 minutes, use the documented fallback** in §10 rather than inventing a new approach. |

### R1 in practice

This project has extensive design documentation describing a $50M, 32-month production with 18 characters, rollback netcode, and a full narrative. **None of that is in scope.** If you find yourself building a meter system, a second character, or netcode, stop — you have violated R1.

---

## 2. Current status

```
Phase:      Not started
Next task:  T-01 (see §9)
Deployed:   no
```

Update this block after every completed task.

---

## 3. Stack — pinned, do not change

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15**, App Router, TypeScript strict | |
| 3D | **three.js** + **@react-three/fiber** + **@react-three/drei** | |
| UI state | **zustand** | Menus and HUD only. Never gameplay |
| Hosting | **Vercel** | |
| Assets | **Mixamo** character + fight animations → Blender → single `.glb` | Placeholder only. See §7 |
| Audio | Web Audio API directly. No library | |

**Forbidden without explicit approval:** any physics engine, any ECS library, any state machine library, any netcode library, any additional post-processing library.

**TypeScript config:** `strict: true`, `noUncheckedIndexedAccess: true`. No `any`.

---

## 4. SCOPE — the complete feature list

Exactly twenty-one items. Nothing else ships.

- [ ] **F01** Fixed-timestep sim loop (60 Hz) separated from render
- [ ] **F02** One character (Kade Ruven), mirror match
- [ ] **F03** One stage: Null Circle — flat disc, ring band, gradient background
- [ ] **F04** Movement: walk, dash, backdash, jump
- [ ] **F05** Sidestep with i-frames (simple evade, no tracking system)
- [ ] **F06** Six attacks (§6)
- [ ] **F07** Hitboxes / hurtboxes from authored frame data
- [ ] **F08** Hitstop, hitstun, blockstun, pushback
- [ ] **F09** Block (auto-guard on back input, no chip damage)
- [ ] **F10** Chain combos + special cancel
- [ ] **F11** **Clash system** (the signature mechanic)
- [ ] **F12** Health, KO, best-of-3, round timer
- [ ] **F13** Toon shading + inverted-hull outline + rim light
- [ ] **F14** Hitsparks, impact flash, screen shake
- [ ] **F15** AI opponent, 3 difficulty tiers via reaction delay
- [ ] **F16** Local 2P (keyboard + gamepad, or two gamepads)
- [ ] **F17** HUD: health bars, timer, round pips, combo counter
- [ ] **F18** ~12 sound effects + 1 music loop
- [ ] **F19** Title → fight → result → rematch loop
- [ ] **F20** Deployed to Vercel, publicly playable
- [ ] **F21** Front-end screens: title, menu, difficulty, player setup, VS, pause, result, controls

### 4.1 UI specification

Screens, tokens and interaction rules are specified in [`docs/UI-CCU-700-ui-ux.md`](./docs/UI-CCU-700-ui-ux.md). Rendered mockups are in [`docs/ui-mockups.html`](./docs/ui-mockups.html) — **open it in a browser before implementing any UI.**

Binding on implementation:

- **Pad-first.** Nothing requires a mouse. One element always focused, `A` always confirms, `B` always goes back — every screen, no exceptions.
- **Three presses** from title to fighting on the Local 2P path. Skip the difficulty screen in 2P.
- Menu screens are **DOM overlays in `src/ui/`**, never inside the R3F canvas. The HUD is also DOM, over the canvas.
- Screens use `container-type: inline-size` and `cqw` units. No media queries.
- HUD reads sim state through a **throttled 15 Hz bridge**, never a per-frame React update (rule R3).
- Health bars are angled divs with `clip-path` and a width-driven fill, plus a red ghost layer that trails by 300ms. No SVG.
- The second bar is **ultimate charge**, not a meter system — the slice has no Circuit.
- System font stacks only. No webfonts.
- **Never colour alone.** P1/P2 carry colour *and* side *and* a printed tag.

Build order: title, menu, setup and HUD in **T-05**; Clash overlay in **T-06**; difficulty, VS, pause, result and controls in **T-09**. Do not build any of it before combat feels right.

---

## 5. NOT IN SCOPE — do not build these

Explicitly cut. If you think one of these is needed, you have misread the task.

| Cut | |
|---|---|
| Rollback netcode, any multiplayer, any server | Local play only |
| Fixed-point math, determinism, state snapshots | Use plain JS floats |
| Web Worker simulation | Main thread is fine |
| Circuit Gauge, Burnout, Super gauge, real supers | The Ultimate is faked — §7 |
| Break / burst, guard gauge, guard crush | |
| Tracking values, Barrier bounce, ring-out | Arena edge is a soft pushback wall |
| Throws, air combos, juggle system | Ground combat only |
| Second character, character select | Mirror match, auto-start |
| Custom post-processing chain | Bloom via drei only |
| Vertex-normal editing, smear frames, LODs | |
| Voice acting, dynamic music | |
| Training mode, replays, spectator | |
| Story, progression, settings menu | |
| Mobile, touch controls, responsive layout | Desktop only. Say so on the landing page |
| Quality tiers, adaptive performance | One quality level |

---

## 6. GAME DATA — use these exact numbers

Do not invent values. These are balanced against a documented standard.

### 6.1 Character stats (Kade Ruven)

| Stat | Value |
|---|---|
| Health | 1000 |
| Walk forward / back | 3.9 / 3.2 m/s |
| Dash | 14 frames, 4.6 m, 4f vulnerable recovery |
| Backdash | 22 frames, 3.1 m, invulnerable frames 1–6 |
| Sidestep | 18 frames, 90° rotation, invulnerable frames 4–12 |
| Jump | 40 frames total, 4f prejump, 4f landing recovery |
| Pushbox radius | 0.45 m |
| Minimum separation | 0.9 m |

### 6.2 Move table

Frames are `startup / active / recovery`. `oB` = advantage on block.

| Move | Input | Frames | oB | Damage | Properties |
|---|---|---|---|---|---|
| **5L** | L | 6 / 2 / 8 | −2 | 30 | Chains to 5M, 2L |
| **5M** | M | 9 / 3 / 14 | −4 | 55 | Chains to 5H. Special-cancellable |
| **5H** | H | 13 / 4 / 22 | −9 | 80 | Knockdown. Special-cancellable |
| **2L** | ↓+L | 5 / 2 / 9 | −3 | 26 | Low. Chains to 2M, 5L |
| **2M** | ↓+M | 8 / 3 / 15 | −5 | 50 | Low. Special-cancellable |
| **Overtake** | ↓↘→+S | 16 / 3 / 20 | −5 | 76 | Advances 3.9 m. Ends combos |

**Chain route:** `2L → 5L → 5M → 5H` and `5M or 2M or 5H → Overtake`.

### 6.3 Universal frame values

| Value | Light | Medium | Heavy | Special |
|---|---|---|---|---|
| Hitstun | 16 | 20 | 26 | 22 |
| Blockstun | 11 | 15 | 19 | 16 |
| **Hitstop (attacker / defender)** | **6 / 8** | **8 / 11** | **11 / 15** | 10 / 14 |
| Pushback on hit | 0.6 m | 0.9 m | 1.4 m | 1.8 m |
| Pushback on block | 0.8 m | 1.1 m | 1.6 m | 2.0 m |

Other constants:

| | |
|---|---|
| Input buffer | 7 frames |
| Round timer | 60 seconds |
| Rounds | Best of 3 |
| Clash freeze | 10 frames |

### 6.4 Damage scaling by hit count

| Hit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10+ |
|---|---|---|---|---|---|---|---|---|---|---|
| Multiplier | 1.00 | 0.90 | 0.80 | 0.72 | 0.64 | 0.57 | 0.50 | 0.44 | 0.38 | 0.32 |

### 6.5 Controls

| Action | Keyboard P1 | Gamepad |
|---|---|---|
| Move | WASD | Left stick / D-pad |
| Light | J | X / □ |
| Medium | K | Y / △ |
| Heavy | L | B / ○ |
| Special | I | A / ✕ |
| Sidestep | Shift | RB / R1 |
| Ultimate | U | RT / R2 |

Keyboard P2 uses arrows + numpad `1 2 3 0`. Two gamepads is the primary demo path.

---

## 7. FAKED SYSTEMS — build the fake, not the real thing

| System | What to build |
|---|---|
| **The Ultimate** | A single canned cinematic. Available once per round when the user is at ≤25% health. Fixed camera path, ~3 seconds, unblockable, deals 400 damage, ends the round. No gauge, no system — a scripted sequence. Budget: 4 hours |
| **Clash** | Both hitboxes overlap on the same frame → 10-frame freeze, desaturate scene toward blue, expanding radial ring, both characters pushed back 1.8 m, both recover at neutral. **No priority classes, no Clash Cancel.** Budget: 4 hours |
| **AI** | Read the game state N frames late (18 / 12 / 7 by difficulty), then pick from a weighted option table: approach, attack, block, whiff-punish, sidestep. Must be beatable and not embarrassing. It does not need to be good. Budget: 5 hours |
| **Character art** | Mixamo character + Mixamo fight animation pack, with our toon shader applied on top. **Placeholder only — must be replaced before any commercial use.** Budget: 6 hours |
| **Toon lighting** | Start with `MeshToonMaterial` + a custom 2-band gradient map. Only write a custom shader if there is time left. Budget: 3 hours |
| **Shadows** | One blob-shadow decal per fighter that shrinks and fades with height. No shadow maps. Budget: 30 min |
| **Impact frame** | Full-screen white quad at alpha 0.8 for exactly 1 frame. Budget: 30 min |

---

## 8. REPO STRUCTURE — create this layout

```
/
├── app/
│   ├── page.tsx                 # Landing page: what it is, controls, "desktop only"
│   ├── play/page.tsx            # Game route. Client-only, dynamic import, ssr:false
│   └── layout.tsx
├── src/
│   ├── sim/                     # ⬛ NO three.js, NO react, NO DOM (rule R2)
│   │   ├── world.ts             #   create / tick / read state
│   │   ├── fighter.ts           #   per-fighter state and state machine
│   │   ├── collision.ts         #   capsule overlap tests
│   │   ├── resolve.ts           #   hit resolution, clash detection, damage
│   │   ├── rules.ts             #   rounds, KO, timer
│   │   └── types.ts             #   InputFrame, FighterState, WorldState
│   ├── data/
│   │   ├── moves.ts             #   the move table from §6.2
│   │   ├── constants.ts         #   all values from §6.3
│   │   └── states.ts            #   state machine graph
│   ├── input/
│   │   ├── sources.ts           #   keyboard, gamepad → InputFrame
│   │   └── buffer.ts            #   7-frame buffer, motion input parsing
│   ├── ai/
│   │   └── agent.ts             #   produces InputFrame, same interface as a human
│   ├── render/
│   │   ├── toonMaterial.ts
│   │   ├── outline.ts
│   │   └── vfx.ts               #   hitsparks, flash, shake
│   ├── stage/                   # R3F components. Lifecycle only, no game logic
│   │   ├── Arena.tsx
│   │   ├── Fighter.tsx
│   │   ├── CameraRig.tsx
│   │   └── GameLoop.tsx         #   the orchestrator, useFrame priority 1
│   ├── audio/
│   │   └── audio.ts             #   Web Audio graph, voice pool
│   ├── ui/
│   │   ├── Hud.tsx
│   │   └── Screens.tsx          #   title, result
│   └── store/
│       └── ui.ts                #   zustand. Menu + HUD state ONLY
├── public/
│   ├── models/kade.glb
│   ├── textures/
│   └── audio/
└── README.md                    # this file
```

### 8.1 Key contracts

**`InputFrame`** — a small fixed struct: button bitfield (light, medium, heavy, special, sidestep, ultimate) plus quantized directional axes. Every input source produces this: keyboard, gamepad, and AI. The sim cannot tell them apart.

**Frame pipeline, executed once per rendered frame:**
```
1. sample all input sources        → InputFrame per player
2. fixed-step catch-up             → while (acc >= 1/60) sim.tick()
3. extract                         → interpolated transforms + event list
4. apply to Three.js               → transforms, animation mixer time
5. drain events                    → VFX, audio, camera shake
6. render
```

**Sim tick order** — fixed and deterministic:
```
1. input resolution (buffer, motion parse)
2. state transitions (cancel windows)
3. frame advance
4. movement integration + arena clamp
5. hit detection (attacker hitbox × defender hurtbox)
6. hit resolution → damage / block / clash
7. stun + hitstop assignment
8. round rules (KO, timeout)
9. emit events
```

---

## 9. BUILD ORDER — work through these in sequence

Each task ends with a deploy. Do not start a task before the previous one is deployed and working.

### T-01 — Skeleton and deployment `Day 1`
Next.js + TypeScript + R3F. `/play` route, client-only. Null Circle stage: disc, ring band, gradient background, blob shadows. Camera following the midpoint of two placeholder capsules. Input polling into `InputFrame`. **Deploy to Vercel and open the URL on a different device.**

**Done when:** a public URL shows a disc, two capsules, and a working camera.

### T-02 — Simulation loop and movement `Day 2`
Fixed timestep with accumulator. `src/sim/` created with zero render imports. Character state machine: idle, walk, dash, backdash, jump, land. Lock-on facing and auto-turn. Pushboxes and minimum separation. Sidestep with i-frames. Soft arena boundary.

**Done when:** two capsules move like fighters and feel weighty.

### T-03 — Attacks and frame data `Day 3`
Move table from §6.2 as data. Attack states driven by that table. Hitbox / hurtbox capsules positioned per frame. **Debug visualization for all boxes, toggle with F1.** Cancel windows in data.

**Done when:** attacks play and boxes appear and disappear on the correct frames.

### T-04 — FIRST HIT `Day 4` ⭐ **GATE**
Capsule overlap detection. Hit resolution, damage, health. Hitstun, blockstun, pushback. **Hitstop per §6.3 (asymmetric).** Screen shake with trauma decay. Full-screen white flash for 1 frame. One placeholder impact sound.

**Done when:** you land a hit and it feels good.

> **GATE:** if a hit does not land and feel good by the end of this task, stop. Drop the Ultimate and the AI, and spend the remaining time making six moves feel excellent. That is a better slice than twenty half-systems.

### T-05 — A complete match `Day 5`
Blocking (auto-guard on back input within range). Chain combos and special cancels. Damage scaling per §6.4. KO, best-of-3, round timer, round pips. HUD: health bars, timer, pips, combo counter. Title → fight → result → rematch.

**Done when:** you can play a full match against yourself and it has a winner.

### T-06 — Clash and AI `Day 6`
Clash per §7. AI agent per §7, producing `InputFrame` through the same interface as a human. Three difficulty tiers.

**Done when:** a full match against the AI works, and Clash triggers and feels deliberate.

### T-07 — THE LOOK `Day 7` ⭐
Toon shading: half-Lambert remap → 2-band gradient map, coloured shadow tint. Inverted-hull outline: duplicated skinned mesh, `BackSide`, expanded along normals, constant pixel width by depth. Rim light: Fresnel, gated toward the opponent. Mixamo character replaces capsules, clips wired to sim states. **P1/P2 colour tint** so the mirror match is readable. Bloom via drei.

**Done when:** it looks like a game, not a prototype.

> **Timebox outlines to 3 hours.** If they are not working, ship with gradient-map shading only. That alone carries most of the visual identity.

### T-08 — Impact and spectacle `Day 8`
Hitspark sprites (light / heavy / block), camera-facing, pooled. Radial blur on heavy impacts. Chromatic aberration on Clash. Damage numbers. Combo counter animation. The faked Ultimate per §7.

**Done when:** heavy hits feel heavy and the Ultimate makes people react.

### T-09 — Audio and finish `Day 9`
12 sound effects: light / medium / heavy impact, block, whiff, dash, jump, land, clash, KO, round start, ultimate. One music loop, one crowd bed. Music ducks −24 dB on Clash and KO. `AudioContext` created suspended, resumed on first click. Landing page with controls. Bug pass. Performance check on the weakest available machine.

**Done when:** ten consecutive matches run with no crash and no missing sound.

### T-10 — Ship `Day 10`
Bug fixes only. **No new features.** Final deploy tested on three browsers. Capture 90 seconds of footage: neutral, a combo, a Clash, the Ultimate, a KO. Write a short note listing what is real and what is faked.

**Done when:** the URL is public and the footage exists.

---

## 10. KNOWN TRAPS — use the documented fallback

| Trap | Fallback |
|---|---|
| **Skinned-mesh outlines tear or fail** | Timebox 3 hours. Ship with gradient-map toon shading only. Outlines are ~25% of the look |
| **Custom shader fights R3F or skinning** | Use `MeshToonMaterial` with a custom gradient map. Built into three.js, supports skinning, 60% of the look in 20 minutes |
| **Animation timing does not match frame data** | You let the mixer own the timeline. Set mixer time directly from `(stateId, stateFrame)` — rule R4 |
| **Feet slide, animation drives position** | Root motion must not move the character. Movement comes from the sim only |
| **Frame pacing spiral / stutter** | Cap catch-up at 5 ticks per frame, drop the excess, log it |
| **Fast dash tunnels through hitboxes** | Sweep from previous to current position, or cap dash speed. Capping is acceptable here |
| **Audio does not play** | Autoplay policy. Create `AudioContext` suspended, resume on first user gesture |
| **Mixamo FBX → glb conversion eats a day** | Do this during T-01, not T-07. Merge all animations into one `.glb` in Blender |
| **Gamepad mapping differs across browsers** | Test Xbox and PlayStation pads during T-01. Keyboard is the guaranteed path |
| **Vercel build fails** | This is why T-01 deploys on day one |

---

## 11. Performance

Target: **60 FPS sustained** on a mid-range laptop for a full 3-round match.

Do not optimize before T-09. When you do, check in this order:

1. Draw calls (target: under 60 total)
2. Per-frame allocation — the game loop should allocate nothing. Pool hitsparks, damage numbers, vectors
3. React re-renders during a match — should be zero (rule R3)
4. Shader compilation hitches — pre-warm materials before the first round

---

## 12. Commands

```
npm install
npm run dev          # http://localhost:3000/play
npm run build
npm run lint
npx tsc --noEmit     # must pass with zero errors
```

Deploy: push to `main`. Vercel builds automatically.

---

## 13. Definition of Done — the whole slice

All eleven must be true:

1. Public Vercel URL loads in under 15 seconds on a mid-range laptop
2. Two humans can play best-of-3 on one machine with two gamepads
3. One human can play best-of-3 against the AI
4. Six attacks exist with the frame data from §6.2, and the combo route works
5. Blocking works, hitstun works, hitstop is tuned and feels good
6. Clash triggers, freezes for 10 frames, and looks deliberate
7. The Ultimate fires and reads as spectacle
8. Toon shading and outlines are on; it does not look like a grey-box
9. 60 FPS sustained through a full 3-round match on the reference machine
10. Sound plays on every impact, block, and KO
11. Ten consecutive matches with no crash

---

## 14. After the slice — do not start these now

Recorded only so they are not forgotten. **Do not begin any of these during the ten days.**

1. Circuit Gauge + Burnout (highest depth-per-hour system in the design)
2. A second character of a different archetype — until then this is a toy, not an engine
3. Fixed-point math conversion + state snapshots
4. Rollback against a local mock peer
5. Throws, air combos, the full defensive layer
6. Original character art and animation (the Mixamo debt comes due)

---

## 15. What this slice proves — and what it does not

Include this honestly in any pitch.

| Proven | Not proven |
|---|---|
| Combat feel — hitstop, impact, feedback | Balance, matchups, character variety |
| Clash reads as a moment | Clash depth, priority classes |
| Toon rendering at 60 FPS in a browser | Art pipeline fidelity — animation is placeholder |
| Frame-data-driven combat is implementable | Roster scalability |
| Vercel deployment works end to end | Netcode, matchmaking, scale |
| Sim / render separation holds | Determinism, fixed-point, snapshots |
| A stranger can play it with no instructions | Retention, progression, mode depth |

---

**Ship on day 10. Not day 12.**
