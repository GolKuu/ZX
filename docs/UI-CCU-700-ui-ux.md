# UI-CCU-700 — Front-end & Combat HUD

**Status:** binding specification for `F21` and `F17`
**Visual reference:** `docs/ui-mockups.html` — open it in a browser before implementing anything
**Scope:** every screen between opening the URL and throwing the first punch, plus the in-match HUD

---

## 1. Three laws

| # | Law |
|---|---|
| **U1** | **Pad first.** Nothing requires a mouse. Exactly one element is focused at all times, `A` always confirms, `B` always goes back — on every screen without exception. |
| **U2** | **Three presses.** Title → fighting in three inputs on the Local 2P path. The menu's job is to get out of the way. |
| **U3** | **The circle.** If an element can be a curve, it is. Straight lines are reserved for things the game imposes on the player. |

---

## 2. Tokens

Six colours. Adding a seventh requires a written reason.

```
--ink:        #05070A   arena ink — every screen ground
--ink-2:      #0B0F16   raised panels
--blue:       #9FD8FF   Circle Blue — player one, focus, the Circle
--gold:       #F2A93B   Ember Gold — player two, anything spent
--red:        #E0483A   Cinder — damage, low health, K.O. Nothing else
--stone:      #79879B   labels and hints. Never values
--line:       #18202B   hairlines and structure
--white:      #EEF3F8   primary text
--dim:        #4A5768   unfocused menu text
--dimmer:     #2E3946   disabled, build tag, empty pips
```

### Type

| Role | Stack | Use |
|---|---|---|
| **Display** | `Impact, Haettenschweiler, "Arial Narrow Bold", "Franklin Gothic Heavy", sans-serif` | Timer, `FIGHT`, `K.O.`, `VS`, winner name, stat numerals. **Never below 24px.** |
| **UI** | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` weight 800 | Menu items, player names, buttons. Uppercase, tracking `.14–.22em`. |
| **Data** | `ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace` | Hints, device names, frame values, build tag. Uppercase, tracking `.14–.32em`. |

**No webfonts.** System stacks only — Impact ships on Windows, Haettenschweiler and Arial Narrow Bold cover macOS, and the sans fallback covers everything else.

### Sizing

All in-screen elements use `cqw` units against a `container-type: inline-size` wrapper at `aspect-ratio: 16/9`. The layout then holds at any window size with **zero media queries**. Do not use `px` or `rem` inside a screen.

| Element | Size |
|---|---|
| Game title | `8.4cqw` |
| Timer | `7.4cqw` |
| Menu item | `3.1cqw` |
| Player name (setup) | `2.4cqw` |
| HUD fighter name | `1.7cqw` |
| Button / hint label | `1.05–1.6cqw` |
| **Minimum permitted** | **`1.05cqw`** (≈13px at 1280 wide). Anything smaller is decoration and gets cut |

---

## 3. Flow

```
Title ──any button──► Menu ──┬── Local 2P ─────────────► Setup ──► VS ──► Fight ──► Result
                             │                            ▲                          │
                             ├── Vs AI ──► Difficulty ────┘                          │
                             │                                                        │
                             └── Controls ──B──► back                                 │
                                                                                      │
                        Result ── Rematch ────────────────► VS ◄───────────────────────┘
                        Result ── Change mode ────────────► Menu
                        Result ── Main menu ──────────────► Menu
```

**Local 2P is three presses:** `A` on Local 2P → `A` to ready → `A` to ready (P2). Difficulty is skipped entirely — never show a screen with one valid answer.

**Rematch returns to VS, never to the menu.** The set is the unit of play, not the match.

---

## 4. Screens

Every screen carries a permanent hint bar pinned to the bottom, `5.2cqw` tall, `1px` top border in `--line`, background `rgba(5,7,10,.7)`. It always reads the same actions in the same order. Never contextual, never animated.

### 4.1 Title

| | |
|---|---|
| Layout | Centred column: brand mark, title, prompt. Background ring at 78cqw diameter, `1px` border `rgba(159,216,255,.09)`, plus an inner ring inset `9cqw` at half that opacity |
| Brand mark | `12cqw` circle, `.35cqw` blue border, solid blue disc at 46% diameter inside, outer halo ring inset `-1.6cqw` |
| Title | Display `8.4cqw`, line-height `.86`. Subtitle `ULTIMATE` at `3.1cqw`, tracking `.42em`, blue |
| Prompt | Mono `1.5cqw`, tracking `.3em`, stone, opacity pulse 0.35 → 1.0 over 2.4s |
| Build tag | Bottom-left, mono `1.05cqw`, `--dimmer`. Present in every build |

**Boots straight here.** No splash logos, no legal screen. The first button press is what resumes the `AudioContext`, so the prompt does double duty — do not add a separate "click for audio" gate.

### 4.2 Main menu

| | |
|---|---|
| Layout | Left-aligned list at `padding-left: 9cqw`, vertically centred. Right panel `34cqw` wide with `1px` left border |
| Items | `LOCAL 2P` · `VS AI` · `CONTROLS`, in that order |
| Item row | `1.1cqw` dot + label `3.1cqw` + sublabel mono `1.15cqw`, `1.5cqw` vertical padding |
| Unfocused | dot `--dimmer`, label `--dim`, sub `--dimmer` |
| Focused | dot blue with `0 0 0 .5cqw rgba(159,216,255,.16)` glow, label white, sub `--blue-dim`. Plus a `.3cqw` blue bar at the far left edge |
| Side panel | Heading mono `1.15cqw` stone; body sans `1.5cqw` line-height 1.55, colour `#5D6B7D` |
| Hints | `A Select` · `B Back` · `↑↓ Navigate` |

