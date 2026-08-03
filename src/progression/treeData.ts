import type { CharacterId } from '../data/characterRoster.js';
import type { ProgressionNode } from './types.js';

interface BranchSpec { readonly id: string; readonly name: string; readonly focus: string; readonly nodes: readonly string[]; }
const SPECS: Readonly<Record<CharacterId, readonly BranchSpec[]>> = {
  mim: [
    ['invisible-architecture','Invisible Architecture','wall setup',['Stable Geometry','Quick Construction','Anchored Surface','Rebound Vector','Reflective Plane','Mobile Architecture','Fractal Partition','Labyrinth Master']],
    ['flow-acrobatics','Flow Acrobatics','movement routes',['Light Landing','Rotational Momentum','Ground Flow','Wall Sprint','Reverse Flow','Continuous Motion','Spiral Transit','Endless Route']],
    ['spatial-deception','Spatial Deception','feints and side switches',['Phantom Plane','Masked Intention','Quiet Step','False Opening','Inverted Exit','Spatial Counterfeit','Mirror Passage','Silent Labyrinth']],
  ],
  glitch: [
    ['rift-mobility','Rift Mobility','teleport decisions',['Stable Reappearance','Extended Vector','Rift Recall','Directional Exit','Cooldown Fracture','Twin Vector','Phase Anchor','Spatial Overclock']],
    ['airspace-dominance','Airspace Dominance','aerial routes',['Reduced Gravity','Air Recalibration','Clean Landing','Vector Launcher','Double Fracture','Air Chain Stability','Sky Checksum','Zero-G Domain']],
    ['reality-corruption','Reality Corruption','delayed pressure',['Fractured Contact','Delayed Echo','Unstable Edge','Rift Snare','Broken Sequence','Collapse Point','Checksum Rupture','Reality Failure']],
  ],
  lucky: [
    ['loaded-odds','Loaded Odds','Luck efficiency',['Better Odds','Loaded Token','Clear Forecast','Selective Fortune','Efficient Bet','Stored Outcome','Safe Wager','Loaded Future']],
    ['winning-momentum','Winning Momentum','rushdown conversions',['Quick Collection','Forward Bet','Clean Conversion','Winning Step','Pressure Dividend','Streak Extension','Cashout Route','Unbroken Streak']],
    ['risk-management','Risk Management','defensive insurance',['Guarded Bet','Emergency Reserve','Calculated Retreat','Defensive Odds','Probability Counter','Loss Control','Risk Ledger','House Always Adapts']],
  ],
  titan: [
    ['grapple-authority','Grapple Authority','positioning grabs',['Reinforced Grip','Controlled Carry','Clean Release','Corner Authority','Air Interception','Chain Grapple','Magnetic Clamp','Absolute Hold']],
    ['siege-armour','Siege Armour','finite Armour',['Thick Plating','Reactive Plates','Stable Reactor','Layered Defence','Emergency Vent','Siege Recovery','Heat Sink','Walking Fortress']],
    ['impact-engineering','Impact Engineering','guard and wall impact',['Reinforced Piston','Seismic Transfer','Colossus Momentum','Structural Failure','Ground Authority','Wall Compression','Impact Governor','Siege Engine Prime']],
  ],
  vorgh: [
    ['controlled-fury','Controlled Fury','bounded Rage control',['Measured Anger','Stable Threshold','Focused Spend','Suppression Technique','Controlled Berserk','Rage Reserve','Calm Within','Mastered Beast']],
    ['predator-pressure','Predator Pressure','pursuit routes',['Pursuit Instinct','Blood Trail','Relentless Step','Predator Chain','Hunting Rhythm','Marked Prey','Pack Breaker','Apex Predator']],
    ['pain-transmutation','Pain Transmutation','Pain Guard choices',['Hardened Nerves','Pain Memory','Guarded Suffering','Scar Tissue','Retaliation Window','Rage Recovery','Scar Ledger','Pain Becomes Power']],
  ],
};

const asSpec = (raw: readonly unknown[]): BranchSpec => ({ id: String(raw[0]), name: String(raw[1]), focus: String(raw[2]), nodes: raw[3] as readonly string[] });
const tiers = [1, 1, 2, 2, 3, 3, 3, 4] as const;
const costs = [1, 1, 2, 2, 3, 3, 3, 5] as const;

export const PROGRESSION_BRANCHES = Object.fromEntries(Object.entries(SPECS).map(([fighter, rawBranches]) => [fighter, rawBranches.map((entry) => asSpec(entry as unknown as readonly unknown[]))])) as Readonly<Record<CharacterId, readonly BranchSpec[]>>;

export const PROGRESSION_NODES: readonly ProgressionNode[] = Object.entries(PROGRESSION_BRANCHES).flatMap(([fighter, branches]) =>
  branches.flatMap((branch) => branch.nodes.map((name, index) => {
    const id = `${fighter}.${branch.id}.${index + 1}`;
    const prior = index === 0 ? [] : [`${fighter}.${branch.id}.${index}`];
    const tier = tiers[index]!;
    return {
      id, fighterId: fighter as CharacterId, branchId: branch.id, tier, name,
      description: `${name} expands ${branch.focus} with a bounded tactical option; it never removes counterplay.`,
      cost: costs[index]!, prerequisites: prior, exclusions: [], capstone: tier === 4,
      affectedMoves: [branch.focus], effect: {
        stat: index % 2 === 0 ? 'recovery / resource efficiency' : 'route flexibility',
        before: 'Base frame data and resource limits', after: `Tier ${tier} ${branch.focus} tuning`,
        maxBonusPercent: tier === 4 ? 12 : tier * 3,
      },
    };
  })),
);

export const nodeById = (id: string): ProgressionNode | undefined => PROGRESSION_NODES.find((node) => node.id === id);
export const fighterNodes = (id: CharacterId): readonly ProgressionNode[] => PROGRESSION_NODES.filter((node) => node.fighterId === id);
