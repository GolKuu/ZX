# GEN-CCU-830 — Generating the roster with a text-to-3D tool

Tripo, Meshy and Rodin all follow the same shape: prompt or image → mesh →
optional auto-rig → GLB. This document is the prompt set and the import
contract, so a generated character drops into `public/models/` and works on the
first try.

## 0. What these prompts describe

They describe **our** characters, from `CHR-CCU-810` and
`src/data/characterPalettes.ts` — not the reference art. Generating a 3D model
of a published character and shipping it in a deployed game is a materially
bigger exposure than a name in a menu: it is a derivative work of the design
itself, sitting in `public/` on a public URL.

That is also why the prompts below are worth more than a likeness would be.
They are written to the silhouette rules the renderer already exploits — zone
separation, a readable crown, a tall collar — so the toon shading and the
outline pass have something to work with.

---

## 1. The one setting that matters

**Ask for separate materials per region.** Everything else can be fixed later;
this cannot.

A generated mesh with one merged material resolves to a single toon zone, so
hair shades exactly like boots and the entire palette system collapses (this is
already the case with `element-sage.glb` — see `docs/MODEL-CREDITS.md`). Every
prompt below ends with an explicit material-separation instruction. Keep it.

Zone keywords the loader matches on, so name the materials accordingly:

```
hair · skin · coat / jacket / cloth · trousers / pants · boot / shoe · eye
```

Anything unmatched falls into a neutral `body` zone. New vendor names are one
line in `ZONE_KEYWORDS` in `src/stage/model/loadFighterModel.ts`.

---

## 2. Prompts

Each is written as a single paragraph, because these tools weight the front of
the prompt most heavily — the silhouette leads, the colour follows, the
material split closes.

### Void Walker — `void-walker.glb`

> Stylised cel-shaded male fighter, tall and lean, 8 heads tall, standing in a
> neutral A-pose. Near-white spiked hair fanning out radially in flat blades,
> wider than the shoulders. Tall standing collar covering the neck completely.
> Long dark indigo coat, front closure offset to the left, split into two panels
> at the hip and breaking at mid-thigh. Narrow dark visor band worn high on the
> brow, not covering the eyes. Large pale cyan eyes. Slim dark trousers, hard
> edged black dress shoes. Single small brass clasp at the collar, the only warm
> colour. Flat colour blocks, hard shading edges, no textures, no patterns.
> Separate materials named hair, skin, coat, trousers, boot, eye.

### Blade Phantom — `blade-phantom.glb`

> Stylised cel-shaded male fighter, broad shouldered and heavy set, 7.5 heads
> tall, neutral A-pose. Short cropped moss-green hair. Long dark green open
> overcoat worn over a bare chest, wide crimson waist wrap. Dark trousers tucked
> into tall black boots. Grounded, heavy stance, thick forearms. Flat colour
> blocks, hard shading edges, no textures. Separate materials named hair, skin,
> coat, trousers, boot, eye.

### Element Sage — `element-sage.glb`

> Stylised cel-shaded young monk fighter, slight and agile, 7 heads tall,
> neutral A-pose. Shaved head. Layered saffron and ochre robes, one shoulder
> bare, rust-red sash tied at the waist, loose pale trousers gathered below the
> knee. Soft cloth boots. Light, balanced stance. Flat colour blocks, hard
> shading edges, no textures. Separate materials named hair, skin, coat,
> trousers, boot, eye.

### Velocity King — `velocity-king.glb`

> Stylised cel-shaded male fighter, wiry and compact, 7.5 heads tall, neutral
> A-pose. Short bleached bone-white hair swept back. Close-fitting dark charcoal
> martial jacket with hot magenta piping along the seams and collar. Narrow dark
> trousers, low black boots. Aggressive forward-leaning build, narrow waist,
> long arms. Flat colour blocks, hard shading edges, no textures. Separate
> materials named hair, skin, coat, trousers, boot, eye.

### Elastic Brawler — `elastic-brawler.glb`

> Stylised cel-shaded male fighter, lean and rubbery, 7 heads tall, neutral
> A-pose. Short dark hair. Open crimson sleeveless vest, bare chest, wide
> straw-yellow sash. Loose blue knee-length trousers, simple sandals. Long
> disproportionate arms, relaxed loose-limbed stance. Flat colour blocks, hard
> shading edges, no textures. Separate materials named hair, skin, coat,
> trousers, boot, eye.

---

## 3. Rigging — do not skip this

**These tools output an unrigged mesh by default.** The renderer will load it,
scale it, shade it and then leave it standing perfectly still, because
`applyFighterPose` has no joints to drive. `npm run models:check` now says so
explicitly rather than letting you discover it in the browser.

Two routes:

| Route | Notes |
|---|---|
| The generator's own auto-rig | Fastest. Bone naming varies — see below |
| `mixamo.com/#/?page=rigging` | Upload the mesh, place the markers, download as FBX, convert in Blender. Produces `mixamorig:*` names, which already resolve |

If a generated rig uses names the resolver does not know, `models:check` prints
**the rig's actual joint names**. Paste them into
`src/stage/model/humanoidBones.ts` as aliases — one line per joint, no other
change anywhere. The resolver already covers Mixamo, VRoid/VRM (`J_Bip_*`),
Blender Rigify (`DEF-*`) and 3ds Max Biped (`Bip01 *`).

---

## 4. Import

```bash
# 1. Export GLB from the generator, rigged.
# 2. Drop it in:
mv ~/Downloads/whatever.glb public/models/void-walker.glb

# 3. Verify before opening the browser:
npm run models:check
```

That is all — `src/data/characterModels.ts` already points at these five
filenames. Scale is solved from the bounding box, materials are replaced with
the character's palette, and the skinned outline hull is built automatically.

**No animation is imported.** Clips inside the file are ignored on purpose: the
simulation owns the timeline (rule R4) and the motion is authored in
`src/stage/model/`. Turn animation export off if the tool offers it — it only
inflates the download.

---

## 5. Expect to iterate

Generated characters are weakest at exactly what a fighting game needs most:

- **Hands.** Usually fused blobs. Acceptable at match camera distance; the
  canonical joint set stops at the wrist anyway.
- **Silhouette extremities.** Hair spikes and coat panels get smoothed toward a
  blob. If the crown does not read at 128 px filled black (`CHR-CCU-810` §1.4),
  regenerate with the silhouette terms moved to the very front of the prompt.
- **Symmetry.** Auto-riggers fail on asymmetric meshes. If rigging fails,
  regenerate in a clean A-pose.

Budget three or four generations per character. That is normal for these tools
and still an order of magnitude cheaper than modelling to `CHR-CCU-810` §6 by
hand.

---

## 6. Automating it

Tripo and Meshy both have HTTP APIs that take the prompt and return a GLB, so
the five could be generated and downloaded by a script rather than by hand. That
needs an API key and it bills per generation, so it is not wired up here. If you
want it, drop a key in `.env.local` as `TRIPO_API_KEY` and it is a short script
against the prompts above.