**Local 2P sits first** because it is the mode that convinces people — the demo is two humans at a desk, not one person versus a bot.

The side panel describes the **focused** item and updates on focus change. Never on hover alone.

### 4.3 Difficulty

Shown only on the Vs AI path.

| | |
|---|---|
| Layout | Three cards, `aspect-ratio: 3/4`, `2.4cqw` gap, `6cqw` horizontal page padding |
| Card | `1px` border `--line`, gradient `180deg #0A0E14 → #070A0F`, `2.4cqw` padding, space-between column |
| Content | Index `01/02/03` mono `1.05cqw` · name sans `2.7cqw` · delay value display `5.4cqw` with mono `1.05cqw` caption `REACTION DELAY` |
| Values | `ROOKIE 18f` · `STANDARD 12f` · `VETERAN 7f` |
| Focused | border blue, gradient `#0D1620 → #080C12`, name white, value blue, plus a `.25cqw` blue bar across the bottom edge |
| Hints | `A Confirm` · `B Back` · `←→ Navigate` |

**The number is the design.** Difficulty is reaction delay in frames and nothing else — no damage bonus, no resource bonus. Printing the frame count states that without a paragraph of text.

Numbering (`01/02/03`) is used **here and only here**, because these are ordered rungs. Menu items elsewhere are unordered and carry no index.

### 4.4 Player setup

| | |
|---|---|
| Layout | Two equal columns split by a `1px` vertical border, bottom padding `5.2cqw` for the hint bar |
| Per side | tag mono `1.15cqw` · portrait `15cqw` circle · name sans `2.4cqw` · device mono `1.15cqw` · ready pill |
| Portrait | Circle with `.28cqw` border at 35% opacity in the player's colour, display initial at `7cqw` |
| P1 | `--blue` throughout · P2 `--gold` |
| Ready pill | `.7cqw 1.8cqw` padding, `1px` solid border, `99px` radius, sans `1.5cqw` tracking `.22em` |
| Waiting state | Colour `#3A4655`, **border-style dashed**, label `PRESS A` |
| Ready state | Solid border in player colour, label `READY` |
| Hints | `A Ready` · `B Back` · `— Both ready to start` |

**Device binding is explicit.** Whichever pad presses `A` first becomes player one. Print the detected device name (`Gamepad 1 · Xbox`) so nobody argues about which controller is which.

Mirror match, so this screen is about **colour and input**, not roster. Blue versus gold is the only thing separating two identical fighters — decide it here and show it large.

### 4.5 VS

| | |
|---|---|
| Layout | Centred row: P1 name, `VS` mark, P2 name, `5cqw` gaps. Background ring as on Title |
| Names | Display `6.4cqw` in player colour |
| VS mark | Display `9cqw`, white at 16% opacity |
| Loading | Label mono `1.05cqw` at `left:9cqw; bottom:11cqw`; bar `.28cqw` tall, track `#141C26`, fill blue, spanning `9cqw` insets at `bottom:9cqw` |
| Duration | Minimum 1.2s, longer if warming takes longer |

**This screen has a job.** Shader pre-warm and asset residency happen here so the first round never hitches. Progress is honest — if a weak machine takes longer, the bar takes longer. Never fake it to a fixed duration.

### 4.6 Pause

| | |
|---|---|
| Scrim | `rgba(3,5,8,.82)` over the frozen scene. **Opacity, not blur** — blur costs a fullscreen pass and the fight should read as suspended, not hidden |
| Panel | `46cqw` wide, centred, `1px` border `--line`, background `#080C12`, padding `3.4cqw 3.4cqw 2.6cqw` |
| Heading | Sans `2.1cqw`, tracking `.2em`, white |
| Items | `RESUME` · `RESTART MATCH` · `CONTROLS` · `QUIT TO MENU`. Row `1.15cqw` vertical padding, `1px` top border each, bottom border on the last |
| Row | `.9cqw` dot + label sans `1.9cqw` tracking `.14em` |
| Focused | label white, dot blue. Unfocused label `--dim`, dot `--dimmer` |

