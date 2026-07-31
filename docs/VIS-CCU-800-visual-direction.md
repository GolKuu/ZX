# VIS-CCU-800 — Visual Direction Bible

**Target:** a flat, side-on 2D fighter in the register of Fantasy Strike — clean
vector shapes, heavy ink, saturated flats, a legible stage that never competes.
**Must never read as:** a prototype, a hitbox viewer, a 3D model with a cel
filter over it, an unlit mannequin.
**Renderer:** Three.js, WebGL2 baseline, 60 FPS locked.

---

## 0. The thesis — the sheets are the specification

The four character sheets in `public/` and `public/assets/characters/` are not
concept art or mood reference. **They are the spec.** MIM and GLITCH each ship
a four-view turnaround and four attack poses (LP, HP, LK, HK).
Where this document and a sheet disagree, *the sheet wins* and this document is
wrong and must be corrected.

Everything the sheets do is cheap at runtime. There is no lighting model to
solve, no PBR chain, no shadow budget to argue about:

| What the look is made of | Runtime cost |
|---|---|
| Two flat colours per surface — a lit hue and a shade hue | zero |
| One heavy black contour at a constant pixel weight | one back-faced hull pass |
| Flat unlit stage layers standing at z ≈ 0 | zero |
| Big, over-extended pose silhouettes | zero |

**Consequence:** there is no technical reason for the game not to look like the
sheets. Every gap is an authoring gap — proportion, pose extremity, and drawn
detail on the costumes.

---

## 1. Art Direction

### 1.1 Statement

**Illustrated, not rendered.** A frame paused at random must look like a drawing.
Not "like a drawing that moves in three dimensions" — like a drawing. If a
viewer can tell the characters are geometry, it has failed.

### 1.2 The five laws

| # | Law |
|---|---|
| **A1** | **Two flat bands. Never a gradient, never a falloff.** A surface is its lit colour or its shade colour. Stage lighting may not decide what colour a costume is; `toonMaterial`'s `flatten` defaults to 1 for exactly this reason, and the arena is the only caller allowed to opt out. |
| **A2** | **Shade is a colour, never a darkness.** The shade band is a hue shift — never a multiply of the lit value, and never toward black. A multiply has no floor, which is how the whole roster once rendered as black cut-outs. |
| **A3** | **Silhouette carries the character.** Readable as a solid black shape at 40 m. Verified in CI. |
| **A4** | **One ink weight for the whole roster.** The contour is heavy, even, pure near-black, and does **not** thin with distance. It is art direction, not a per-character knob — see `INK_WIDTH` in `outlineMaterial.ts`. |
| **A5** | **Nothing occupies the space between the lens and the fighters.** No set dressing, no debris, no post effect that dims the frame edges where a cornered fighter stands. The stage exists behind the fight or it does not exist. |

### 1.2.1 Corollary — post-processing is subordinate

A grade that alters a costume's colour has broken A1, and a contact-shadow pass
strong enough to darken a fighter has broken A2. Both have happened: `N8AO` at
`intensity 2.6` painted two nearby fighters solid black, and `+0.14` saturation
clipped the middle channel of every violet in the frame to zero. Budgets:

| Effect | Ceiling | Why |
|---|---|---|
| AO intensity | **1.0**, radius ≤ 0.6 m | Above this it stops describing contact and starts shading |
| Saturation | **±0.05** | The palettes are already authored at final saturation |
| Contrast | **±0.08** | Stacks with AO and vignette |
| Vignette darkness | **0.4** | Fighters reach the frame edge whenever the camera pans |

### 1.3 Proportion — read off the sheets

The sheets are **not** realistically proportioned, and matching them means
matching that. MIM is the clearest case: a large round head, a chunky hoodie that
reads as one solid mass, and short legs.

| Property | Value |
|---|---|
| Head units | **4.5–5**, not 7.3. A tall realistic figure cannot read as these sheets |
| Head | Oversized, near-spherical, and the first thing the silhouette resolves to |
| Torso | One dominant solid mass. Costume detail sits *inside* it, never breaking its outline |
| Legs | Short relative to the torso, and always visibly bent in stance |
| Hands | Full mass. Hands sell fighting poses more than faces do |
| Costume rule | one dominant shape, one accent shape, one detail zone. No more |

### 1.4 Per-character identity

Authoritative colours live in `src/data/characterPalettes.ts`. The identity in
one line each, so a wrong-looking build can be diagnosed without the sheet open:

| Character | Reads as |
|---|---|
| **MIM** | Purple hoodie, flat yellow smiley face, long yellow scarf, clean white sneakers |
| **GLITCH** | Near-black bodysuit, cyan circuit lines, magenta corruption blocks shedding off one side |

### 1.5 The four attack silhouettes

Every sheet draws the same four, and they are all **over-extended** — the striking
limb reaches well outside the body outline. A timid version of these poses is the
single most common way the game stops looking like its own art.

| Move | Silhouette |
|---|---|
| **LP** | Lead arm straight and horizontal, rear elbow pinned at the ribs, front knee deep, rear leg long behind, torso pitched forward over the front foot |
| **HP** | Whole body turned over; the arm sweeps a wide arc clear of the body; stance opens into a deep lunge |
| **LK** | Body dropped nearly to the floor, support hand planted flat on the ground, sweeping leg run out along it almost straight |
| **HK** | Foot finishes at head height, torso counter-leaning away from it, knee chambered before the shin whips out — never kicked from a straight leg |

### 1.6 Contrast budget

The band of screen the fighters occupy is the highest-contrast region in the
frame, always. Everything past the platform is desaturated and value-compressed.

**This is currently violated and is the top open defect.** The arena floor is the
brightest, most saturated object in the frame while the characters sit below it in
value. A background that competes for attention is a defect, not a style.

### 1.7 Camera

Side-on and **level** — eye height equals aim height. The stage is built from flat
planes at z ≈ 0, so any vertical tilt keystones them and gives away that the 2D
backdrop is geometry. The rig tracks the fighters' midpoint and dollies on their
separation; it must be able to pan far enough to centre a *cornered* pair, since
fighters reach ±4.8 m on a 5.1 m stage.

---

## 2. Character Rendering Pipeline

Per fighter, per frame:

```
1. skinned pose        sim state → (stateId, stateFrame) → mixer time, set directly
2. hull pass           BackSide, expanded along smoothed normals, constant pixel width
3. base pass           ramp lookup → coloured shade band → stepped highlight
4. rim pass            Fresnel, gated to the combat axis, additive
5. face pass           unlit drawn elements: eyes, lids, brows — no shading, no hull
6. effect layer        aura shell, trails, directional attack cue
```

**Two draw calls per material zone** — hull then base. With eight zones plus unlit face elements the fighter costs ~20 calls, which is inside the 160-call mid-tier budget for two fighters plus stage.

### 2.1 Material zones — implemented

Each active fighter owns a material module under `src/stage/`. Toon zones carry
their own shade hue; faces and effect accents stay unlit where readability
requires a stable colour.

| Zone | Base | Shade hue |
|---|---|---|
| skin | `#d79c71` | `#9c5a70` plum |
| cloth | character base | cooler or warmer character shade |
| trousers | dark base | saturated blue or violet |
| hair | character accent | shifted accent hue |
| effect | signature colour | unlit or additive |

Skin runs reduced shade strength (0.62) and reduced rim (0.7) so the face never blows out.

---

## 3. Cel Shading System

### 3.1 Chain

```
edited normal N ─┐
                 ├→ half-Lambert → threshold bias → ramp fetch → base light
light vector L ──┘                      ↑
                          control map .r (forced light/shade)
                 + stepped highlight
                 + rim (§5)
                 + emissive (unlit, bloom layer)
```

### 3.2 Formulas

**Half-Lambert remap.** Never raw N·L — raw Lambert puts the terminator at 90°, where nobody wants it.

```
ndl = dot(N, L) * 0.5 + 0.5
```

**Threshold bias.** The single most important line. Lets an artist force any region into light or shade regardless of the actual lighting.

```
bias  = (CTRL.r - 0.5) * 2.0          // 0.5 = neutral
ndl_b = saturate(ndl + bias * 0.45)
```

**Ramp fetch.** Banding lives in the texture, not the maths. No `step()`, no branching.

```
lightRGB = texture(RampAtlas, vec2(ndl_b, materialRow)).rgb
```

Ramp atlas: **256 × 16, RGB8, point-sampled on V**. Sixteen material families. Painted by hand with hard steps and a 2–4 px transition — that transition *is* the antialiasing of the terminator.

**Coloured shade — implemented in `toonMaterial.ts`.**

```
litLuma  = dot(outgoingLight, LUMA)
baseLuma = dot(albedo, LUMA)
shade    = 1 - saturate(litLuma / baseLuma)
out      = mix(out, out * shadowTint * 1.9, shade * shadowStrength)
```

**Stepped highlight.** Analytic Blinn-Phong is the wrong tool; these highlights are *shapes*, not distributions. Use a matcap so the shape is authored:

```
mc  = texture(MatcapAtlas, viewNormal.xy * 0.5 + 0.5).r
spec = step(0.62, mc) * CTRL.g * specColor
```

The hair band is the important one — a horizontal ribbon anchored to the head regardless of light. A matcap gives that free; an analytic model never will.

### 3.3 Face rules

Separate variant, three differences: bias strength **0.85** (the control map almost fully overrides lighting), a 2-band row with a 1 px terminator, and **facial shadow locked to head space** so the nose shadow does not swing when the character turns.

---

## 4. Character Outlines

### 4.1 Two systems

| System | Method | Tier |
|---|---|---|
| Silhouette and major forms | Inverted-hull backface pass | all |
| Interior detail | Screen-space depth + normal edge detect | mid / high |

### 4.2 Constant pixel width — implemented

This formula separates a drawn outline from a rendered one:

```
depth         = max(-viewPosition.z, 0.001)
unitsPerPixel = (2 * tan(fov/2) * depth) / viewportHeight
width         = targetPixels * unitsPerPixel
width        *= clamp(1 - (depth - 7) / 22, 0.55, 1)   // thin at long range
```

`targetPixels` = **2.4** for silhouette, **1.1** for face and hands. Shipping in `outlineMaterial.ts` with `updateOutlineProjection()` wired to viewport height and camera FOV.

### 4.3 The normal problem

Shading normals are hand-edited and often split. Expanding along them **tears the hull at every seam** — the classic first-attempt failure.

Fix: ship a second normal set, welded and averaged, used only by the hull, stored octahedral-encoded in `TEXCOORD_3`.

### 4.4 Line weight, painted to vertex colour alpha

| Region | Alpha | Result |
|---|---|---|
| Outer silhouette | 1.00 | 2.4 px |
| Limbs, torso | 0.75 | 1.8 px |
| Hands, fingers | 0.45 | 1.1 px |
| Face, jaw | 0.35 | 0.85 px |
| Eyes, mouth, teeth | **0.00** | no hull — drawn in the albedo |

### 4.5 Colour

Not black — black flattens a colour-forward palette.

```
outlineRGB = mix(albedo * 0.18, LINE_TINT, 0.65)
```

Skin `#4A2B2B`, hair = base hue at 0.22 value, metal `#1E2430`, effects **no outline**.

---

## 5. Rim Lighting

The load-bearing element for readability. **Stages have zero authority over it.**

```
fres    = 1 - saturate(dot(N, V))
rimBase = smoothstep(0.50, 0.94, fres)
```

### 5.1 The axis gate — implemented

Undirected Fresnel wraps the whole silhouette and reads as plastic. Ours is gated to the combat axis, so it lights exactly the two contours a player parses for spacing:

```
A    = normalize(opponentPos - selfPos)        // combat axis, world XZ
R    = normalize(cross(A, up))                 // screen-horizontal perpendicular
gate = pow(saturate(abs(dot(N, R))), 1.6)
rim  = rimBase * gate * CTRL.a * strength * rimColor
```

`updateRimAxis()` runs per frame in the fighter renderers, transforming `R` into view space.

### 5.2 Policy

| Context | Rim |
|---|---|
| Default | character accent at 0.85 |
| Skin | 0.70 — the face must not blow out |
| Airborne | ×1.25 — airborne readability is worse and 25% closes it |
| Counter-hit | accent rim tightens at 1.25 for 3 frames — never white |
| Super invulnerability | pulses at 4 Hz — an authored, learnable tell |

---

## 6. Fresnel Lighting

Fresnel drives four separate systems and they must not be confused:

| Use | Curve | Notes |
|---|---|---|
| Rim (§5) | `smoothstep(0.50, 0.94)` | gated to the axis |
| Aura shell | `pow(fres, 1.4)` | drives shell opacity so the centre stays clear |
| Refraction barrier | `pow(fres, 2.6)` | already shipping in `refraction-barrier.ts` |
| Ice / glass surfaces | `pow(fres, 5.0)` | narrow, hard edge |

**Rule:** Fresnel is never used for a general "shininess" pass. Every use above is a named effect with its own exponent. A material that adds Fresnel because it "looks better" is rejected.

---

## 7. Hair Rendering

Hair is the second-strongest style signal after eyes.

| Element | Approach |
|---|---|
| Structure | One **mass** shape plus 5–7 spike shapes over it, so the outer silhouette reads as a single form. Never per-strand |
| Shading | Two bands plus a dedicated highlight band from the ramp atlas |
| Highlight | **Matcap ribbon anchored to head space** — a horizontal band that stays put when the head turns. This one detail is most of the read |
| Outline | Full 2.4 px on the mass, 1.1 px on spikes |
| Motion | Spring bones on the spikes only. **Visual only — never feeds the simulation** |
| Shade hue | Cooler and more saturated than the base, never grey |

