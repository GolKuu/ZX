import { CombatAiAgent } from '@/src/ai';
import { KADE_AI_LOADOUT } from '@/src/data/combat-ai';
import { KADE_HURTBOXES, KADE_MOVES } from '@/src/data/combat-moves';
import { HudBridge } from '@/src/hud';
import type { KeyboardInputSource } from '@/src/input';
import {
  CombatEngine,
  FixedStepRunner,
  fixed,
  type CombatEvent,
  type WorldSnapshot,
} from '@/src/sim';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import { publishCombatFrame } from './combatRuntime';

const ROUND_FRAMES = 99 * 60;

export class CombatSession {
  private engine = createEngine();
  private ai = createAi();
  private hud = createHudBridge();
  private readonly runner = new FixedStepRunner(() => this.tick());
  private lastEvents: readonly CombatEvent[] = [];
  private timerFrames = ROUND_FRAMES;
  private ended = false;
  private comboHits = 0;
  private maxCombo = 0;

  public constructor(
    private readonly playerOne: KeyboardInputSource,
    private readonly playerTwo: KeyboardInputSource,
  ) {
    this.publishInitialState();
  }

  public advance(elapsedMilliseconds: number): void {
    const result = this.runner.advance(elapsedMilliseconds, () => undefined);
    publishCombatFrame(this.engine.read(), result.interpolationAlpha);
  }

  public reset(): void {
    this.engine = createEngine();
    this.ai = createAi();
    this.hud = createHudBridge();
    this.runner.reset();
    this.hud.reset();
    this.lastEvents = [];
    this.timerFrames = ROUND_FRAMES;
    this.ended = false;
    this.comboHits = 0;
    this.maxCombo = 0;
    this.publishInitialState();
  }

  private tick(): void {
    if (this.ended) return;
    const before = this.engine.read();
    const player = fighter(before, 'p1');
    const mode = useHudStore.getState().mode;
    const opponentInput = mode === 'local'
      ? this.playerTwo.sample(fighter(before, 'p2').facing)
      : this.ai.decide(before, this.lastEvents).input;
    const result = this.engine.tick({
      p1: this.playerOne.sample(player.facing),
      p2: opponentInput,
    });
    this.timerFrames = Math.max(0, this.timerFrames - 1);
    this.lastEvents = result.events;
    publishCombatFrame(result.state, 0);
    this.publishHud(result.state, result.events);
    this.handleImpact(result.events);
    if (
      this.timerFrames === 0
      || result.state.fighters.some((entry) => entry.health === 0)
    ) {
      this.finish(result.state);
    }
  }

  private publishInitialState(): void {
    const world = this.engine.read();
    publishCombatFrame(world, 0);
    this.publishHud(world, []);
  }

  private publishHud(
    world: WorldSnapshot,
    events: readonly CombatEvent[],
  ): void {
    this.hud.accept(world, events, {
      round: 1,
      timerFrames: this.timerFrames,
      roundWins: { p1: 0, p2: 0 },
    });
  }

  private handleImpact(events: readonly CombatEvent[]): void {
    const hits = events.filter((event) => event.type === 'hit').length;
    if (hits === 0) {
      if (events.some((event) => event.type === 'moveEnded')) this.comboHits = 0;
      return;
    }
    this.comboHits += hits;
    this.maxCombo = Math.max(this.maxCombo, this.comboHits);
    useRenderStore.getState().triggerImpact();
  }

  private finish(world: WorldSnapshot): void {
    this.ended = true;
    const [first, second] = world.fighters;
    const winner = (first?.health ?? 0) >= (second?.health ?? 0) ? 'P1' : 'P2';
    useHudStore.getState().openResult({
      winner: `${winner} · Roronoa Zoro`,
      rounds: '1–0',
      maxCombo: this.maxCombo,
      clashes: 0,
      duration: formatDuration(ROUND_FRAMES - this.timerFrames),
    });
  }
}

function createEngine(): CombatEngine {
  return new CombatEngine({
    moves: KADE_MOVES,
    fighters: [
      fighterDefinition('p1', 1, -1.55, 1),
      fighterDefinition('p2', 2, 1.55, -1),
    ],
    world: { leftWall: fixed(-4.8), rightWall: fixed(4.8) },
  });
}

function createAi(): CombatAiAgent {
  return new CombatAiAgent({
    fighterId: 'p2',
    opponentId: 'p1',
    difficulty: 'normal',
    moves: KADE_MOVES,
    loadout: KADE_AI_LOADOUT,
    seed: 29,
  });
}

function fighterDefinition(id: string, team: number, x: number, facing: -1 | 1) {
  return {
    id,
    team,
    maxHealth: 1_000,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: KADE_HURTBOXES,
  };
}

function createHudBridge(): HudBridge {
  const opponentTag = useHudStore.getState().mode === 'ai' ? 'CPU' : 'P2';
  return new HudBridge(
    [
      { id: 'p1', displayName: 'Roronoa Zoro', playerTag: 'P1', side: 'left' },
      { id: 'p2', displayName: 'Roronoa Zoro', playerTag: opponentTag, side: 'right' },
    ],
    (snapshot) => useHudStore.getState().publishSnapshot(snapshot),
  );
}

function fighter(world: WorldSnapshot, id: string) {
  const result = world.fighters.find((entry) => entry.id === id);
  if (result === undefined) throw new Error(`Missing fighter "${id}"`);
  return result;
}

function formatDuration(frames: number): string {
  const seconds = Math.floor(frames / 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
