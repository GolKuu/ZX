# CHR-CCU-810 — Void Walker: Character Production Pipeline

**Character:** Sesa Nour — "Void Walker"
**Roster slot:** 1 of 5
**Status:** blockout in engine (`src/stage/voidwalker/`), authored mesh not started
**Owns:** everything from concept to the `.glb` the renderer loads
**Depends on:** `VIS-CCU-800` (rendering contract), `ART-CCU-400` (shader formulas)
**Consumed by:** `src/stage/voidwalker/*`, `src/data/combat-moves.ts`

---

## §0. How to read this document

Nine stages, each gated. A stage may not start until the one above it is signed
off, because every stage downstream inherits errors from the one above and the
cost of fixing them multiplies:

| Stage | Fix cost if caught here | Fix cost if caught at rig |
|---|---|---|
| Concept | 1 hour | — |
| Turnaround | 3 hours | — |
| Model | 1 day | — |
| Rig | — | 2 days + reweight |
| Animation | — | full re-export of every clip |

The gate is not bureaucracy. Proportions wrong at §2 means every animation in §8
is authored against a figure that has to be rebuilt.

### Units

All measurements are in **head units (HU)**, where 1 HU is the *height of the
head*, chin to crown of skull (hair excluded). Head units are scale-free, which
is why they survive the three coordinate systems this character passes through.

| Space | 1 HU equals | Full figure |
|---|---|---|
| Canonical / Blender | 0.247 m | 1.90 m to crown of skull |
| Engine | 0.34 units | 2.62 units to skull, 2.95 to hair crown |
| Resource file | `HEAD_UNIT * 2` | `HEAD = 0.17` is the head *radius* |

`voidWalkerResources.ts` expresses everything against `HEAD`, the head **radius**,
so `1 HU = 2 × HEAD`. Watch that factor of two — it is the single most common
transcription error between this document and the code.

**Import scale:** model at 1.90 m in Blender, export at scale 1.0, and apply
`SCALE_TO_ENGINE = 1.3776` once at load. One constant, one place. Do not bake the
scale into the mesh — it breaks physics units and every other tool that reads the
GLB.

---

## §1. Character Concept Sheet

### 1.1 Identity

| Field | Value |
|---|---|
| Name | Sesa Nour |
| Handle | Void Walker |
| Age read | Late twenties |
| Height | 1.90 m |
| Build | Lean, long-limbed, low mass. Reach fighter. |
| Archetype | Zoner / space-control. Wins by making distance meaningless. |
| Core mechanic | **Nullification** — a shell that refuses incoming space |
| Temperament | Unbothered. Amused. Never braces, never flinches first. |

### 1.2 The silhouette thesis

One sentence, and every later decision answers to it:

> **A pale crown and a black column.** The head is the widest, brightest thing
> in the upper silhouette; everything below it is a dark vertical with one
> violet seam.

Test: fill the character solid black at 5% screen height. If you cannot name the
character from the shape alone, the design has failed and no amount of shading
will recover it.

Silhouette carriers, in the order they read at fighting-game camera distance:

1. **Radial spike crown** — near-white, wider than the shoulders are deep. The
   only bright mass on the figure. It is the character's logo.
2. **Standing collar** — runs unbroken from the shoulder line to the jaw. Deletes
   the neck, which is what makes the head read as a separate floating shape.
3. **Long coat, split at the front** — breaks at mid-thigh, so the legs get
   something to cut through when they move.
4. **Hard-edged shoes** — no bulk below the knee. The taper is what sells height.

### 1.3 Colour identity

Three values, and only three, before any accent:

- **Near-white** — hair. The one high value.
- **Near-black indigo** — coat, trousers, shoes. The column.
- **Skin** — the only warm note, and it is a small area on purpose.

Then exactly one accent: **violet**, entering as coat seams and shadow tint, and
one signal: **cyan**, reserved for the eyes and the nullification effects. Cyan
never appears on cloth. That reservation is what makes the eyes read as lit from
inside rather than as a colour choice.

### 1.4 Design rules

**Do:**
- Keep the hair as flat blades, never round cones. Roundness reads as plastic.
- Keep the visor *angled* — it runs from high on the left brow to low on the
  right. A horizontal band is the shape to avoid; the tilt is the character.
- Let the eyes read through the visor. It is a filter, not a blindfold.
- Keep the coat matte. Only the visor and the shoes take a specular hit.

**Do not:**
- No pouches, straps, buckles, or belt-mounted gear. Every added object costs
  silhouette clarity and buys nothing at this camera distance.
- No gradient on the hair mass. Two values, one ramp step, hard edge.
- No emissive on cloth. The bloom budget belongs to the eyes and the effects.
- No horizontal blindfold, no straw hat, no eye-covering bandage.

### 1.5 IP separation — mandatory, non-negotiable

