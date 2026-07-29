# Deterministic combat AI

The AI consumes immutable `WorldSnapshot` values and produces the same
`FighterInput` structure as a human input source. It never reads React, Three.js,
the DOM, render delta, or hidden mutable combat state.

## Difficulty model

| Level | Reaction | Telegraph | Decisions | Defense | Combo depth |
|---|---:|---:|---:|---:|---:|
| Easy | 18f | 24f | every 12f | 35% | 1 follow-up |
| Normal | 12f | 14f | every 7f | 68% | 3 follow-ups |
| Hard | 7f | 6f | every 3f | 92% | 4 follow-ups |

Difficulty changes observation delay, decision cadence, error rate, defense and
punish consistency, combo depth, and telegraph duration. It does not change
damage, health, physics, hitboxes, or frame data.

## Systems

- **Neutral:** weighted, range-limited move selection with deterministic errors.
- **Spacing:** approaches outside the preferred band and retreats when crowded.
- **Defense:** recognizes startup/active threats after the reaction delay, then
  guards or retreats according to the difficulty profile.
- **Whiff punish:** recognizes recovery frames and selects an in-range punish.
- **Combos:** hit events activate authored routes; follow-ups use the same
  data-driven cancel windows as player inputs.
- **Telegraphs:** every attack emits `telegraphStarted`, then either
  `telegraphCommitted` or `telegraphCancelled`. UI and VFX can render the cue
  without affecting the simulation.

## Tick integration

```ts
let previousEvents = [];

function tick() {
  const ai = agent.decide(engine.read(), previousEvents);
  renderTelegraph(ai.telegraph, ai.events);

  const result = engine.tick({
    player: sampledPlayerInput,
    ai: ai.input,
  });
  previousEvents = result.events;
}
```

Call `decide` exactly once for each increasing world frame. Give each match a
known seed when reproducible captures or test runs are required. Call `reset`
between rounds if the AI should restart its decision sequence.
