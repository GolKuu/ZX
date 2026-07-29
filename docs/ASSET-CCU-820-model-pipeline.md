# ASSET-CCU-820 — Ready-made models, our own animation

**Decision:** character *meshes* are acquired, not authored. Character *motion*
is authored, not acquired.

This reverses the plan in `CHR-CCU-810` §6–§8, which assumed we would model and
rig from scratch. That document remains valid as the art contract — it describes
what a good model for this game looks like, and it is the checklist you measure
a candidate asset against — but stages 6 and 7 are now a purchasing decision
rather than a production one.

**Why the motion stays ours.** A downloaded clip owns its own timeline. The
simulation owns the timeline here (rule R4), and move lengths come from
`src/data/combat-moves.ts`. A 34-frame downloaded punch cannot serve a move
whose frame data says 6 startup / 2 active / 13 recovery, and re-timing it every
balance change costs more than authoring the pose did. So clips inside the GLB
are ignored on load — see `src/stage/model/modelPose.ts`.

---

## 1. What the code already does

| File | Role |
|---|---|
| `src/stage/model/loadFighterModel.ts` | Loads the GLB, replaces vendor materials with our toon zones, builds the outline hull, fits the model to the rig's scale |
| `src/stage/model/humanoidBones.ts` | Maps whatever the vendor named the bones onto our canonical joint set |
| `src/stage/model/modelPose.ts` | **Our animation.** Every pose, driven by the simulation snapshot |
| `src/render/skinnedOutlineMaterial.ts` | Inverted-hull outline that deforms with the skeleton |
| `src/data/characterModels.ts` | Character → model URL |
| `src/stage/ModelFighter.tsx` | The component; falls back to the primitive blockout if the file is absent |

Nothing above needs editing to add a character. Drop the file in, point the
roster entry at it.

---

## 2. Where to get the models

| Source | Cost | Rigged | Notes |
|---|---|---|---|
| **Mixamo** (Adobe) | Free, Adobe account | ✅ humanoid | The default choice. Auto-rigger accepts your own mesh too |
| **Quaternius** | Free, CC0 | ✅ | Stylised, low-poly, no attribution required |
| **Kenney** | Free, CC0 | ✅ some | Very stylised, cleanest licensing of the free options |
| **Sketchfab** | Free + paid | mixed | **Filter by licence.** Many models are display-only |
| **VRoid Studio** | Free tool | ✅ | Generates a stylised rigged humanoid you configure. Exports VRM — convert to GLB |

### Licence check — do this before downloading, not after

- The licence must permit **use in a commercial or publicly deployed project**.
  "Personal use only" and "display only" do not.
- CC0 and CC-BY are fine; CC-BY requires an attribution line, so add it to the
  credits screen at the same time you add the model.
- **Do not use a model of an existing published character.** The standing
  constraint on this project is original IP. A downloaded fan model of a
  copyrighted character carries exactly the problem the original roster was
  designed to avoid.

> **Open item.** `src/data/characterRoster.ts` currently ships the display names
> "Roronoa Zoro" and "Avatar Aang". Those are copyrighted characters and they
> contradict the original-IP constraint that produced Sesa Nour / Void Walker.
> They need renaming to their original-roster equivalents before anything ships
> publicly.

---

## 3. Mixamo route — the fastest path to something on screen

```
1. mixamo.com → Characters → pick one → Download
2. Format:  FBX Binary (.fbx)
   Pose:    T-pose
   ⚠ Download the CHARACTER, not an animation. We do not use their clips.
3. Blender → File → Import → FBX
4. Delete any imported Action in the Dope Sheet (there should be none).
5. File → Export → glTF 2.0 (.glb), settings in §5.
6. Save to  public/models/<character>.glb
```

That is the whole path. If the character shows up posed and animated correctly,
stop here — the remaining sections are for tuning.

---

## 4. What makes a model a good fit

Measured against `CHR-CCU-810`:

