import type {
  CommandContext,
  KeyboardInputSource,
} from '@/src/input';
import { FighterVoiceController } from '@/src/audio/FighterVoiceController';
import { TitanSoundController } from '@/src/audio/TitanSoundController';
import { LuckySoundController } from '@/src/audio/LuckySoundController';
import { GlitchSoundController } from '@/src/audio/GlitchSoundController';
import { ImpactSoundController } from '@/src/audio/ImpactSoundController';
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
  ALL_COMBAT_MOVES,
  createCombatAi,
  createCombatEngine,
  createCombatHud,
  readFighter,
} from './combatSetup';
import { MeterController } from './MeterController';
import { XrayController } from './XrayController';
import { isPracticeMode, ROUNDS_TO_WIN } from './matchRules';

const ROUND_FRAMES = 99 * 60;
const ROUND_RESTART_DELAY_FRAMES = 90;
const DEFAULT_ROUND_WINS = { p1: 0, p2: 0 } as const;

type FighterSide = 'p1' | 'p2';
type ChampionSide = FighterSide | null;
type FighterInputSource = {
  sample(
    facing: -1 | 1,
    attacksLocked?: boolean,
    context?: CommandContext,
  ): ReturnType<KeyboardInputSource['sample']>;
};

export class CombatSession {
  private engine: ReturnType<typeof createCombatEngine>;
  private ai: ReturnType<typeof createCombatAi>;
  private hud = createCombatHud();
  private readonly runner = new FixedStepRunner(() => this.tick());
  private lastEvents: readonly CombatEvent[] = [];
  private timerFrames = ROUND_FRAMES;
  private ended = false;
  private comboHits = 0;
  private maxCombo = 0;
  private matchRound = 1;
  private roundWins: Record<FighterSide, number> = {
    ...DEFAULT_ROUND_WINS,
  };
  private roundRestartInFrames = 0;
  private championAtRoundEnd: ChampionSide = null;
  private readonly fighterVoice: FighterVoiceController;
  private readonly titanSound: TitanSoundController;
  private readonly luckySound: LuckySoundController;
  private readonly glitchSound: GlitchSoundController;
  private readonly impactSound = new ImpactSoundController();
  private readonly xray = new XrayController();
  private readonly meters: MeterController;
  private readonly attackInput = new AttackInputPolicy(ALL_COMBAT_MOVES);

  public constructor(
    private readonly playerOne: FighterInputSource,
    private readonly playerTwo: FighterInputSource,
    private readonly fighterSelection: CharacterSelection,
  ) {
    this.engine = createCombatEngine(fighterSelection);
    this.meters = new MeterController(fighterSelection);
    this.ai = createCombatAi(
      this.fighterSelection[1],
      storyAwareDifficulty(),
    );
    this.fighterVoice = new FighterVoiceController(this.fighterSelection);
    this.titanSound = new TitanSoundController(this.fighterSelection);
    this.luckySound = new LuckySoundController(this.fighterSelection);
    this.glitchSound = new GlitchSoundController(this.fighterSelection);
    this.publishInitialState();
  }

  public advance(elapsedMilliseconds: number): void {
    const result = this.runner.advance(elapsedMilliseconds, () => undefined);
    publishCombatFrame(this.engine.read(), result.interpolationAlpha);
  }