Shipping fighters keep hair as one readable mass with a small number of accent shapes.

---

## 8. Cloth Rendering

| Element | Approach |
|---|---|
| Structure | Cone and cylinder shells, `DoubleSide`, open-ended so the interior reads |
| Shading | Two bands, blue shade hue, no specular |
| Folds | Painted into the control map as forced-shade strips, **not** modelled geometry |
| Motion | Authored offsets driven by the animation, not simulation. Cloth sim is banned at this budget |
| Alpha | **Opaque only.** Blended transparency breaks the hull pass, the depth-based interior lines and the silhouette gate |

Long coats and sashes get their bottom edge cut with a slight upward curve so they read as drawn rather than as a cylinder.

---

## 9. Weapon Rendering

| Element | Approach |
|---|---|
| Blade | Three bands: bright edge, mid body, cold shade. Edge is a forced-light strip in the control map |
| Highlight | Hard matcap glint that travels along the blade during a swing — authored, not physical |
| Guard / fittings | Gold family, three bands, tight matcap |
| Handle | Matte, two bands, no highlight — the contrast against the blade is the point |
| Trail | Ribbon mesh from the tip socket, fixed-length history, additive gradient, **the only visual evidence of the swing arc** |
| Outline | 2.4 px on the blade silhouette, 1.1 px on fittings |

For characters whose weapon is conceptual rather than physical, the trail *is* the weapon and carries full authoring attention.

---

## 10. Eye Shader System

The strongest single style signal. Implemented inside each active fighter body and material module.

### 10.1 Construction — six layers

| Layer | Geometry | Material |
|---|---|---|
| Sclera | Sphere scaled `[1.32, 1.06, 0.42]` | unlit `#f7fbff` |
| Iris | Circle, 0.30 head-radius | unlit, character colour |
| Pupil | Circle, 0.15 head-radius | unlit `#0d1418` |
| Catchlight | Circle, 0.075 head-radius, offset up-outward | unlit pure white |
| Upper lid line | Box, rotated per side | unlit `#241a1e` — **heaviest stroke on the face** |
| Brow | Box, rotated per side | unlit `#241a1e` |

### 10.2 Laws

1. **Eyes are unlit. Always.** No ramp, no rim, no shadow, no hull. They are drawn elements, not surfaces — the face keeps the same read at every light angle and the gaze never disappears in a dark stage.
2. **The catchlight is never removed.** It is the difference between alive and dead, it costs one circle, and it stays on in every lighting condition.
3. **The upper lid is heavier than the lower.** Asymmetry is what makes the eye read as drawn.
4. **Eyes are oversized** — iris at 2.3× realistic scale, positioned forward on the face so they stay visible at three-quarter angles.
5. **Emissive at 0.15** on the bloom layer so eyes retain presence without blooming.

### 10.3 Expression states

| State | Change |
|---|---|
| Neutral | base |
| Attacking | pupil contracts 25%, brow drops 0.06 head-units |
| Hit | pupil contracts 40%, lid line raises, catchlight offset jumps |
| Countered | iris colour flashes to white for 3 frames |
| Super activation | iris switches to the accent colour, emissive to 0.8 |

---

# VFX Direction

## The doctrine — 2D first

> **Sprite sheets are the default. 3D particles require written justification.**

This is the FighterZ lesson and it is worth more than any other decision in this document. Drawn sheet effects are cheaper at runtime, more art-directable, and read as *drawn*. A particle system will never look hand-made no matter what it costs.

| Class | Method | Justification needed |
|---|---|---|
| Impacts, sparks, slashes, attack cues | sprite sheet, camera-facing | no |
| Speed lines, shockwave rings | sprite sheet | no |
| Trails, ribbons | procedural mesh strip | no |
| Aura, charge | mesh shell + scrolling noise | no |
| Dust, debris, smoke | instanced sprites, ≤120 | **yes** |
| True volumetrics | **prohibited** | — |

**Sheet spec:** 2048², 8×8 grid, 256² per frame, 8–24 frames playing at **20 fps** — not 60. Hand-drawn, 2–3 flat values plus a white core. No gradients, no soft edges, no simulation bakes.

## The shape vocabulary

Five shapes, used consistently so players learn them without being told:

| Shape | Meaning |
|---|---|
| Radial burst | impact landed |
| **Perfect flat circle** | Clash — **sacred, used nowhere else** |
| Arc / crescent | a cut or sweep |
| Column / pillar | imposition, structure |
| Dissolve / fray | loss, drain, absence |

Any VFX proposal containing a flat circular ring is rejected unless it is a Clash.

## Attack and impact feedback

Three frames, fixed:

```
f0  COMMIT    a small accent-colour crescent appears in front of the attacker.
              It is directional, local to the fighter, and never white.
f1  TRAVEL    the crescent expands along the attack facing and fades.
f2+ CONTACT   no screen flash. Hitstop, camera trauma and the impact sheet carry
              the hit. Pose eases back over 3 frames.
```

| Weight | Cue scale | Duration | Hitstop (atk/def) |
|---|---|---|---|
| Light | 0.82 | 0.28 s | 6 / 8 |
| Medium | 1.00 | 0.28 s | 8 / 11 |
| Heavy | 1.16 | 0.28 s | **11 / 15** |
| Counter | 1.20 | 0.28 s | +3 / +4 |
| Super | 1.24 | 0.28 s | 14 / 20 |

Flash frequency capped at 3 Hz; at maximum hit rate the system throttles to every other hit.

## Energy attacks

| Layer | Content |
|---|---|
| Core | Bright white capsule, unlit, no outline |
| Body | Character-hue shell with scrolling noise, additive |
| Leading edge | Sheet-drawn burst, plays once on spawn |
| Trail | Ribbon from spawn point, fading over 0.5 s |
| Ground interaction | Decal strip, additive, follows the projectile |

Full-screen beams take the **entire vertical extent** of the frame with a hard-edged core and a soft additive halo. The halo never exceeds 0.45× of the character bloom ceiling.

## Aura systems

Never a particle system — a shell mesh.

| Layer | Method |
|---|---|
| Inner glow | LOD1 duplicate expanded 0.04 m, additive, Fresnel-masked |
| Flame body | ~900-tri authored shell, vertex displacement from scrolling noise |
| Rising sprites | 8–16 instanced camera-facing quads |
| Ground ring | Single pulsing additive decal |

```
n     = noise(uv*2.0 + t*0.55)*0.65 + noise(uv*4.7 + t*0.90)*0.35
P_out = P + N * (n * AMP * smoothstep(0, 0.35, uv.y))
AMP   = 0.10 idle → 0.22 charging → 0.34 ultimate
```

**Burnout / drained state:** aura dies, palette desaturates to 55%, rim drops to grey. A player must be able to read the state from a thumbnail.

## Dash effects

| Element | Spec |
|---|---|
| Ghosts | 3 discrete copies at 60/40/20% opacity, held 2 frames each — **not** a continuous blur |
| Ground | Dust puff sheet at the departure point, 8 frames |
| Screen | Radial blur 0.012 from screen centre |
| Trail | Ribbon from the hips, 0.25 s |

## Teleport effects

| Beat | Frames |
|---|---|
| Departure | Silhouette collapses inward to a vertical line over 3 frames, then a 1-frame flash |
| Transit | Nothing. **The absence is the effect** |
| Arrival | Vertical line expands to silhouette over 2 frames, ground ring pulse, 1-frame flash |

Residual frames, where a character's identity calls for them: flat camera-facing cards along the path, spawned one per fixed distance, shattering back-to-front over 14 frames.

## Counter-hit effects

| Element | Spec |
|---|---|
| Sheet | Radial burst plus 4 radiating spikes |
| Flash | 2 frames, second frame tinted `#FFE9A0` |
| Rim | Both fighters flash white at 1.6 for 3 frames |
| Text | `COUNTER` in display face, arc-set, 12-frame hold |
| Audio | Double transient — the "double click" |

Punish counter adds 8 spikes, a ground crack decal, and a descending metallic ring used nowhere else in the game.

## Super attack effects

Three beats, universal across every super in the roster:

```
1. COMMITMENT   0.6 s   close on the fighter, world desaturates to 20%,
                        time nearly stops, aura ignites
2. EXPRESSION   2–4 s   bespoke. The character's thesis in one action
3. COST         0.8 s   return to the fighter, breathing, palette drained,
                        aura extinguishing
```

**Beat 3 is protected from cuts.** It is what separates our supers from the reference titles' — they show you the power, we show you what it took.

## Ultimate attack effects

Level 3 only. Adds over the super structure:

- Full stage substitution permitted — **skybox, LUT and fog only.** No geometry loads, no second stage. Cost ~6 MB, zero hitch. A designer writing "the arena transforms" means exactly this
- Camera released to an authored rail path, the only place roll is permitted
- Chromatic aberration to 0.006, radial blur to 0.080
- Impact frame extended to 3 frames at α 1.0
- Hitstop 20 frames on the final connect
- Character renders at emissive 0.8 for the duration

---

# Arena Direction

## Grammar — enforced, not advisory

```
        ┌─────────────────────────────┐
        │  BACKDROP     R+8 → ∞       │  parallax, dome
        │  ┌───────────────────────┐  │
        │  │ CAMERA SHELL          │  │  R+8 × 14 m — NO GEOMETRY INSIDE
        │  │  ┌─────────────────┐  │  │
        │  │  │ RING BAND 1.5 m │  │  │
        │  │  │ ┌─────────────┐ │  │  │
        │  │  │ │ COMBAT DISC │ │  │  │  PLANAR. Radius 5.1 m shipping
        │  │  │ └─────────────┘ │  │  │
        │  │  └─────────────────┘  │  │
        │  └───────────────────────┘  │
        └─────────────────────────────┘
                vertical clearance ≥ 12 m
```

**Camera shell, not camera collision.** Traditional collision lurches during combat, which in a fighter is a lost round. Forbidding geometry inside the shell costs zero runtime and one CI gate.

## Destruction

Three tiers:

| Tier | Affects gameplay | Status |
|---|---|---|
| A — simulated | yes | **not shipping** |
| B — reactive cosmetic | no | ships |
| C — scripted set-piece | no | supers and transitions |

**Tier A is deliberately empty.** Gameplay-affecting destruction makes arena collision mutable state that must be snapshotted and checksummed, changes matchup data mid-round, and makes second 5 play differently from second 55. No competitive fighter has been improved by it.

**Rollback rule:** destruction state commits on **confirmed frames only**. Predicted frames may play the impact VFX but not advance the prop's state. Destruction is keyed by `(frame, propID)` and is monotonic — a broken prop never returns.

Budget: ≤8 destructibles, ≤12 debris pieces each, 2.5 s lifetime, ground-plane collision only, never collides with characters, alpha-capped at 0.6 in the silhouette band.

## Dynamic lighting

Three-light rig, **identical on every stage**, tinted but clamped:

| Light | Stage authority |
|---|---|
| Key — directional, one shadow caster | direction ±35°, colour free, **intensity clamped 0.8–1.2×** |
| Fill — hemisphere, coloured | colour free, intensity 0.3–0.6× |
| Rim — axis-gated Fresnel | **none. locked** |

The rim being stage-immune is what lets one stage sit near-black in the silhouette band and another be a blown-out sunset while both fighters read identically.

**Shadows:** stylized projected ground planes at every tier, not cascades. Cost 0.15 ms against 1.4–2.8 ms, more on-model, and the radius/alpha falloff with height gives an exact airborne-height readout that a soft shadow actively obscures.

```
radius = 0.62 * (1 - clamp(height/4, 0, 0.75))
alpha  = 0.55 * (1 - clamp(height/4, 0, 0.85))
```

## Atmospheric FX

| Element | Method |
|---|---|
| Drifting debris | Instanced boxes, sine-driven bob, slow yaw. **Shipping** — 26 near, 9 pillars |
| Ash / motes | Instanced camera-facing quads, ≤200 mid tier |
| Ground haze | Single additive plane, scrolling noise, height-faded |
| Light shafts | 2–4 camera-facing textured quads with scrolling noise. **Never volumetrics** |

## Fog

Exponential-squared, colour matched to the horizon band, never grey. Near 8 m, far 17 m at the shipping camera range. Fog is the cheapest depth cue available and the reason the backdrop reads as distance rather than as a wall.

**Rule:** fog density is tuned so the fighters are never touched by it. If fog reaches the combat disc, the near plane moves — the fighters are never atmospheric.

## Volumetrics

**Prohibited.** Every volumetric read in this project is faked:

| Apparent effect | Actual method |
|---|---|
| God rays | 2–4 camera-facing textured quads, scrolling noise, additive |
| Dust in light | Instanced motes, brightness keyed to proximity to the key direction |
| Energy haze | Screen-space additive gradient, radial from the source |
| Depth murk | Exponential fog plus backdrop desaturation |

## Energy storms

Shipping in `Arena.tsx` as a dome shader. Two octaves of value noise on a polar-mapped dome, banded to the horizon:

```
uv    = vec2(atan(dir.z, dir.x) * 1.4, dir.y * 2.6)
churn = noise(uv*1.6 + t*0.03) + noise(uv*3.7 - t*0.05) * 0.5
band  = smoothstep(0.62, 0.06, abs(dir.y - 0.06))
sky  += stormColor * churn * band * 0.42
```

Zero texture fetches, one draw call, and it reads as weather.

## Skybox systems

| Layer | Method |
|---|---|
| Dome | Vertical gradient horizon→zenith, `pow(height, 0.75)` |
| Storm band | §Energy storms |
| Far silhouettes | Flat cards, single value, no shading, below 25% luminance |
| Parallax | ≤0.15 for tournament stages — a moving backdrop is a readability cost |

---

# Camera Direction

## Base framing

| Parameter | Value |
|---|---|
| Target | midpoint of both fighters, critically damped 0.12 s |
| Height | 1.60 m, tracks midpoint Y at 0.4 weight |
| Distance | `6.5 + 0.85 × separation`, clamped [7.0, 15.0] |
| FOV | 45° base → 55° at max separation → **38° on supers** |
| Pitch | −4° fixed |
| **Roll** | **0°. Always.** Only authored cinematics may roll |

Roll gets its own emphasis because it is the first thing a cinematographer reaches for and it destroys the player's ability to parse up from down at speed.

## Normal combat camera

Follows the framing above and nothing else. No shake beyond trauma decay, no automatic reframing, no dynamic FOV outside the separation curve. The neutral camera's job is to be invisible.

## Dash camera

| Element | Spec |
|---|---|
| FOV | +4° over 6 frames, returning over 14 |
| Distance | +0.4 m, damped |
| Radial blur | 0.012 from screen centre |
| Lead | Target biases 0.3 m toward the dash direction |

## Counter-hit camera

| Element | Spec |
|---|---|
| Push-in | 6% over 4 frames, held for the hitstop, released over 10 |
| Shake | trauma +0.38 |
| Time | hitstop extended 3 frames beyond the standard value |
| Aberration | 0.0015 for 4 frames |

## Super camera

Beat one pushes to 38° FOV and 0.7× distance over 8 frames. Beat two is authored per super. Beat three returns to neutral over 20 frames — **slowly**, so the cost beat has room.

## Ultimate cinematic camera

Released to an authored rail. The only context where roll, cuts and hand-held motion are permitted. Constraints that still apply:

- Both fighters framed at the first and last frame, whatever happens between
- Never crosses the combat axis more than once
- Returns to exactly the neutral framing on the final frame — no reframing snap after control returns
- Duration 3.8–4.6 s, hard cap

## Shake

```
trauma += impulse
trauma *= pow(0.88, deltaFrames)
shake   = trauma²                      // squared: subtle stays subtle
offset  = shake * 0.22 m * perlin(t * 22Hz)
```

**Positional only. Rotation is never shaken.** Accessibility scaling to 0.3× or 0.0× is honoured by every effect including cinematics — no carve-outs for spectacle.

---

# Post Processing

## Chain

```
scene (MRT: colour, emissive-L1, emissive-L2, depth, normal)
  │
  PASS 1 ── depth/normal edge detect → interior lines (mid/high)
  │
  PASS 2 ── bloom: emissive layers only, Kawase dual-filter
  │           L1 characters full · L2 stage × 0.45 ceiling
  │
  PASS 3 ── COMBINED: radial blur → chromatic aberration → lens distortion
  │           → bloom composite → LUT grade → vignette → grain → AA
  ▼
output
```

Budget: **2.9 ms measured against a 3.5 ms allocation** at 1080p mid tier. The riskiest number in the document; re-profiled every sprint.

## Bloom

**Kawase dual-filter**, 4 down / 4 up with a tent filter — roughly 40% cheaper than separable Gaussian at equivalent quality.

**There is no luminance threshold.** Bloom reads the emissive mask channel only. Luminance thresholding blows out bright cel values and turns every highlight into a glowing blob. This is the most common mistake in stylized bloom and we do not make it.

| Layer | Ceiling |
|---|---|
| L1 — characters, auras, energy | 1.00 |
| L2 — stage emissive | **0.45** |

Stage emissive is capped at ≤12% of screen area and ≤4% inside the silhouette band.

## Chromatic aberration

```
offset = strength * length(uv - 0.5) * (uv - 0.5)
r = sample(uv + offset) · g = sample(uv) · b = sample(uv - offset)
```

0.0 idle · 0.0015 heavy hit (4f) · 0.0035 super · **0.006 Clash freeze**.

## Lens distortion