| Check | Target | Why |
|---|---|---|
| Tri count | ≤ 32,000 | Outline pass renders the character twice |
| Bones | ≤ 64 deform | Keeps the uniform-array skinning fallback alive on old hardware |
| Influences per vertex | ≤ 4 | glTF format limit. More tears on rotation |
| Rest pose | T or A | Both work; poses are captured relative to rest |
| Separate mesh/material per zone | hair, skin, cloth, boots, eyes | This is what lets each zone take its own shadow hue |
| Textures | ≤ 1024², WebP | |

**The zone split is the one that actually matters.** A model shipped as a single
merged mesh with one material can only take one toon zone, so its hair shades
the same way as its boots and the palette in `CHR-CCU-810` §5 cannot be applied.
Prefer a model with separate materials even if it is otherwise the weaker asset.

Zone assignment is by keyword against the vendor's material and mesh names
(`hair`, `skin`, `body`, `coat`, `pant`, `boot`, `eye`, …). If a model uses
unusual names, add them to `ZONE_KEYWORDS` in `loadFighterModel.ts` — one line,
no other change.

---

## 5. Blender export settings

Only the settings that differ from the default matter:

```
Format                              glTF Binary (.glb)

Include  → Limit to Selected Objects        ON
         → Cameras / Punctual Lights        OFF

Transform → +Y Up                           ON

Data · Mesh → Apply Modifiers               ON
            → Tangents                      OFF   (no normal maps in toon)
            → Vertex Colors                 OFF

Data · Material → Images                    WEBP, quality 85

Data · Armature → Export Deformation Bones Only   OFF
                → Remove Armature Object          ON

Animation → Animation                       OFF   ← we author our own
```

**Animation OFF.** Exporting clips we never play just inflates the download.

Then, optionally:

```bash
npx gltf-transform optimize public/models/void-walker.glb \
  public/models/void-walker.glb \
  --compress meshopt --texture-compress webp --simplify false
```

`--simplify false` is required: the simplifier does not know the outline hull
depends on the exact silhouette and will quietly ruin it.

---

## 6. Adding a character

1. Put the file at `public/models/<name>.glb`.
2. Add the URL in `src/data/characterModels.ts`.
3. Reload. The console reports any unresolved bones by name.

`public/models/` is untracked — the assets are licensed downloads, not source.
Add it to `.gitignore` and keep a note of where each file came from and under
what licence.

---

## 7. Verification

Load the model and check in this order. Each failure points at exactly one
upstream cause:

| Check | Failure means |
|---|---|
| Stands on the floor, faces the opponent | Export orientation, or `+Y Up` was off |
| Height matches the primitive blockout | Nothing — scale is solved automatically from the bounding box |
| Outline is present and moves with the limbs | If it lags in bind pose, the model is skinned but the hull did not bind — check the console |
| Hair, skin and cloth shade in *different* hues | Zone keywords did not match; add them to `ZONE_KEYWORDS` |
| Arms swing forward/back, not sideways, when walking | Rig axes are unusual. See the note on parent-space rotation in `modelPose.ts` |
| Console lists no missing joints | Add aliases to `humanoidBones.ts` |

---

## 8. Known limits of the current animation layer

Stated plainly so they are not discovered as surprises:

- **Rotations are applied in parent space, not per-bone reference frames.** This
  is stable across rigs and needs no retarget step, but it is an approximation.
  On a rig with heavily rolled arm bones, an arm swing may carry a slight twist.
  The fix, if a specific model needs it, is a per-joint correction quaternion
  captured at load — not a rewrite.
- **No fingers, no facial animation.** The canonical joint set stops at the
  wrist. Hand poses would come from the model's own shape keys.
- **No cloth.** Coats and skirts ride their skinning weights only.
- **No IK.** Feet do not plant; on a stage that is a flat disc this is not
  currently visible.

None of these block the switch to rigged models, and all of them are cheaper to
add once a real asset is on screen than to design for in advance.