This character was developed from a mood board of existing published work. That
board is a **stylistic** reference for the rendering treatment only. The
following are the deliberate separations, and each one is load-bearing. Removing
any of them puts the project in legal jeopardy:

| Element | Reference convention | Void Walker | Why it separates |
|---|---|---|---|
| Eye covering | Opaque horizontal blindfold | **Angled translucent visor**, eyes visible through it | Different shape, different function, different read |
| Eye colour | Pale blue | **Cyan**, keyed to the nullification effect | Colour carries a mechanic, not an identity |
| Coat | Institutional uniform, high collar | **Field coat**, collar to the jaw, split front panels | Different garment class |
| Accent | Violet trim on black | **Violet structural seam**, not trim | Structure vs. decoration |
| Hair | White, swept | **White radial crown**, geometric blades | Different construction logic |
| Mechanic name | — | **Nullification** | Original term, original rules |

**Rules for everyone touching this character:**
- Never name the source work in an asset name, layer name, bone name, commit
  message, filename, or code comment.
- Never trace, project, or photo-reference a frame from the source. Silhouette,
  proportion and pose must be constructed from §2 and §4 of this document.
- The mood board lives outside the repository. Do not commit it.
- If a reviewer can identify the source character from the finished asset, the
  asset is rejected and returns to §1.

---

## §2. Turnaround Sheet

### 2.1 Proportion grid

Figure is **7.7 HU** to the crown of the skull. Hair adds 0.65 HU on top and is
*not* counted in the proportion figure — count it and you will build a character
who is short with tall hair.

Measured from the ground, in HU:

| Landmark | Height | Note |
|---|---|---|
| Ground | 0.00 | |
| Ankle | 0.35 | |
| Knee | 1.95 | Just under the quarter mark |
| Crotch | 3.55 | **Slightly below half.** Long legs, and this is where it comes from |
| Wrist (arms down) | 3.62 | Wrist and crotch align — the classic check |
| Navel | 4.35 | |
| Elbow | 4.55 | |
| Waist, narrowest | 4.60 | |
| Nipple line | 5.35 | |
| Shoulder line | 6.20 | |
| Chin | 6.70 | |
| Eye line | **7.15** | Mid-head. Not higher. |
| Crown of skull | 7.70 | |
| Hair crown | 8.35 | Not counted in the proportion figure |

Widths, in HU:

| Measure | Width | Ratio |
|---|---|---|
| Shoulder | 2.05 | 2.05 heads — lean, not heroic |
| Chest depth | 0.85 | |
| Waist | 1.30 | |
| Hip | 1.55 | Narrower than shoulder. Reads male, reads lean |
| Head width | 0.82 | Head is taller than wide |
| Spike crown, widest | 2.30 | **Wider than the shoulders.** Deliberate |

The last row is the whole design. The crown out-measuring the shoulders is what
makes the character read top-heavy and light, which is what a character who
ignores space should read as.

### 2.2 Head construction

Front view, head divided vertically into four bands of 0.25 HU:

| Band | Contents |
|---|---|
| 0.00–0.25 (crown) | Skull mass, hair root |
| 0.25–0.50 | Brow line at 0.42. **Visor band sits 0.34–0.56** |
| 0.50–0.75 | Eye line at 0.50, nose base at 0.72 |
| 0.75–1.00 | Mouth at 0.84, chin at 1.00 |

Eye line at exactly mid-head. Every stylisation error in a head starts with the
eye line drifting up.

**Eyes** are 0.22 HU wide, one full eye-width apart, outer corner 0.06 HU inside
the skull silhouette. They are **1.6× the size a realistic head would carry** —
that oversizing is intentional and is the primary style signal (`VIS-CCU-800`
§2.4). Do not moderate it.

**Visor** crosses the face at **11° from horizontal**, high on the character's
left. Depth 0.22 HU at the centre, tapering to 0.16 at the temples. It wraps the
brow on a cylinder of radius 1.04 × head radius — it is an arc, never a flat
plate. The strap closes behind the skull under the hair mass and is 0.05 HU thick.

### 2.3 Hair construction

The crown is **one mass plus eleven blades**. Never model it as loose strands.

- **Mass**: a sphere at 1.1 × head radius, flattened to 0.92 in Y, seated 0.24 HU
  back from the face plane. It exists so the spikes have a root and so the
  silhouette closes when spikes overlap.
- **Blades**: four-sided cones, 0.6 HU base to 1.7 HU tip, arranged radially.
  Distribution: five along the rear arc, three on each temple. Angles fan from
  −38° to +38° off vertical.
- **Rule**: no two adjacent blades share a length. Vary by at least 12%. Equal
  lengths read as a fan, not as hair.
- **Fringe**: three shorter blades, 1.0 HU, falling forward over the visor line.
  They overlap the visor by 0.1 HU. That overlap is what ties the head together
  into one shape instead of two stacked ones.

