import type { KeyboardInputSource } from '@/src/input';
import {
  getCharacterDefinition,
  type CharacterSelection,
} from '@/src/data/characterRoster';
import {
  FixedStepRunner,
  type CombatEvent,
  type WorldSnapshot,
} from '@/src/sim';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import { publishCombatFrame } from './combatRuntime';
import { AttackInputPolicy } from './attackInputPolicy';
import {
  createCombatAi,
  createCombatEngine,
  createCombatHud,
  ALL_COMBAT_MOVES,
  readFighter,
} from './combatSetup';
import { XrayController } from './XrayController';

const ROUND_FRAMES = 99 * 60;

export class CombatSession {
  private engine = createCombatEngine();
  private ai: ReturnType<typeof createCombatAi>;
  private hud = createCombatHud();
  private readonly runner = new FixedStepRunner(() => this.tick());
  private lastEvents: readonly CombatEvent[] = [];
  private timerFrames = ROUND_FRAMES;
  private ended = false;
  private comboHits = 0;
  private maxCombo = 0;
  private readonly xray = new XrayController();
  private readonly attackInput = new AttackInputPolicy(ALL_COMBAT_MOVES);

  public constructor(
    private readonly playerOne: KeyboardInputSource,
    private readonly playerTwo: KeyboardInputSource,
    private readonly fighterSelection: CharacterSelection,
  ) {
    this.ai = createCombatAi(fighterSelection[1]);
    this.publishInitialState();
  }

  public advance(elapsedMilliseconds: number): void {
    const result = this.runner.advance(elapsedMilliseconds, () => undefined);
    publishCombatFrame(this.engine.read(), result.interpolationAlpha);
  }

  public reset(): void {
    this.engine = createCombatEngine();
    this.ai = createCombatAi(this.fighterSelection[1]);
    this.hud = createCombatHud();
    this.runner.reset();
    this.hud.reset();
    this.lastEvents = [];
    this.timerFrames = ROUND_FRAMES;
    this.ended = false;
    this.comboHits = 0;
    this.maxCombo = 0;
    this.xray.reset();
    this.attackInput.reset();
    this.publishInitialState();
  }

  private tick(): void {
    if (this.ended) return;
    const before = this.engine.read();
    const player = readFighter(before, 'p1');
    const opponent = readFighter(before, 'p2');
    const mode = useHudStore.getState().mode;
    const opponentInput = mode === 'local'
      ? this.playerTwo.sample(
          opponent.facing,
          this.attackInput.isLocked(opponent),
          this.xray.inputContext(opponent),
        )
      : this.ai.decide(before, this.lastEvents).input;
    const result = this.engine.tick({
      p1: this.playerOne.sample(
        player.facing,
        this.attackInput.isLocked(player),
        this.xray.inputContext(player),
      ),
      p2: opponentInput,
    });
    this.timerFrames = Math.max(0, this.timerFrames - 1);
    this.lastEvents = result.events;
    this.attackInput.accept(result.state, result.events);
    this.xray.accept(result.events);
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
      ultimateSpent: this.xray.spentState(),
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
    const winnerIndex = winner === 'P1' ? 0 : 1;
    const winnerCharacter = getCharacterDefinition(
      useHudStore.getState().fighterSelection[winnerIndex],
    );
    useHudStore.getState().openResult({
      winner: `${winner} · ${winnerCharacter.displayName}`,
      rounds: '1–0',
      maxCombo: this.maxCombo,
      clashes: 0,
      duration: formatDuration(ROUND_FRAMES - this.timerFrames),
    });
  }
}

function formatDuration(frames: number): string {
  const seconds = Math.floor(frames / 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
