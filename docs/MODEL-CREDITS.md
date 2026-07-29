# Character model credits and provenance

`public/models/` is **gitignored**. These files are fetched locally, not
redistributed by this repository. Anyone setting up the project runs the fetch
below.

## Current models

| File | Source asset | Origin | Notes |
|---|---|---|---|
| `void-walker.glb` | `Xbot.glb` | three.js `examples/models/gltf` | Mixamo "X Bot" mannequin. 67 joints, 2 meshes |
| `blade-phantom.glb` | `Soldier.glb` | three.js `examples/models/gltf` | Mixamo "Vanguard". 49 joints, 2 skins |
| `element-sage.glb` | `Michelle.glb` | three.js `examples/models/gltf` | Mixamo character. 65 joints, single mesh |

All three originate from **Adobe Mixamo**. Mixamo's terms permit use of its
characters in projects, including commercial ones, without attribution or
royalties. They do **not** permit redistributing the raw character files as
assets in their own right — which is why `public/models/` stays out of version
control and each developer fetches their own copy.

## Fetch

```bash
mkdir -p public/models
base=https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf
curl -L "$base/Xbot.glb"     -o public/models/void-walker.glb
curl -L "$base/Soldier.glb"  -o public/models/blade-phantom.glb
curl -L "$base/Michelle.glb" -o public/models/element-sage.glb
npm run models:check
```

## These are placeholders, and the reason matters

They prove the pipeline end to end — load, rig resolution, zone materials,
skinned outline, our animation. They do **not** look like the characters in
`CHR-CCU-810`. Two specific gaps:

1. **They are stock Mixamo figures.** X Bot is a grey mannequin. Nothing about
   it reads as Void Walker: no white crown, no collar, no visor, no coat.
2. **They ship one or two materials each**, so the per-zone shadow-hue system —
   the thing `CHR-CCU-810` §5 is built on — has almost nothing to bite on.
   `element-sage.glb` is a single `Ch03_Body` material, so the entire character
   resolves to one zone and shades as one surface.

Point 2 is the harder limit. Free stock models are usually authored as one
atlas with one material, and no amount of shader work recovers a zone split
that is not in the file.

## Paths to something that actually looks designed

In increasing order of cost:

| Option | Cost | Result |
|---|---|---|
| Keep these | done | Pipeline works, characters look generic |
| Find better free models with split materials | hours of searching | Closer, still not the design |
| Buy a stylised rigged character | $20–80 each | Good, still not the design |
| Model to `CHR-CCU-810`, auto-rig in Mixamo | days | The design, correctly rigged |

The Mixamo auto-rigger accepts a custom mesh and returns it rigged with exactly
the bone names already resolving here, so the last row does not invalidate any
of this code — only the mesh changes.