  public reset(): void {
    this.engine = createCombatEngine(this.fighterSelection);
    this.ai = createCombatAi(
      this.fighterSelection[1],
      storyAwareDifficulty(),
    );
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
    this.meters.reset();
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
        const championSide = this.championAtRoundEnd;
        this.championAtRoundEnd = null;
        this.roundRestartInFrames = 0;
        if (championSide === null) {
          this.startNextRound();
        } else {
          this.finishMatch(championSide);
        }
      }
      return;
    }

    const before = this.engine.read();
    const player = readFighter(before, 'p1');
    const opponent = readFighter(before, 'p2');
    const mode = useHudStore.getState().mode;
    const opponentInput = isPracticeMode(mode)
      ? {}
      : mode === 'local'
      ? this.playerTwo.sample(
          opponent.facing,
          this.attackInput.isLocked(opponent),
          this.meters.inputContext(opponent),
        )
      : this.ai.decide(before, this.lastEvents).input;
    const result = this.engine.tick({
      p1: this.playerOne.sample(
        player.facing,
        this.attackInput.isLocked(player),
        this.meters.inputContext(player),
      ),
      p2: opponentInput,
    });
    if (mode !== 'training') {
      this.timerFrames = Math.max(0, this.timerFrames - 1);
    }
    this.lastEvents = result.events;
    this.attackInput.accept(result.state, result.events);
    this.meters.accept(result.events);
    this.luckySound.accept(result.events);
    this.glitchSound.accept(result.events);
    this.impactSound.accept(result.events);
    this.xray.accept(result.events);
    publishCombatFrame(result.state, 0);
    publishCombatHits(result.state, result.events);
    this.fighterVoice.accept(result.state, result.events);
    this.titanSound.accept(result.events);
    this.publishHud(result.state, result.events);
    this.handleImpact(result.events);

    if (mode === 'training' && result.state.fighters.some((entry) => entry.health <= 0)) {
      this.startNextRound();
      return;
    }
    if (
      (
        this.timerFrames === 0
        || result.state.fighters.some((entry) => entry.health <= 0)
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
      superCharge: this.meters.superChargeState(world.fighters),
      ultimateReady: this.meters.ultimateReadyState(world.fighters),
      luck: this.meters.luckState(world.fighters),
      rage: this.meters.rageState(world.fighters),
    });
  }

  private handleImpact(events: readonly CombatEvent[]): void {
    const hits = events.filter((event) => event.type === 'hit').length;
    if (hits === 0) {
      if (events.some((event) => event.type === 'moveEnded')) {
        this.comboHits = 0;
      }
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
      this.roundWins[winnerSide] += 1;
      this.fighterVoice.celebrate(winnerSide === 'p1' ? 'p1' : 'p2');
    }
    const isTie = winnerSide === null;
    const reachedMatchWin = winnerSide !== null
      && this.roundWins[winnerSide] >= ROUNDS_TO_WIN;
    if (!isTie && reachedMatchWin) {
      this.championAtRoundEnd = winnerSide;
    } else {
      this.championAtRoundEnd = null;
      this.matchRound += 1;
    }

    useRenderStore.getState().triggerImpact();
    this.publishHud(world, []);
    this.roundRestartInFrames = ROUND_RESTART_DELAY_FRAMES;
  }

  private finishMatch(championSide: FighterSide): void {
    this.ended = true;
    const winnerIndex = championSide === 'p1' ? 0 : 1;
    const winner = championSide === 'p1' ? 'P1' : 'P2';
    const winnerCharacter = getCharacterDefinition(
      useHudStore.getState().fighterSelection[winnerIndex],
    );
    useHudStore.getState().openResult({
      winner: `${winner} - ${winnerCharacter.displayName}`,
      rounds: `${this.roundWins.p1}-${this.roundWins.p2}`,
      maxCombo: this.maxCombo,
      clashes: 0,
      duration: formatDuration(ROUND_FRAMES - this.timerFrames),
    });
  }

  private startNextRound(): void {
    this.engine = createCombatEngine(this.fighterSelection);
    this.ai = createCombatAi(
      this.fighterSelection[1],
      storyAwareDifficulty(),
    );
    this.hud = createCombatHud();
    this.runner.reset();
    this.hud.reset();
    this.lastEvents = [];
    this.timerFrames = ROUND_FRAMES;
    this.roundRestartInFrames = 0;
    this.roundWins = { ...this.roundWins };
    this.comboHits = 0;
    this.xray.reset();
    this.meters.reset();
    this.attackInput.reset();
    clearCombatHits();
    this.publishInitialState();
  }
}

function formatDuration(frames: number): string {
  const seconds = Math.floor(frames / 60);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function storyAwareDifficulty() {
  const hud = useHudStore.getState();
  return hud.mode === 'story' ? 'story' as const : hud.aiDifficulty;
}

