# Deterministic combat simulation

`src/sim` is a pure TypeScript, render-independent combat core. It does not import
React, Three.js, browser APIs, or wall-clock time.

## Determinism contract

- The engine advances by exactly one logical frame per `tick` call.
- World coordinates and velocities are safe integers. `fixed(1)` is one world unit
  and equals 1,000 internal units.
- Collision and physics use integer addition, comparison, and explicitly truncated
  rational scaling. They do not use variable delta time.
- Fighters are sorted by ID once, and collision candidates are resolved in that
  stable order.
- Frame windows are half-open: `[from, toExclusive)`.
- A hit ID can connect with a defender only once during one execution of a move.
- Hits detected on the same frame are resolved together, so trades are deterministic.

The fixed-step runner accepts render deltas, runs at 60 Hz, caps catch-up at five
frames, reports dropped frames, and exposes an interpolation alpha. Render timing
never enters `CombatEngine`.

## Frame semantics

An attack begins on move frame 0. Startup occupies
`[0, startup)`, active frames occupy `[startup, startup + active)`, and recovery
occupies the remaining frames. A successful hit assigns asymmetric hitstop.
Frozen fighters do not integrate physics, advance actions, or consume hitstun.

Knockback is authored as integer velocity per simulation frame. Wall and ground
bounces are optional hit properties with an explicit bounce count and minimum
post-bounce hitstun. Bounce counters are reset by the next hit.

## Minimal integration

```ts
import { CombatEngine, FixedStepRunner, fixed } from './sim';
import { KADE_HURTBOXES, KADE_MOVES } from './data/combat-moves';

const engine = new CombatEngine({
  moves: KADE_MOVES,
  fighters: [
    {
      id: 'p1',
      team: 1,
      maxHealth: 1_000,
      spawn: { x: fixed(-0.7), y: 0 },
      facing: 1,
      hurtboxes: KADE_HURTBOXES,
    },
    {
      id: 'p2',
      team: 2,
      maxHealth: 1_000,
      spawn: { x: fixed(0.7), y: 0 },
      facing: -1,
      hurtboxes: KADE_HURTBOXES,
    },
  ],
});

const runner = new FixedStepRunner((inputs) => engine.tick(inputs));
runner.advance(renderDeltaMs, () => sampledInputs);
```

Use `tick().events` for VFX and audio. Use `read()` for authoritative state and
`readDebugFrames()` for hitbox/hurtbox visualization. Interpolate only between
`previousPosition` and `position`; never feed interpolated values back into the
simulation.
