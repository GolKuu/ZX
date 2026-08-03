# Vorgh — production sheet

## Mim comparison

| Area | Mim authored baseline | Vorgh result |
|---|---:|---:|
| Frame-data rows | 27 | 33 |
| Named animation clips | 68 (mostly disconnected catalog) | 74, including every move and runtime-driven poses |
| Main mechanic | Energy walls | Rage + Pain-to-Power + Pain Guard |
| Default hurtboxes | 3 | 3 |
| Unique base normals | 4 | 4 exact J/K/I/L briefs |
| Defense | 7 named poses, generic runtime guard | 19 defense clips + guard gauge, perfect timing and break |
| Specials | 11 wall/story actions | 6 base + 6 enhanced |
| Supers / Ultimate | 2 / 1 | 2 / 1 with three Dominion scales |
| AI | Generic fallback | Easy, Normal, Hard, Impossible and Story loadouts |
| Dedicated tests | 12 stale at audit time | 29 Vorgh tests; full suite 193/193 |

## Rage states

| Rage | Visual stance | Mechanical access | Counterplay |
|---:|---|---|---|
| 0–24 | Low, disciplined 18f idle | Base routes | Normal pushback and recovery |
| 25–49 | Medium, tense 18f idle | Reprisal and wider cancels | Enhanced tools still unavailable |
| 50–74 | Charged medium | EX Slash, Dash and Leap | Every EX spends Rage |
| 75–99 | High, predatory 18f idle | Sundering, War Cry, one-hit armour | Increased EX recovery and guard risk |
| 100 | Berserk overdrive | Maximum route access | Auto-drains to 74; no permanent maximum |

Damage taken converts 18% to Rage, raised to 22.5% below 30% HP. Counter hits
and pressure add small fixed gains. Perfect Block grants 4. Pain Guard costs 5,
reduces chip to 35%, and guard damage still accumulates. Guard Break removes 25
Rage and locks gain for 180 frames.

## Defense catalog

| Family | Clips / behavior |
|---|---|
| Stand | start, hold, light impact, heavy impact, release |
| Crouch | start, hold, light impact, heavy impact, release |
| Situational | air block, cross-up turn, chip reaction, throw escape |
| Guard failure | guard crush, guard break, block-stun recovery |
| Vorgh mechanics | perfect block, pain guard, Pain-to-Power hurt |

Perfect Block is only the first three guard frames and reduces blockstun by four;
it does not guarantee a punish. Guard health recovers only outside guard.
Armour is one hit, keeps at least 65% incoming damage, and never removes move
recovery.

## Full moveset

Columns: startup / active / recovery, total damage, first-hit hitstun /
blockstun, Rage gain / cost.

The table keeps authored base values. Runtime damage is now **15% higher**
(rounded to the nearest point) across Vorgh's complete moveset; Rage costs,
frame timing and recovery are unchanged.