### 2.4 Views to deliver

| View | Purpose | Must show |
|---|---|---|
| Front | Symmetry, widths | Proportion grid overlaid, all landmarks labelled |
| Side | Depth, posture | Spine curve, chest depth, spike depth, coat break |
| Back | Coat, hair rear | Collar rear seam, strap, rear blade arrangement |
| 3/4 | The read the player gets | This is the camera angle. If it fails here, it fails |
| Head ×4 | Modelling reference | Front, side, 3/4, top-down for spike layout |

The 3/4 is the acceptance view. The engine camera never shows the character
front-on, so a turnaround that only works front-on has not been checked.

---

## §3. Expression Sheet

The face has **three controls** and no more: brow angle, lid aperture, mouth
shape. That is enough for every expression below, and keeping it to three is
what makes the rig cheap and the shapes readable at distance.

Values are per side where relevant. Brow angle is positive when the inner end
rises.

| # | Expression | Brow (in/out) | Lid aperture | Mouth | Engine state |
|---|---|---|---|---|---|
| 1 | **Neutral / idle** | −4° / −2° | 0.75 | Flat, corners +2° | `idle` |
| 2 | **Amused** — the default | −8° / 0° | 0.65 | Asymmetric, right corner +9° | `idle` variant, 20% |
| 3 | **Focus** | −16° / −8° | 0.55 | Flat, compressed | `attack startup` |
| 4 | **Effort** | −20° / −12° | 0.40 | Open, lower teeth | `attack active` |
| 5 | **Impact** | +14° / +6° | **1.00** | Wide open, corners down | `hitstun` |
| 6 | **Guard** | −12° / −6° | 0.45 | Flat, jaw set | `blockstun` |
| 7 | **Strain** | +8° / −4° | 0.30 | Clenched, corners down | `low health` |
| 8 | **Defeat** | +18° / +10° | 0.15 | Slack, open | `KO` |
| 9 | **Victory** | −10° / +2° | 0.60 | Full asymmetric, +14° | `win` |

Notes that decide whether this reads:

- **Expression 5 is the money frame.** Impact is the only state where the lid
  goes fully open and the brow inverts. It lasts 4–6 frames and it is the single
  clearest signal in the game that a hit landed. Overshoot it.
- **The mouth is asymmetric in every positive state.** Symmetric smiles read as
  dead. The right corner always leads.
- **The visor does not hide expression.** Brows sit *above* the visor line and
  carry most of the read. This is precisely why the visor is angled and thin —
  a full blindfold would cost the entire expression system.
- **Catchlights are placed, not simulated.** Two per eye: a large one upper-left,
  a small one lower-right. They never move with the light. In expression 8 the
  large catchlight is removed — losing the catchlight is how a face reads as out.

---

## §4. Combat Pose Sheet

### 4.1 Pose principles

- **Line of action first.** Every key pose is one continuous curve from the
  trailing foot to the leading hand. Draw the line, then hang the body on it.
- **Hips and shoulders never parallel.** Minimum 12° of counter-rotation in every
  pose, including idle. Parallel lines are what make a rigged model read as a
  mannequin.
- **Weight is always declared.** One foot carries. Name which one before posing.
- **Silhouette test on every key pose.** Solid black, 5% height, still readable.

### 4.2 The five defining poses

**1. Idle stance** — *the pose the player sees for 80% of the match*

Weight 70% rear foot. Feet 1.4 HU apart, lead foot turned 20° out. Hips rotated
14° away from the opponent, shoulders rotated 8° toward — 22° of counter-rotation,
the most in any pose. Lead arm hangs, relaxed, slightly forward. Rear hand rests
in the coat pocket. Chin lifted 6°, head turned 10° toward the opponent.

The pocket is the character. It says *I do not need my hands yet*. It also gives
the arm somewhere to be that is not "hanging like a doll", which is the failure
mode of every idle.

**2. Forward key (`5M`)** — *the medium poke, the most-used offensive frame*

Line of action: rear heel through hip, spine, to the extended hand — one C curve.
Full extension of the lead arm, hand open, fingers spread. Weight transfers to
the lead foot across startup. Rear arm counterweights back and low. Shoulder
rotation 24° into the strike; the shoulder leads the hand by 2 frames.

**3. Launcher** — *the vertical, the combo opener*

Line of action inverts to a reverse C. Rising motion from a compressed crouch:
frame 1 is the lowest the character ever gets (crotch drops 0.6 HU). Lead arm
sweeps upward past the head. Trailing leg extends fully. Head tilts back 12°,
eyes track upward — the eyes must lead the motion or the launch reads as
disconnected from intent.

**4. Nullification stance** — *the mechanic pose, the character's signature*

