# Forge real FBX retarget handoff

Importer ready. Acquisition, production generation, manifest and live QA belong to parent.

## Commands

From ZX, example single-hit first jab (PowerShell):

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python-exit-code 1 --python scripts/blender/import_forge_motion.py -- --input assets/animations/mixamo/jab-cross.fbx --variant ion --name ion-first-jab --start 1 --end 18 --source-url 'https://www.mixamo.com/#/?page=1&query=Jab+Cross' --license-note 'Mixamo download supplied by project owner; retain under Mixamo terms'
```

Use `--variant cinder` for Vorgh and unique output IDs. `--start` / `--end` are inclusive source frames. Omit both for full takes. `--review-only` keeps even JSON outside public. Blender needs `--python-exit-code 1` to propagate Python failures.

JSON: `public/animations/forge/<id>.json`. Review GLB, source trajectories and FK/grounding audit: `assets/forge/motion-review/<id>*`. Diagnostic `retarget-check-*` files are all offline, not in public.

## Source findings (Blender measured, contact candidates for parent's live review)

| Source | Trim | Contact source frames | Manifest strike |
|---|---|---|---|
| jab-cross | 1–18 | 13–15 | [0.705882, 0.823529] |
| front-sweep | full 1–53 | 25–28 | [0.461538, 0.519231] |
| martelo-high | full 1–40 | 14–19 | Reserve only: grounding fails |

Jab's first hand reaches maximum extension at ~14–15. The other hand develops the second strike at 19–23, excluded by trim. Front sweep's rear foot crosses from behind at 23–24 and reaches maximum forward extension at 27. High kick's foot is highest at 16–17. Keep MMA offline unless an existing move matches it.

Jab ion audit: sole minima -0.065 / -0.046 m. Sweep ion: -0.050 / -0.037 m. Martelo cinder: -0.154 / -0.194 m. These are model-space heights before root height scale and are reported, not concealed by translating the fighter. Parent should leave martelo unregistered. Rotation-only/root-locked transfer cannot guarantee original source foot plants on differently proportioned characters.

## Transform contract

Actual source rest arms point ±X, runtime mesh segments point -Y. Map source world deformation into target axes, then multiply by canonical T-pose segment frames; only then collapse parent chains and extract local quaternions. The elbow inherits its arm's rest frame, so its local rest is identity (no second 90° offset). Spine/neck/clavicle world rotations collapse into the runtime's 11 joints. Root translation/scale are discarded.

Derive forward from actual rest Foot→ToeBase: source Left is +X, runtime Left is -X. The axis mapping can have determinant -1; conjugating proper rotations remains proper. A cross-product-only basis erroneously turns punches backwards.

JSON requires `rotationSpace: forge-canonical-local-v2`; runtime rejects old rest-delta exports. Blender review uses the same collapsed chain. Every export audits review FK against runtime canonical FK at every sample. Checked jab/sweep/martelo position errors <5e-7 m; angle errors <0.0014 rad (float32 quaternion dot limit). Do not treat numeric FK agreement as live animation approval.

## Runtime and checks

Playback has shortest-path quaternion sampling, signed accumulated walk phase for retreat, 80 ms state transitions completed by active-start, and complete freeze of clocks/facing/transitions during hitstop. Action sampling still uses `combatAnimationProgress`; simulation timing and position are unchanged. Unregistered actions retain authored poses and captured Euler twist is cleared before fallback.

Run `node --test scripts/forge-motion.test.mjs`, `npm run typecheck`, and targeted ESLint on `forgeMotion.ts`, `forgeMotionTransition.ts`, `KombatFighter.tsx`, and the test file. Four focused playback tests pass. Parent owns full build and headed runtime QA.