| Move | S/A/R | Level | Dmg | HS/BS | Rage +/− |
|---|---:|---|---:|---:|---:|
| Predator Rake | 6/4/10 | high | 34 | 17/12 | +3/0 |
| Skull Ram | 9/4/14 | mid | 52 | 23/15 | +4/0 |
| Hunting Sweep | 12/5/15 | low KD | 61 | 28/17 | +5/0 |
| Rising Heel | 16/5/18 | anti-air kick launcher | 72 | 31/18 | +6/0 |
| Shin Gouge | 5/3/11 | crouch low | 27 | 15/10 | +2/0 |
| Rib Tear | 8/4/13 | crouch mid | 43 | 20/13 | +3/0 |
| Beast Pivot | 14/5/20 | crouch low | 69 | 27/17 | +5/0 |
| Aerial Talon | 5/4/9 | air high | 29 | 16/10 | +2/0 |
| Falling Knee | 8/5/13 | air mid | 48 | 22/14 | +3/0 |
| Meteor Maul | 13/6/21 | air heavy | 75 | 30/17 | +5/0 |
| Hunter Clamp | 6/2/24 | throw | 78 | 26/— | +4/0 |
| Carrion Drop | 7/3/26 | air throw | 88 | 32/— | +5/0 |
| Fang Chain | 8/8/16 | dual mid | 68 | 16/— | +6/0 |
| Rend Step | 11/5/18 | dual low | 65 | 27/— | +6/0 |
| Bone Gate | 15/5/22 | dual mid | 82 | 34/— | +7/0 |
| Rage Slash | 11/5/20 | mid | 68 | 27/16 | +5/0 |
| Berserk Dash | 14/5/24 | mid armour | 74 | 29/17 | +5/0 |
| Pain Counter | 5/18/27 | counter | — | — | +8/0 |
| Armour Breaker | 18/5/28 | guard break | 96 | 34/20 | +6/0 |
| Predator Leap | 17/7/24 | airborne high | 80 | 31/18 | +5/0 |
| Blood Roar | 22/7/30 | mid wave | 58 | 25/20 | +10/0 |
| Rage Slash: Rupture | 9/6/24 | EX mid | 88 | 32/18 | 0/16 |
| Berserk Dash: Ravage | 11/6/29 | EX armour | 94 | 33/19 | 0/18 |
| Pain Counter: Reprisal | 4/5/26 | counter hit | 102 | 38/18 | 0/0 |
| Armour Breaker: Sundering | 16/6/34 | EX guard break | 126 | 40/22 | 0/20 |
| Predator Leap: Sky Hunt | 14/8/29 | EX air | 103 | 35/19 | 0/15 |
| Blood Roar: War Cry | 19/8/36 | EX wave | 84 | 31/23 | 0/22 |
| Savage Dominion | 18/18/38 | Super | 151 | 34/— | 0/34 |
| Dominion: Blooded | 16/18/38 | Super 50+ | 186 | 34/— | 0/42 |
| Dominion: Apex | 14/18/38 | Super 75+ | 224 | 34/— | 0/54 |
| Unchained | 12/6/18 | Super buff | — | — | 0/20 + 15 drain |
| Last Beast confirm | 16/5/28 | Ultimate | 38 | 54/— | 0/80 |
| Last Beast sequence | 4/58/72 | confirmed cinematic | 306 | 34/— | 0/0 |

Every row also carries hitbox timing, pushback, chip/guard damage where
applicable, cancel windows, VFX IDs, sound IDs and camera events in
`src/data/vorgh/`.

## Matchup and regression evidence

| Check | Result |
|---|---|
| Free cancel-loop search | PASS — zero-cost graph is acyclic |
| Heavy-on-block safety | PASS — recovery exceeds blockstun |
| Armour pressure | PASS — one hit, 65–75% damage retained |
| Pain-to-Power value | PASS — bounded, hurt reaction remains |
| Pain Guard loop | PASS — costs Rage and loses to guard break |
| Last Beast gate | PASS — low HP, 80 Rage, 66 meter, confirmed hit |
| Matchups: Mim / Glitch | PASS — all four role normals connect honestly |
| Matchups: Lucky / Titan | PASS — all four role normals connect honestly |
| Vorgh dedicated | 29/29 |
| Full deterministic suite | 193/193 |
| Mim regression | PASS after stale test IDs were aligned to current Mim data |
| Lint / typecheck / assets | PASS |
| Production build | PASS |

Browser screenshots could not be captured in this Codex session because no
browser backend was available. The procedural rig was therefore judged from its
source structure and deterministic animation tests, not screenshot evidence.

## Independent critic

Historical verdict: **85/100** under the retired threshold. Under the current
global 97/100 character gate Vorgh is **REJECTED pending a new audit**. The
earlier 55 and 64 point rejections were
resolved by connecting animation metadata to fixed-tick runtime playback,
enforcing real high/low guard and grapple rules, bounding dynamic Rage cancels,
making high-Rage recovery punishable, phasing hurtboxes, and expanding defense,
AI and presentation behavior.