Both feet flat, weight centred — the **only** pose with even weight, and it is
even on purpose: this is the one moment the character is immovable. Hips and
shoulders square to the opponent, breaking the counter-rotation rule, which is
what makes it read as unnatural and deliberate. Lead hand raised palm-out at
chest height, fingers relaxed. Chin down 8°, eyes up through the brow.

The whole pose is a refusal. Nothing about it is a fighting stance, and that is
the point.

**5. Super — "Collapse"** — *the cinematic, three seconds of screen time*

Three beats:
- **Wind-up (18 f)** — body compresses toward the lead hand, coat pulls inward,
  hair pulled toward the palm. Everything converges.
- **Hold (6 f)** — absolute stillness. Zero movement on any bone. The pause is
  what makes the release land.
- **Release (24 f)** — full extension, back arched 20°, arms wide, coat blown
  fully back, every hair blade pushed radially outward.

Convergence, stillness, explosion. Skip the hold and the super becomes noise.

### 4.3 Pose sheet deliverable

Author these as posed silhouettes before any animation: idle, walk contact,
walk pass, `5L` active, `5M` active, `5H` active, `2M` active, launcher peak,
jump apex, block, hitstun, knockdown, wake-up, nullification, super ×3 beats,
win. Seventeen poses. Every animation in §8 interpolates between members of this
set — authoring them first is what keeps the character on-model across clips.

---

## §5. Material Sheet

Zones are **hard-partitioned by material**. No zone shares a material with
another, because each one needs its own shadow hue. A shared grey multiply across
zones is the single largest difference between "3D model with a ramp" and "cel"
(`ART-CCU-400` §A2, `VIS-CCU-800` §3.2).

| Zone | Base | Shadow tint | Shadow str. | Rim str. | Ramp step | Outline | Bloom |
|---|---|---|---|---|---|---|---|
| Hair | `#f2f0fb` | `#9b93d6` lilac | 0.80 | 1.00 | 0.52 | 1.4 px | no |
| Skin | `#e8c3a4` | `#9c6a8a` plum | 0.70 | 0.62 | 0.50 | 1.1 px | no |
| Coat | `#1c1938` | `#4a2b8e` violet | 0.85 | 0.85 | 0.46 | 1.6 px | no |
| Coat seam | `#3f2a78` | `#6d3fd0` violet | 0.80 | 0.90 | 0.46 | 0 px | no |
| Collar | `#1c1938` | `#4a2b8e` violet | 0.90 | 0.95 | 0.44 | 1.6 px | no |
| Trousers | `#161327` | `#33265e` indigo | 0.80 | 0.70 | 0.48 | 1.4 px | no |
| Shoe | `#0e0c18` | `#2a2140` indigo | 0.75 | 1.10 | 0.40 | 1.4 px | no |
| Cuff | `#e9ecf7` | `#8f9ac4` cool | 0.65 | 0.80 | 0.52 | 1.0 px | no |
| Visor | `#15121f` | `#2b2352` violet | 0.60 | **1.40** | 0.36 | 1.2 px | no |

**Unlit zones** — drawn elements, not surfaces. No ramp, no rim, no shadow, no
outline pass. They keep the same read at every light angle, which is why the gaze
never disappears in a dark stage:

| Zone | Colour | Note |
|---|---|---|
| Sclera | `#f8fbff` | Never pure white — pure white flattens against bloom |
| Iris | `#7fe4ff` | The cyan reservation. Nothing else on the body uses it |
| Pupil | `#0a1c2e` | Not black. Black kills the iris edge |
| Catchlight | `#ffffff` | The only pure white on the character |
| Line art | `#241a2e` | Lids, brows. Violet-black, never neutral black |

### 5.1 Material rules

- **Shadow tint is never a desaturated version of the base.** It is a *hue shift*.
  Skin shades toward plum, white hair toward lilac, black cloth toward violet. If
  the shadow hue equals the base hue, the zone is misconfigured.
- **Visor rim strength is 1.40 — the highest on the character** and the only
  value above 1.0. The visor's whole job is to catch one hard specular band. That
  band is the character's most recognisable single pixel run.
- **No zone is emissive.** The bloom budget is spent entirely on eyes and effect
  meshes. Emissive cloth is the fastest way to make a stylised character look
  cheap.
- **Outline widths are in screen pixels** and constant with depth
  (`src/render/outlineMaterial.ts`). They do not scale with distance.

---

## §6. Blender Modeling Guide

### 6.1 Scene setup — do this before the first vertex

```
Scene Properties → Units
  Unit System:    Metric
  Unit Scale:     1.0
  Length:         Meters

Transform (N panel), on every object before export:
  Location   0, 0, 0
  Rotation   0, 0, 0
  Scale      1, 1, 1        ← Ctrl+A → All Transforms
```

Character faces **−Y** in Blender. The GLB exporter converts to the engine's
**+Z forward**. Build facing −Y and the conversion is free; build facing anything
else and you will spend an afternoon on a 90° rotation that keeps reappearing.