Barrel, applied only during supers and ultimates. `k1 = 0.06` maximum, ramped over 8 frames. Never present in neutral — persistent distortion makes spacing unreadable and is a competitive complaint waiting to happen.

## Motion blur

**Per-object motion blur is prohibited.** It is photographic, it fights the stepped animation, and it costs a velocity buffer we do not have the budget for.

Motion is carried by **geometry smears** instead: 4–7 swap meshes per character bound to the same skeleton, shown for 1–3 frames, silhouette exaggerated 200–400% along the motion arc. Sculpted, not simulated.

## Radial blur

```
for i in 0..7: accum += sample(uv - dir * strength * (i/7))
```

| State | Strength | Centre |
|---|---|---|
| Dash | 0.012 | screen centre |
| Heavy impact | 0.028 (3f) | contact point |
| Super activate | 0.055 (8f) | character |
| Ultimate | 0.080 | character |

## Color grading

32³ LUT unwrapped to a 1024×32 strip, RGBA8. Twenty LUTs total — eight stage bases plus twelve event grades. Two sampled and lerped so transitions never pop. **2.5 MB total.**

| Event | Grade |
|---|---|
| Neutral | stage base |
| Clash freeze | desaturate to the accent channel only |
| Super | +12% saturation, lifted blacks |
| Ultimate | bespoke per character |
| Low health | crushed blacks, +8% red |

## Filmic tone mapping

**ACES is the wrong choice here.** It desaturates highlights toward white, which is exactly what destroys a colour-forward palette — a saturated energy effect turns into a white blob at the moment it should be most vivid.

Use a **custom filmic curve with a raised shoulder** that preserves highlight hue:

```
x    = max(0, colour - 0.004)
out  = (x * (6.2*x + 0.5)) / (x * (6.2*x + 1.7) + 0.06)
```

Then reintroduce saturation at 1.08× post-curve. The result clips gracefully without draining colour out of the brightest 15% of the frame, which is where all the spectacle lives.

Exposure is fixed. **No auto-exposure** — a camera that re-exposes when an effect fires makes the whole frame breathe and destroys readability.

---

# Replicating the Strive look in Three.js

Exactly what Strive does, and exactly how each piece maps.

| Strive technique | Three.js implementation | Cost | Status |
|---|---|---|---|
| Ramp-based banding with threshold control | `MeshToonMaterial` + `gradientMap` + `onBeforeCompile` bias injection | 1 texture fetch | **shipping** |
| Coloured shade band | Patched fragment, luminance-derived shade estimate → hue mix | ~6 ALU | **shipping** |
| Hand-edited vertex normals from primitive proxies | Blender Data Transfer modifier → custom split normals → glTF `NORMAL` | **zero** | pipeline defined, not executed |
| Inverted-hull outline, painted line weight | Second `BackSide` draw, width from vertex-colour alpha | 1 extra draw per zone | **shipping** (constant-pixel width) |
| Per-camera-angle rig cheating | 8 non-deform "cheat" bones driven at runtime from camera yaw | ~0 | **not started — must be in the rig contract before any character is rigged** |
| Stepped animation on 2s/3s | Mixer time set directly from `(stateId, stateFrame)`; glTF export with **Optimize Keyframes OFF** | zero | not started |
| Smear frames | Swap meshes on the same skeleton, visibility keyed | zero | not started |
| Impact frame | Full-screen white quad, 1 frame | trivial | **shipping** |
| Channel-painted shading control | RGBA control map: R shade bias, G spec mask, B outline width, A rim mask | 1 fetch | not started |
| 2D-composited effects | Sprite-sheet-first VFX doctrine | cheaper than particles | not started |

## What actually separates us from Strive today

Ranked by impact per hour invested:

1. **Rigged authored meshes.** Everything above is running on primitives. Even a purchased rigged character produces a bigger visual jump than every shader in this document combined.
2. **Stepped animation.** Currently interpolated. This is free to fix and changes the entire read.
3. **Drawn effect sheets.** Nobody has drawn one yet. The doctrine is written; the art is not.
4. **Cheat bones.** Must land in the rig contract before rigging starts — retrofitting is a full re-rig of the roster.
5. **Control maps.** Requires a texture-painting pass per character.

## What is genuinely done

Coloured shade, axis-gated rim, constant-pixel outlines, per-zone material families, unlit drawn eyes with catchlights, 7.3-head proportions, layered stage with storm dome, ground rings and drifting debris, refraction barrier shader, directional attack-cue hook.

The shading pipeline is not the bottleneck. **The assets are.**

---

**Sign-off:** Creative Director · Art Director · Graphics Director · Technical Art Director
