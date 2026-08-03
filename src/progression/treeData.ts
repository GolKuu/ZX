import type { CharacterId } from '../data/characterRoster.js';
import type { ProgressionNode } from './types.js';

export interface BranchSpec { readonly id: string; readonly name: string; readonly focus: string; readonly nodes: readonly string[]; }
const b = (id: string, name: string, focus: string, nodes: readonly string[]): BranchSpec => ({ id, name, focus, nodes });
const SPECS: Readonly<Record<CharacterId, readonly BranchSpec[]>> = {
  mim: [
    b('invisible-architecture','Invisible Architecture','wall setup',['Stable Geometry','Quick Construction','Anchored Surface','Rebound Vector','Reflective Plane','Mobile Architecture','Fractal Partition','Labyrinth Master']),
    b('flow-acrobatics','Flow Acrobatics','movement routes',['Light Landing','Rotational Momentum','Ground Flow','Wall Sprint','Reverse Flow','Continuous Motion','Spiral Transit','Endless Route']),
    b('spatial-deception','Spatial Deception','feints and side switches',['Phantom Plane','Masked Intention','Quiet Step','False Opening','Inverted Exit','Spatial Counterfeit','Mirror Passage','Silent Labyrinth']),
  ],
  glitch: [
    b('rift-mobility','Rift Mobility','teleport decisions',['Stable Reappearance','Extended Vector','Rift Recall','Directional Exit','Cooldown Fracture','Twin Vector','Phase Anchor','Spatial Overclock']),
    b('airspace-dominance','Airspace Dominance','aerial routes',['Reduced Gravity','Air Recalibration','Clean Landing','Vector Launcher','Double Fracture','Air Chain Stability','Sky Checksum','Zero-G Domain']),
    b('reality-corruption','Reality Corruption','delayed pressure',['Fractured Contact','Delayed Echo','Unstable Edge','Rift Snare','Broken Sequence','Collapse Point','Checksum Rupture','Reality Failure']),
  ],
  lucky: [
    b('loaded-odds','Loaded Odds','Luck efficiency',['Better Odds','Loaded Token','Clear Forecast','Selective Fortune','Efficient Bet','Stored Outcome','Safe Wager','Loaded Future']),
    b('winning-momentum','Winning Momentum','rushdown conversions',['Quick Collection','Forward Bet','Clean Conversion','Winning Step','Pressure Dividend','Streak Extension','Cashout Route','Unbroken Streak']),
    b('risk-management','Risk Management','defensive insurance',['Guarded Bet','Emergency Reserve','Calculated Retreat','Defensive Odds','Probability Counter','Loss Control','Risk Ledger','House Always Adapts']),
  ],
  titan: [
    b('grapple-authority','Grapple Authority','positioning grabs',['Reinforced Grip','Controlled Carry','Clean Release','Corner Authority','Air Interception','Chain Grapple','Magnetic Clamp','Absolute Hold']),
    b('siege-armour','Siege Armour','finite Armour',['Thick Plating','Reactive Plates','Stable Reactor','Layered Defence','Emergency Vent','Siege Recovery','Heat Sink','Walking Fortress']),
    b('impact-engineering','Impact Engineering','guard and wall impact',['Reinforced Piston','Seismic Transfer','Colossus Momentum','Structural Failure','Ground Authority','Wall Compression','Impact Governor','Siege Engine Prime']),
  ],
  vorgh: [
    b('controlled-fury','Controlled Fury','bounded Rage control',['Measured Anger','Stable Threshold','Focused Spend','Suppression Technique','Controlled Berserk','Rage Reserve','Calm Within','Mastered Beast']),
    b('predator-pressure','Predator Pressure','pursuit routes',['Pursuit Instinct','Blood Trail','Relentless Step','Predator Chain','Hunting Rhythm','Marked Prey','Pack Breaker','Apex Predator']),
    b('pain-transmutation','Pain Transmutation','Pain Guard choices',['Hardened Nerves','Pain Memory','Guarded Suffering','Scar Tissue','Retaliation Window','Rage Recovery','Scar Ledger','Pain Becomes Power']),
  ],
};

const tiers = [1, 1, 2, 2, 3, 3, 3, 4] as const;
const costs = [1, 1, 2, 2, 3, 3, 3, 5] as const;
const TARGETS:Readonly<Record<CharacterId,Readonly<Record<string,readonly string[]>>>>={
  mim:{'invisible-architecture':['mim.wall.invisible','mim.wall.launch'],'flow-acrobatics':['mim.capoeira','mim.wall.run'],'spatial-deception':['mim.super.false-opening','mim.dual.mirror-strike']},
  glitch:{'rift-mobility':['glitch.spatial-dash','glitch.teleport-strike'],'airspace-dominance':['glitch.air-light','glitch.air-shift'],'reality-corruption':['glitch.reality-slice','glitch.phase-break']},
  lucky:{'loaded-odds':['lucky.luck.prepare','lucky.enhanced.loaded-strike'],'winning-momentum':['lucky.special.step','lucky.running-low-kick'],'risk-management':['lucky.luck.guard','lucky.probability-counter']},
  titan:{'grapple-authority':['titan.grab.command','titan.grab.anti-air'],'siege-armour':['titan.special.armour-charge','titan.enhanced.armour-charge'],'impact-engineering':['titan.normal.piston-hammer','titan.normal.seismic-stomp']},
  vorgh:{'controlled-fury':['vorgh.special.rage-slash','vorgh.super.unchained'],'predator-pressure':['vorgh.special.predator-leap','vorgh.normal.predator-rake'],'pain-transmutation':['vorgh.special.pain-counter','vorgh.special.blood-roar']},
};

export const PROGRESSION_BRANCHES = SPECS;

export const PROGRESSION_NODES: readonly ProgressionNode[] = Object.entries(PROGRESSION_BRANCHES).flatMap(([fighter, branches]) =>
  branches.flatMap((branch) => branch.nodes.map((name, index) => {
    const id = `${fighter}.${branch.id}.${index + 1}`;
    const prior = index === 0 ? [] : [`${fighter}.${branch.id}.${index}`];
    const tier = tiers[index]!;
    return {
      id, fighterId: fighter as CharacterId, branchId: branch.id, tier, name,
      description: `${name} expands ${branch.focus}. Active builds cap at 20 Tokens; recovery gains stop at 3 frames and never cross the fighter safety floor.`,
      cost: costs[index]!, prerequisites: prior, exclusions: [], capstone: tier === 4,
      affectedMoves: TARGETS[fighter as CharacterId][branch.id] ?? [], effect: {
        stat: index % 2 === 0 ? 'recovery / resource efficiency' : 'route flexibility',
        before: 'Authored base frame data', after: `Tier ${tier}: contributes to capped movement/recovery tuning with a health tradeoff`,
        maxBonusPercent: tier === 4 ? 12 : tier * 3,
      },
    };
  })),
);

export const nodeById = (id: string): ProgressionNode | undefined => PROGRESSION_NODES.find((node) => node.id === id);
export const fighterNodes = (id: CharacterId): readonly ProgressionNode[] => PROGRESSION_NODES.filter((node) => node.fighterId === id);