Import the §2 turnaround as reference images on the Front and Right orthographic
views, scaled so the crown of the skull sits at exactly 1.90 m.

### 6.2 Blockout — match the engine first

Build the blockout from the primitives already in
`src/stage/voidwalker/voidWalkerResources.ts`. That file is the contract: it is
what the rig anchors are tuned against, and the authored mesh must occupy the
same volume or every animation offset shifts.

Anchor points, in engine units, from `resetZoroRig`:

| Anchor | Y |
|---|---|
| Hips | 0.92 |
| Shoulders | 1.82 |
| Head | 2.45 |

Blockout order, and do not skip ahead: torso → head → legs → arms → coat → hair.
The coat comes after the legs because it has to be cut against a real leg volume.
The hair comes last because it is authored to the finished skull.

Sign-off gate: silhouette test at 5% screen height, from the 3/4 view, against
the §1.2 thesis. Fail here and no later stage recovers it.

### 6.3 Topology

| Region | Target tris | Rule |
|---|---|---|
| Head + face | 2 400 | Edge loops around eyes and mouth, quads only |
| Hair | 3 200 | Cards, not tubes. See §6.4 |
| Torso + coat | 3 600 | Loop at every joint that bends |
| Arms ×2 | 1 800 | Three loops per elbow |
| Legs ×2 | 2 200 | Four loops per knee, three per ankle |
| Shoes ×2 | 800 | Hard edges, no subdivision |
| Visor | 400 | |
| Eyes ×2 | 600 | |
| **Total** | **15 000** | Ceiling. Six characters on screen never happens; two do |

Rules:
- **Quads everywhere** except where a triangle terminates a loop. Zero n-gons.
- **Three edge loops minimum at every deforming joint.** Two produces the
  collapsed-elbow artefact that no amount of weight painting fixes.
- **Face loops must be concentric** around each eye and around the mouth. This is
  what makes the §3 expressions possible at all.
- **Mirror modifier** on the whole body until §7. Apply it only at rig time.
- **No subdivision surface.** The look is faceted by design. Subdivision fights
  the ramp and softens exactly the edges the style depends on.

### 6.4 Hair — the part that decides whether this works

Hair is **cards**, and the cards are what make or break the character.

- Each blade is a flat card, 2 quads wide × 4 long, with a slight twist along its
  length so it catches the ramp differently from its neighbours.
- **Custom normals, transferred from a proxy sphere.** This is not optional. Card
  normals point every direction and produce shading noise; transferred normals
  make the whole crown shade as one volume with one clean terminator.
  `Object → Data Transfer → Face Corner Data → Custom Normals`, source = a UV
  sphere at 1.15 × head radius, then `Data → Normals → Auto Smooth` off.
- The mass sphere is a separate object with the same material, unsubdivided.
- Blades overlap the mass by 0.15 HU so the silhouette closes.
- No alpha textures anywhere. Every blade is opaque geometry. Alpha-tested hair
  costs fill rate and produces sorting artefacts on the outline pass.

### 6.5 UVs

One 2048² atlas, one material per §5 zone:

| Region | UV area | Rationale |
|---|---|---|
| Face | 30% | Eyes and brows carry the character. Over-allocate |
| Hair | 22% | |
| Coat | 20% | |
| Limbs | 16% | |
| Shoes, visor, misc | 12% | |

- Seams hidden along the coat's structural seams and the inside of the limbs.
- Face UVs symmetric and *not* mirrored — the face wants asymmetric detail later.
- Texel density even across the body except the face, which gets 1.5×.

### 6.6 Model checklist

- [ ] All transforms applied, origin at world zero, between the feet
- [ ] Mirror applied, mesh manifold, no interior faces
- [ ] Normals outward (`Shift+N`), custom normals present on hair
- [ ] Zero n-gons, quad-dominant, under 15 000 tris
- [ ] Material slots named exactly per §5 zone names
- [ ] Silhouette test passed from 3/4 at 5% height
- [ ] Proportion check: eye line at mid-head, wrist aligns with crotch

---

## §7. Rigging Guide

### 7.1 The cheat-bone contract — read before placing a single bone

Stylised characters do not deform correctly with an anatomical skeleton, and the
fix cannot be retrofitted. **These bones must exist before weighting begins.**
Adding them afterwards means a full reweight, which is the single most expensive
mistake available in this pipeline.

| Cheat bone | Parent | Purpose |
|---|---|---|
| `cheat_shoulder.L/R` | `spine.003` | Fixes shoulder collapse above 90° raise |
| `cheat_elbow.L/R` | `upper_arm` | Preserves elbow volume at full bend |
| `cheat_knee.L/R` | `thigh` | Same, for the knee |
| `cheat_hip.L/R` | `hips` | Stops the crotch pinching at high kicks |
| `cheat_scale_hand.L/R` | `forearm` | Scales the hand 1.0→1.4 on reaching attacks |
| `cheat_scale_foot.L/R` | `shin` | Same, for kicks |

