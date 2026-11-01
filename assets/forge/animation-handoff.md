# Forge character and real-motion handoff

Characters use original Blender geometry. Six real FBX motions were downloaded from
Adobe Mixamo after the user signed in: Unarmed Walk Forward (In Place), Fighting Idle,
Jab Cross, Mma Kick, Martelo 2, and Front Leg Sweep. Sources are retained under
`assets/animations/mixamo/`; acquisition alone does not imply runtime registration.
The live modular asset remains `public/environment/forge-heroes.glb`; stable part names,
roster IDs, pivots and simulation positions/timing are retained.

## Native assets

- `forge-heroes.blend`: modular source used by the game.
- `forge-heroes-rigged.blend`: assembled ion/Glitch and cinder/Vorgh T-pose rigs.
- `forge-ion-tpose.fbx`, `forge-cinder-tpose.fbx`: selected mesh and deform skeleton only.
- `assets/forge/forge-{ion,cinder}-rigged.glb`: separate rigid-skinned review/import assets.

Armor weights are rigid per segment. These are not continuous anatomical skins:
fingers follow the forearm, boots follow the shin, and facial/cloth deformation is absent.
Mixamo-style names provide a mapping contract, not evidence of automatic retarget quality.
Rigged assets are prepared for import; gameplay continues to use the modular skeleton.

## Recreate assets

Run Blender in background with `--python scripts/blender/build_forge_heroes.py`,
then `--python scripts/blender/build_forge_rigs.py`. These commands author/export assets;
they do not launch the game. Existing portrait images have not been regenerated.

## Re-import captured motion

1. Retain the downloaded file and its source URL/license. Mixamo, MocapFlow,
   MotionSmith or BlendSwap acquisition/login belongs to the parent task.
   Do not substitute generated keys for a missing download.
2. Run Blender with `--background --python scripts/blender/import_forge_motion.py --
   --input <absolute-fbx> --variant ion --name <clip-id>
   --source-url <actual-source-url> --license-note <actual-license-note>` on one command line.
   Only animated FBX with the required Mixamo bone names is supported.
   Other skeletons need explicit name/rest-pose mapping before import.
3. The importer writes `public/animations/forge/<clip-id>.json` and an offline
   review GLB under `assets/forge/motion-review/`.
   JSON retains the source filename, URL, license note and SHA256. It contains
   local rotations and measured target sole offsets: captured translation and scale
   cannot move authoritative fighters. Sole offsets move only the local presentation
   vertically to keep the lowest boot on the arena floor.
   The GLB is for reviewing the rig and clip outside the current modular renderer.
4. Review the actual clip in Blender, then add an entry to
   `src/stage/fighter3d/forgeMotionManifest.json`, e.g.
   `{"file":"<clip-id>.json","variant":"ion","state":"walk"}`.
   Use `cinder` for Vorgh. States are `idle`, `walk`, or an existing exact move ID.
   Attack entries additionally require `"strike":[start,end]`, normalized source
   times of the reviewed contact interval. No default contact interval is fabricated.
   Playback maps simulation windup/active/recovery to those source intervals.
5. Parent owns build/type checks and live verification. Inspect left/right mapping,
   forward direction, elbow and knee bend, rigid joint coverage, planted feet,
   source FPS, contact timing, loop seams, transition snapping and hitstop.
   Tune/correct the actual clip before registering it. Playback now blends state
   boundaries over 80 ms and finishes anticipation blending by active-start.

## Registered game set

Run `scripts/blender/import_mixamo_set.ps1` to reproduce all eight runtime clips.
Glitch and Vorgh use captured Fighting Idle, Unarmed Walk Forward, first-jab-only
frames 1–18 from Jab Cross, and Front Leg Sweep. The nine state bindings include
Glitch's utility sweep. Jab contact comes from source frames 13–15; sweep contact
from 25–28. Runtime mirrors stance handedness on one camera side so both armored
chests stay visible; forward reach is preserved. Retreat reverses accumulated walk
phase, while hitstop freezes clocks and the displayed contact pose. Blender exports
one measured grounding offset per frame from both evaluated boots. The runtime
scales this local correction with the model and blends it across state boundaries.
Grounded non-knockdown poses also receive a final correction from the cached actual
boot vertices after pose blending. This covers authored reactions, guards and normals
as well as captures. Airborne states receive only upward floor-penetration correction,
so their jump height remains free; authored 540 visual hops and knockdowns are exempt.

MMA Kick and Martelo 2 are downloaded reserves, not registered game animations.
Martelo was rejected during the first grounding review and remains unregistered.
The correction anchors the lowest boot at the shared arena surface height; it does not independently lock both feet
or remove horizontal foot sliding. Rigid armor does not provide anatomical
deformation or full foot IK. Other attacks keep their authored poses.
The remaining three roster characters have not received this new character/motion set.

`npm run build` includes actual-FBX hash provenance and channel checks plus playback
and combat timing regressions. Live verification reports and captures are under
`.dream-loop/mixamo-*`. This is a working visual/combat upgrade, not MK11/SF6 parity.

Final local evidence: `npm run build` passed with 319 combat, 6 motion and 3 keep-awake
tests; all model and asset checks passed. Client code is about 692 KB gzip; shipped
assets are below the 12 MB ceiling. Production neutral at 1600x900/high measured
45.5 RAF FPS (p95 33.9 ms) on this machine, below a stable 60 FPS target.
The local production server reports expected 404s for Vercel analytics scripts;
all nine motion bindings load successfully. Development combat QA has no page,
motion-loading or request errors. Ground-contact probes confirm the lowest boot
at world Y=.024 during the sampled grounded attacks/reactions and above it in jump.

Review `.dream-loop/mixamo-review-demo/fight-demo.mp4`: actual 20-second HUD-inclusive
capture, H.264, 1600x900, 25 FPS, 500 verified frames, no audio. The 25 FPS recording
rate is separate from the game's runtime frame cadence. The recording uses the local
development build's read-only probes to approach the opponent through normal controls;
no simulation state is injected. `mixamo-ground-contact-check`
contains the final detailed combat/foot-height probes; `mixamo-production-final`
contains the unrecorded production cadence sample.
