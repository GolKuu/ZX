import type { KeyboardInputSource } from '@/src/input';
import { FighterVoiceController } from '@/src/audio/FighterVoiceController';
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
import {
  clearCombatHits,
  publishCombatFrame,
  publishCombatHits,
} from './combatRuntime';
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
const ROUNDS_TO_WIN = 3;
const ROUND_RESTART_DELAY_FRAMES = 90;
const DEFAULT_ROUND_WINS = { p1: 0, p2: 0 } as const;

type FighterSide = 'p1' | 'p2';
type ChampionSide = null | FighterSide;

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
  private matchRound = 1;
  private roundWins: { [side in FighterSide]: number } = {
    ...DEFAULT_ROUND_WINS,
  };
  private roundRestartInFrames = 0;
  private championAtRoundEnd: ChampionSide = null;
  private readonly fighterVoice: FighterVoiceController;
  private readonly xray = new XrayController();
  private readonly attackInput = new AttackInputPolicy(ALL_COMBAT_MOVES);

  public constructor(
    private readonly playerOne: KeyboardInputSource,
    private readonly playerTwo: KeyboardInputSource,
    private readonly fighterSelection: CharacterSelection,
  ) {
    this.ai = createCombatAi(this.fighterSelection[1]);
    this.fighterVoice = new FighterVoiceController(fighterSelection);
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
    this.matchRound = 1;
    this.roundWins = { ...DEFAULT_ROUND_WINS };
    this.roundRestartInFrames = 0;
    this.championAtRoundEnd = null;
    this.ended = false;
    this.comboHits = 0;
    this.maxCombo = 0;
    this.fighterVoice.reset();
    this.xray.reset();
    this.attackInput.reset();
    clearCombatHits();
    this.publishInitialState();
  }

  private tick(): void {
    if (this.ended) return;
    if (this.xray.consumeFrozenFrame()) return;

    if (this.roundRestartInFrames > 0) {
      const world = this.engine.read();
      publishCombatFrame(world, 0);
      this.publishHud(world, []);
      this.roundRestartInFrames -= 1;
      if (this.roundRestartInFrames === 0) {
        if (this.championAtRoundEnd === null) {
          this.startNextRound();
        } else {
          this.finishMatch(this.championAtRoundEnd);
        }
      }
      return;
    }

    const before = this.engine.read();
    const player = readFighter(before, 'p1');
    const opponent = readFighter(before, 'p2');
    const mode = useHudStore.getState().mode;
    const opponentInput = mode === 'local'
      ? this.playerTwo.sample(
          opponent.facing,
          this.attackInput.isLocked(opponent),
          this.xray.inputContext(opponent, player),
        )
      : this.ai.decide(before, this.lastEvents).input;
    const result = this.engine.tick({
      p1: this.playerOne.sample(
        player.facing,
        this.attackInput.isLocked(player),
        this.xray.inputContext(player, opponent),
      ),
      p2: opponentInput,
    });
    this.timerFrames = Math.max(0, this.timerFrames - 1);
    this.lastEvents = result.events;
    this.attackInput.accept(result.state, result.events);
    this.xray.accept(result.events);
    publishCombatFrame(result.state, 0);
    publishCombatHits(result.state, result.events);
    this.fighterVoice.accept(result.state, result.events);
    this.publishHud(result.state, result.events);
    this.handleImpact(result.events);

    if (
      (
        this.timerFrames === 0
        || result.state.fighters.some((entry) => entry.health === 0)
      )
      && !this.xray.isFrozen
    ) {
      this.finishRound(result.state);
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
      round: this.matchRound,
      timerFrames: this.timerFrames,
      roundWins: this.roundWins,
      superSpent: this.xray.spentCharge(),
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

  private determineRoundWinner(world: WorldSnapshot): FighterSide | null {
    const first = world.fighters.find((fighter) => fighter.id === 'p1');
    const second = world.fighters.find((fighter) => fighter.id === 'p2');
    if (first === undefined || second === undefined) return null;
    if (first.health > second.health) return 'p1';
    if (second.health > first.health) return 'p2';
    return null;
  }

  private finishRound(world: WorldSnapshot): void {
    const winnerSide = this.determineRoundWinner(world);

    if (winnerSide !== null) {
      const winnerIndex = winnerSide === 'p1' ? 0 : 1;
      const winnerDisplay = winnerSide === 'p1' ? 'P1' : 'P2';
      this.fighterVoice.celebrate(winnerSide === 'p1' ? 'p1' : 'p2');
      this.roundWins[winnerSide] += 1;
      if (this.roundWins[winnerSide] >= ROUNDS_TO_WIN) {
        this.championAtRoundEnd = winnerSide;
      } else {
        this.matchRound += 1;
        this.championAtRoundEnd = null;
      }
      useRenderStore.getState().triggerImpact();
      this.publishHud(world, []);
      const winnerCharacter = getCharacterDefinition(
        useHudStore.getState().fighterSelection[winnerIndex],
      );
      void winnerCharacter;
      this.roundRestartInFrames = ROUND_RESTART_DELAY_FRAMES;
      return;
      void winnerDisplay;
    }

    if (this.roundWins.p1 + this.roundWins.p2 > 0) {
      void winnerDisplay;
    }

    this.roundRestartInFrames = ROUND_RESTART_DELAY_FRAMES;
    this.publishHud(world, []);
    return;
    }

    if (winnerSide !== null) {
      return;
    }

    this.championAtRoundEnd = null;
    this.matchRound += 1;
  }

  private finishMatch(championSide: FighterSide): void {
    this.ended = true;
    const winnerIndex = championSide === 'p1' ? 0 : 1;
    const winnerDisplay = championSide === 'p1' ? 'P1' : 'P2';
    const winnerCharacter = getCharacterDefinition(
      useHudStore.getState().fighterSelection[winnerIndex],
    );
    useHudStore.getState().openResult({
      winner: `${winnerDisplay} · ${winnerCharacter.displayName}`,
      rounds: `${this.roundWins.p1}–${this.roundWins.p2}`,
      maxCombo: this.maxCombo,
      clashes: 0,
      duration: formatDuration(ROUND_FRAMES - this.timerFrames),
    });
  }

  private startNextRound(): void {
    this.engine = createCombatEngine();
    this.ai = createCombatAi(this.fighterSelection[1]);
    this.hud = createCombatHud();
    this.runner.reset();
    this.hud.reset();
    this.lastEvents = [];
    this.timerFrames = ROUND_FRAMES;
    this.roundRestartInFrames = 0;
    this.championAtRoundEnd = null;
    this.comboHits = 0;
    this.maxCombo = 0;
    this.xray.reset();
    this.attackInput.reset();
    clearCombatHits();
    this.publishInitialState();
  }
}

function formatDuration(frames: number): string {
  const seconds = Math.floor(frames / 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