The two scale bones are what produce the exaggerated reach the reference
treatment depends on — the hand grows through a punch and returns. This is a
drawn convention, and it is *why* the hand in the reference material is larger
than anatomy allows. It cannot be faked in the shader.

### 7.2 Bone hierarchy

```
root                        world, animation-locked
└─ root_motion              horizontal travel only, Y locked
   └─ hips                  0.92
      ├─ spine.001          1.15
      │  └─ spine.002       1.42
      │     └─ spine.003    1.68
      │        ├─ neck      2.20
      │        │  └─ head   2.45
      │        │     ├─ hair_root       ×4 chains, 2 bones each
      │        │     ├─ visor           parented, not deformed
      │        │     ├─ brow.L/R        expression
      │        │     ├─ lid_upper.L/R   expression
      │        │     ├─ lid_lower.L/R   expression
      │        │     ├─ eye.L/R         aim target
      │        │     └─ jaw             expression
      │        ├─ cheat_shoulder.L/R
      │        │  └─ shoulder.L/R
      │        │     └─ upper_arm.L/R
      │        │        ├─ cheat_elbow.L/R
      │        │        └─ forearm.L/R
      │        │           └─ hand.L/R
      │        │              ├─ cheat_scale_hand.L/R
      │        │              └─ finger.01–03.L/R    3 chains, simplified
      │        └─ collar_bone           1 bone, follows spine.003 at 0.6
      ├─ cheat_hip.L/R
      │  └─ thigh.L/R
      │     ├─ cheat_knee.L/R
      │     └─ shin.L/R
      │        └─ foot.L/R
      │           ├─ cheat_scale_foot.L/R
      │           └─ toe.L/R
      └─ coat_front.L/R     3 bones each   ┐
         coat_back.L/R      3 bones each   ┴ 12 total, physics-driven
```

**Total: 68 bones.** Budget ceiling is 80. Every bone past 80 costs skinning time
on the mobile target for deformation nobody sees at this camera distance.

### 7.3 Orientation and naming

- **Naming is a hard contract.** `.L`/`.R` suffixes exactly as written — the
  exporter, the retargeter and the engine's clip loader all key off them.
- All bone roll normalised: `Armature → Recalculate Roll → Global +Z`.
- Bone Y axis points down the chain, always.
- **No bone named after the source character or the source work.** See §1.5.

### 7.4 Weighting

- Start from `Automatic Weights`, then fix by hand. Automatic is a starting point,
  never a result.
- **Maximum 4 influences per vertex.** The GLB spec supports more; the engine's
  skinning path does not. Run `Weights → Limit Total → 4` before export.
- Normalise all weights. An unnormalised rig produces vertices that shrink
  toward origin under rotation, which shows up as a hole in the mesh mid-swing.
- **Hair blades are rigid.** One bone, weight 1.0, no blending. Hair that
  deforms reads as rubber.
- **The visor is rigid to `head`.** Weight 1.0. It never bends.
- **Coat bones blend at 0.3 to the parent** so the coat trails rather than
  following rigidly.
- The collar takes 0.6 from `spine.003` and 0.4 from `neck` — that ratio is what
  lets the head turn without tearing the collar open.

### 7.5 Constraints, and what happens to them

Author with IK on the legs and arms, and with an eye-aim constraint on
`eye.L/R`. All of it makes animating tractable.

**Every constraint must be baked to FK before export.** GLB carries no
constraints. The bake step is in §9.2, and skipping it produces a character that
animates perfectly in Blender and stands in a T-pose in the browser.

### 7.6 Rig checklist

- [ ] All six cheat-bone pairs present **before** weighting started
- [ ] 68 bones, none above 80, all named per §7.3, none named after the source
- [ ] Rolls normalised, Y down-chain
- [ ] Max 4 influences per vertex, weights normalised
- [ ] Rest pose is A-pose, arms 40° from horizontal
- [ ] Range-of-motion test: full flexion on every joint with no volume collapse
- [ ] Shoulder raised to 170° without collapse — the hardest case, test it first

---

## §8. Animation Guide

### 8.1 The core principle

The reference treatment does not run on 60 frames per second of smooth
interpolation. It runs on **stepped keys, held poses and smears**. This is the
part that transfers from the reference material; frame-copying does not and must
not happen (§1.5). What you are copying is *timing*, not drawings.

| Motion type | Step | Rationale |
|---|---|---|
| Idle, breathing | On 3s (20 fps) | Calm, holds still, reads as drawn |
| Walk, run | On 2s (30 fps) | Standard for the treatment |
| Attack startup | On 2s | |
| Attack active frames | **On 1s** | The impact frame must be exact |
| Impact, hitstun | On 1s | |
| Super cinematic | Mixed — see §4.2 beat 5 | |