`RESUME` is focused by default — the most likely intent, reachable by pressing the same button twice.

`QUIT` asks for confirmation **only** if the match is past round one. Confirming a decision nobody has invested in is friction.

### 4.7 Result

| | |
|---|---|
| Header | At `top:12cqw`, centred column: subtitle mono `1.3cqw` tracking `.32em` blue, then winner name display `9cqw` |
| Stats | Centred at `top:30cqw`, single `1px` bordered row, cells split by `1px` left borders, `1.6cqw 3cqw` padding |
| Stat cell | Value display `3.6cqw` tabular-nums, label mono `1.05cqw` tracking `.18em` stone |
| Stats shown | `ROUNDS` · `MAX COMBO` · `CLASHES` · `DURATION` |
| Buttons | At `bottom:11cqw`, centred row, `1.6cqw` gap. Sans `1.6cqw` tracking `.18em`, padding `1.1cqw 2.6cqw`, `1px` border |
| Focused button | border blue, text white, background `rgba(159,216,255,.07)` |
| Order | `REMATCH` (focused by default) · `CHANGE MODE` · `MAIN MENU` |

**Clash count is a headline stat** because it is the mechanic the slice exists to prove. Putting it here teaches players to notice it.

No rank, no XP, no unlocks. The slice has no progression and this screen must not imply one exists.

### 4.8 Controls

| | |
|---|---|
| Layout | Two-column grid, `1.2cqw 5cqw` gaps, `5cqw 7cqw 7cqw` padding, content centred vertically |
| Title | Top-left at `7cqw / 3.4cqw`, mono `1.3cqw` tracking `.3em` stone |
| Row | Action label sans `1.6cqw` left, bindings right, `1px` bottom border, `1cqw` bottom padding |
| Key chip | `min-width 2.2cqw`, height `2.2cqw`, `1px` border `--dimmer`, radius `.35cqw` (round for face buttons), font `1cqw` |
| Rows | Move · Light · Medium · Heavy · Special · Sidestep · Ultimate · Pause |

**Live input test:** pressing any input lights its row. This doubles as the pad-detection check, which is the first thing that breaks on a stranger's machine.

Keyboard and pad bindings appear together on one row. Two separate screens would be two to maintain and one for players to miss.

**No remapping in the slice.** Showing bindings is in scope; editing them is not.

---

## 5. Combat HUD

The important one. Everything here competes for attention with two fighters and four effects.

### 5.1 Layout

| Zone | Contents |
|---|---|
| Top bar, `17cqw` tall, `2.4cqw 3cqw 0` padding | Health arcs, timer, round pips |
| Left, `top:22cqw` | Combo counter |
| Bottom-right, `4cqw` inset | Ultimate ready pill |
| **Lower two thirds** | **Nothing.** That is where the fight is |

The ultimate pill is the sole exception to the empty-lower-region rule, and it lives in a corner.

### 5.2 Health arcs

Shallow curves, not straight bars — U3 applied to the element players stare at most.

```
SVG viewBox   0 0 400 40, preserveAspectRatio="none", height 4.4cqw
P1 path       M4 34 Q200 2 396 12       (curves up toward centre)
P2 path       M396 34 Q200 2 4 12       (mirrored)
```

Three stacked paths per bar, in order:

| Layer | Stroke | Width | Behaviour |
|---|---|---|---|
| `track` | `#141C26` | 7 | Static |
| `ghost` | `--red` at 55% opacity | 7 | Transition `1.1s` with `.25s` delay |
| `fill` | player colour | 7 | Transition `.45s cubic-bezier(.2,.7,.2,1)` |

Drive both with `stroke-dasharray = pathLength` and `stroke-dashoffset = pathLength * (1 - health)`.

The ghost trails the fill by 250ms so the player can **see what a combo cost**.

**At ≤25% health the fill stroke switches to `--red`** and the arc pulses. Colour plus motion, never colour alone.

### 5.3 Timer

Display face, `7.4cqw`, `font-variant-numeric: tabular-nums` so digits do not jitter. It is the only large numeral on screen.

At ≤10 seconds it turns `--red` **and** the pulse rate doubles.

### 5.4 Round pips

`1.5cqw` circles, `.85cqw` gap, directly under the timer. Empty pip is `1px --dimmer` border; won pips fill with the winner's colour.

### 5.5 Combo counter