Set stepped output in the export, not in the curves — §9.1.

### 8.2 Frame budgets — bound by the simulation, not by taste

Animation length is not a creative choice. It is dictated by
`src/data/combat-moves.ts`, and a clip that disagrees with its frame data is a
bug, not a style decision:

| Move | Startup | Active | Recovery | Total | Animation note |
|---|---|---|---|---|---|
| `5L` | 6 | 2 | 8 | 16 | Almost no anticipation. 2 f wind-up maximum |
| `5M` | 9 | 3 | 14 | 26 | 3 f anticipation, 1 f smear into active |
| `5H` | 13 | 4 | 22 | 39 | Full 5 f anticipation, 2 f smear, 3 f hold on impact |

Rules that follow from those numbers:

- **The active frame must be the most extended pose in the clip.** Not the frame
  before, not the frame after. Players read the extreme as the hit.
- **Anticipation is capped by startup.** A 6-frame startup cannot carry a 5-frame
  wind-up — the character would still be winding up when the hitbox is live.
- **Recovery is where the character returns to on-model.** Never leave a pose
  drifting at the end of recovery; the next clip blends from it.

### 8.3 Smears

One or two frames, on the transition into an active frame. Two techniques:

1. **Geometry smear** — scale `cheat_scale_hand` to 1.4 and stretch the forearm
   along its Y by 1.6 for a single frame. This is what the cheat bones exist for.
2. **Multiple-image smear** — a duplicate limb mesh at 40% opacity, one frame
   only, offset back along the arc.

The smear frame is never held. One frame, two at the absolute maximum. Three
reads as a mistake.

### 8.4 Clip list

| Clip | Frames | Loop | Step |
|---|---|---|---|
| `idle` | 90 | yes | 3s |
| `idle_amused` | 120 | yes | 3s |
| `walk_fwd` / `walk_back` | 32 | yes | 2s |
| `dash_fwd` / `dash_back` | 20 | no | 2s |
| `jump_rise` / `jump_fall` / `land` | 12 / — / 8 | no | 2s |
| `5L` / `5M` / `5H` | 16 / 26 / 39 | no | 2s→1s |
| `2L` / `2M` / `2H` | per frame data | no | 2s→1s |
| `launcher` | 34 | no | 1s |
| `block_stand` / `block_crouch` | 8 | hold | 2s |
| `hitstun_light` / `_heavy` | 12 / 20 | no | 1s |
| `knockdown` / `wakeup` | 28 / 22 | no | 2s |
| `nullify_enter` / `_hold` / `_exit` | 10 / 60 / 8 | mid loops | 3s |
| `super_windup` / `_hold` / `_release` | 18 / 6 / 24 | no | mixed |
| `win` / `ko` | 120 / 45 | win loops | 3s |

**31 clips.** That is the full character.

### 8.5 Curve rules

- **F-curve interpolation: Constant** on everything except the super release and
  the coat bones. Constant interpolation *is* the stepped look.
- **Coat and hair bones interpolate on Bezier** — secondary motion is the one
  place smoothness helps, because it contrasts against the stepped body.
- **No auto-smoothing, ever.** `Key → Interpolation Mode → Constant` on the whole
  channel box, then adjust the exceptions.
- **Root motion is horizontal only.** Y stays locked; the simulation owns
  vertical position, and an animation that moves the character in Y will fight
  the physics and lose visibly.
- **Every clip starts and ends on-model.** Frame 1 and frame N must both be a
  pose from the §4.3 sheet, or blending between clips will pop.

---

## §9. GLB Export

### 9.1 Export settings — exact

```
File → Export → glTF 2.0 (.glb/.gltf)

Format:                 glTF Binary (.glb)

Include
  Limit to:             Selected Objects        ✓
  Data → Custom Properties                      ✗
  Data → Cameras                                ✗
  Data → Punctual Lights                        ✗

Transform
  +Y Up                                         ✓

Data → Mesh
  Apply Modifiers                               ✓
  UVs                                           ✓
  Normals                                       ✓
  Tangents                                      ✗   (no normal maps)
  Vertex Colors                                 ✗
  Loose Edges / Loose Points                    ✗

Data → Material
  Materials:            Export
  Images:               Automatic
  Image Format:         WEBP
  Image Quality:        85

Data → Shape Keys                               ✗   (bone-driven expressions)

Data → Armature
  Use Rest Position                             ✗
  Export Deformation Bones Only                 ✗   ← cheat bones must survive
  Remove Armature Object                        ✓

Animation
  Animation Mode:       Actions
  Bake All Objects Animations                   ✓
  Sampling Rate:        1
  Optimize Animation Size                       ✗   ← destroys stepped keys
  Force keeping channels for bones              ✓
  Export Deformation Bones Only                 ✗
```

Two settings are non-obvious and both are load-bearing:

- **`Optimize Animation Size` off.** It removes "redundant" keys, and stepped
  animation is *entirely* redundant keys. Leaving it on smooths the character
  back into interpolated motion and silently deletes the style.
- **`Export Deformation Bones Only` off.** The cheat scale bones do not deform in
  the classic sense and get stripped by that flag.

### 9.2 Pre-export bake — mandatory

```
1. Select armature → Pose Mode → Select All
2. Pose → Animation → Bake Action
     Visual Keying          ✓
     Clear Constraints      ✓
     Clear Parents          ✗
     Bake Data              Pose
     Frame range            per clip
3. Verify: every clip plays identically with all constraints muted
4. Apply all transforms on all meshes  (Ctrl+A → All Transforms)
5. Limit Total → 4 on every mesh's weights
```

Step 3 is the check that catches the most common failure in this whole document.
If a clip changes when constraints are muted, the bake did not take, and the
character will T-pose in the browser.

### 9.3 Naming contract

The engine's loader keys off these names. They are case-sensitive:

| Object | Name |
|---|---|
| Armature | `VoidWalker_Rig` |
| Body mesh | `VoidWalker_Body` |
| Hair mesh | `VoidWalker_Hair` |
| Eye meshes | `VoidWalker_Eye_L`, `VoidWalker_Eye_R` |
| Visor | `VoidWalker_Visor` |
| Materials | Exactly the §5 zone names, prefixed `VW_` |
| Actions | Exactly the §8.4 clip names, lower snake case |

### 9.4 Budget

| Metric | Target | Ceiling |
|---|---|---|
| File size | 2.5 MB | 4 MB |
| Triangles | 15 000 | 18 000 |
| Bones | 68 | 80 |
| Materials | 9 toon + 5 unlit | 16 |
| Draw calls | 14 | 20 |
| Texture | one 2048² WEBP | 2048² |

Ceiling is the hard budget for the mobile target. Two characters plus the arena
must fit the frame budget in `src/stage/FrameProfiler.tsx`.

### 9.5 Validation

Run before the file enters the repository:

```bash
npx gltf-validator VoidWalker.glb          # zero errors, zero warnings
npx gltfpack -i VoidWalker.glb -o VoidWalker.opt.glb -cc
```

Then in-engine:

- [ ] Loads without console warnings
- [ ] Bind pose matches the blockout volume — overlay against
      `voidWalkerResources.ts` primitives, no limb outside its capsule
- [ ] All 31 clips present and named per §9.3
- [ ] Stepped clips are still stepped — scrub `5H` frame by frame and confirm
      the pose does not change on in-between frames
- [ ] Materials bind to the §5 toon materials, not to the imported PBR ones
- [ ] Outline pass renders on body zones, absent on eye meshes
- [ ] Silhouette test at 5% screen height, in engine, from the game camera
- [ ] Frame budget holds with two characters on screen

### 9.6 Loader contract

```
public/models/void-walker.glb
```

Loaded via `GLTFLoader` + `DRACOLoader`, materials **replaced** on load — the
imported PBR materials are discarded and the §5 toon materials are bound by
material name. Never render the PBR materials the exporter produces; they carry
none of the shading contract in `VIS-CCU-800`.

---

## §10. Acceptance

The character is done when all nine gates are signed:

| # | Stage | Gate |
|---|---|---|
| 1 | Concept | Silhouette thesis passes at 5%; §1.5 separations all present |
| 2 | Turnaround | Proportions match §2.1 within 2%; 3/4 view approved |
| 3 | Expressions | All 9 readable at 5% height; impact frame overshoots |
| 4 | Poses | 17 poses, all pass silhouette, all obey counter-rotation |
| 5 | Materials | 9 zones, every shadow tint hue-shifted, none grey |
| 6 | Model | §6.6 checklist complete |
| 7 | Rig | §7.6 checklist complete; cheat bones predate weighting |
| 8 | Animation | 31 clips, frame counts match `combat-moves.ts` exactly |
| 9 | Export | §9.5 validation clean, budget held |

---

## Appendix A — Current state

| Stage | Status |
|---|---|
| 1–5 | **This document.** Sheets to be drawn from these specifications |
| 6 | Blockout live in `src/stage/voidwalker/`; authored mesh not started |
| 7 | Not started. Cheat-bone contract §7.1 must land first |
| 8 | Not started. Blockout animation running on the shared rig |
| 9 | Not started |

The blockout in `src/stage/voidwalker/` is a stand-in that satisfies §1.2 and
§2.1 well enough to play against. It is not a substitute for §6 — an authored
rigged mesh produces a larger visual step than every shader in `VIS-CCU-800`
combined, and it is the highest-leverage remaining task on the project.