Appears on the **attacker's side** at `left:4cqw; top:22cqw`.

| Part | Spec |
|---|---|
| Count | Display `6cqw` white |
| Label | Sans `1.5cqw` tracking `.2em` gold, reads `HITS` |
| Damage | Mono `1.15cqw` stone, reads `238 DMG` |

**Appears at hit two, not hit one.** Damage is shown because damage is the number players actually want.

### 5.6 Ultimate pill

`1px --gold` border, `99px` radius, padding `.9cqw 1.6cqw`. A `1.3cqw` gold dot pulsing at 1.6s, plus label `ULTIMATE READY` in sans `1.3cqw` tracking `.2em`.

Appears when the ultimate becomes available (owner at ≤25% health, unused this round).

### 5.7 Callouts and overlays

| Callout | Spec |
|---|---|
| `ROUND ONE` / `FIGHT` | Display `11cqw` white, text-shadow `0 0 6cqw rgba(5,7,10,.9)` |
| `K.O.` | Display `14cqw` in `--red` |
| `CLASH` | Display `9cqw` blue, tracking `.24em`, plus a `44cqw` ring with `.3cqw` blue border at 50% opacity, plus a full-screen `rgba(30,60,85,.42)` layer in `mix-blend-mode: color` |

The Clash overlay holds for the full 10-frame freeze and nothing else animates during it.

---

## 6. Interaction model

| Rule | Spec |
|---|---|
| **Focus** | Exactly one focused element per screen at all times. Focus survives back-navigation — returning to the menu restores the item you left from |
| **Repeat rate** | First step on press, then a 24-frame delay, then one step per 8 frames. Faster feels twitchy on a stick; slower feels broken |
| **Wrapping** | Vertical lists wrap. Horizontal card rows do not — hitting the end should feel like an edge |
| **Confirm / back** | `A` confirms and `B` backs out on every screen without exception, including inside the pause menu |
| **Mouse** | Supported as a convenience: a click sets focus and confirms in one action. Nothing is mouse-only. **No hover-only state exists** |
| **Transitions** | 120ms cross-fade between screens. No slides, no scale, no easing flourishes — menu latency is felt |
| **Audio** | Navigation and confirm sounds fire **on input, before the visual updates**. A menu that sounds late feels late |
| **Disconnect** | A pad unplugged mid-match pauses instantly and names the missing device. Never silently swap to keyboard |

---

## 7. Accessibility

- **Never colour alone.** P1/P2 carry colour **and** screen side **and** a printed tag. Low health is red **and** pulsing. Ready is solid **and** says `READY`; waiting is dashed **and** says `PRESS A`.
- **Blue/gold survives all three common colour-vision types** — chosen over the obvious red/blue for exactly this reason.
- **Minimum in-screen type is `1.05cqw`.** Below that it is decoration and gets cut.
- **`prefers-reduced-motion`** stops the title prompt pulse, the ultimate pill pulse, and all screen transitions. **Health-bar animation stays** — it carries information.
- **Contrast:** all HUD text ≥ 7:1 against `--ink`. Stone on ink is 5.4:1 and is used only for labels, never for values.
- **Keyboard-only players** can reach and operate every screen. The slice is completable start to finish with no pad attached.

---

## 8. Implementation notes

| Item | Note |
|---|---|
| **Location** | All menu screens are DOM overlays in `src/ui/`, **never** rendered inside the R3F canvas. The HUD is also DOM, positioned over the canvas |
| **State** | Screen routing and menu focus live in the zustand UI store. The HUD reads sim state through a **throttled 15 Hz bridge** — never a per-frame React update (README rule R3) |
| **Scaling** | `container-type: inline-size` on the screen wrapper, `cqw` units inside. No media queries |
| **Health arcs** | Inline SVG, `stroke-dasharray` from `getTotalLength()`. Two stacked paths: red ghost behind, coloured fill in front with the shorter transition |
| **Fonts** | System stacks only, per §2. No webfont, no CDN |
| **Existing code** | `src/ui/PlayOverlay.tsx` and `src/ui/FpsMeter.tsx` already exist. Fold the HUD into `PlayOverlay`; keep `FpsMeter` as a dev-only overlay excluded from production builds |

### Build order

| Task | Screens |
|---|---|
| **T-05** | Title, Main menu, Player setup, **HUD** |
| **T-06** | Clash overlay (with the Clash system itself) |
| **T-09** | Difficulty, VS, Pause, Result, Controls |

**Do not build any of this before combat feels right.** The day-4 gate comes first.

### If the schedule slips

Cut in this order: **Controls screen** → **Difficulty screen** (hard-code Standard) → **VS screen** (go straight to the fight). Title, menu, setup, HUD and result are the floor.
