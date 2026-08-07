import type { CharacterId } from './characterRoster.js';
import type { AttackButton } from '../input/bindings.js';

export interface SequenceTechnique {
  readonly characterId: CharacterId;
  readonly moveId: string;
  readonly baseMoveId: string;
  readonly starterMoveId: string;
  readonly name: string;
  readonly description: string;
  readonly sequence: readonly [AttackButton, AttackButton];
  readonly unlockNodeId: string;
  readonly patch?: 'mimWallSmash' | 'projectile' | 'heavyKnockback';
}

const technique = (
  characterId: CharacterId,
  slug: string,
  baseMoveId: string,
  starterMoveId: string,
  name: string,
  description: string,
  sequence: readonly [AttackButton, AttackButton],
  unlockNodeId: string,
  patch?: SequenceTechnique['patch'],
): SequenceTechnique => ({
  characterId,
  moveId: `${characterId}.technique.${slug}`,
  baseMoveId,
  starterMoveId,
  name,
  description,
  sequence,
  unlockNodeId,
  ...(patch === undefined ? {} : { patch }),
});

export const SEQUENCE_TECHNIQUES: readonly SequenceTechnique[] = [
  technique('mim', 'invisible-wall', 'mim.wall.invisible', 'mim.jab', 'Invisible Wall',
    'Creates a thin outlined wall for about three seconds. The opponent cannot cross it.',
    ['lp', 'lk'], 'mim.invisible-architecture.1'),
  technique('mim', 'wall-smash', 'mim.wall.launch', 'mim.jab', 'Wall Smash',
    'Builds a plane behind the opponent and drives them into it for bonus damage and stun.',
    ['lp', 'hk'], 'mim.invisible-architecture.4', 'mimWallSmash'),
  technique('mim', 'wall-bounce', 'mim.spin', 'mim.elbow', 'Wall Bounce',
    'A turning kick that rebounds a stunned opponent from an active MIM wall.',
    ['lk', 'hk'], 'mim.flow-acrobatics.4'),
  technique('mim', 'mirror-wall', 'mim.story.wall-shield', 'mim.elbow', 'Mirror Wall',
    'Raises a short-lived shield plane that stops ranged hitboxes and projectiles.',
    ['lk', 'hp'], 'mim.spatial-deception.4'),
  technique('mim', 'boxed-in', 'mim.story.wall-prison', 'mim.spin', 'Boxed In',
    'The capstone trap: two walls close the opponent into a temporary combat box.',
    ['hk', 'hp'], 'mim.invisible-architecture.8'),

  technique('glitch', 'phase-kick', 'glitch.teleport-strike', 'glitch.phase-jab', 'Phase Kick',
    'A teleporting kick that attacks through the opponent line.',
    ['lp', 'lk'], 'glitch.rift-mobility.2'),
  technique('glitch', 'space-shift', 'glitch.shift-forward', 'glitch.phase-jab', 'Space Shift',
    'Phases through the opponent and changes sides.',
    ['lp', 'hp'], 'glitch.rift-mobility.4'),
  technique('glitch', 'pixel-uppercut', 'glitch.rift-uppercut', 'glitch.phase-jab', 'Pixel Uppercut',
    'A vertical digital launcher for air routes.',
    ['lp', 'hk'], 'glitch.airspace-dominance.4'),
  technique('glitch', 'frame-skip', 'glitch.spatial-dash', 'glitch.rift-elbow', 'Frame Skip',
    'A short phase dodge that slips out of the current line.',
    ['lk', 'hp'], 'glitch.reality-corruption.3'),
  technique('glitch', 'reality-break', 'glitch.reality-slice', 'glitch.breakpoint-axe', 'Reality Break',
    'A heavy reality fracture with amplified knockback.',
    ['hk', 'hp'], 'glitch.reality-corruption.8', 'heavyKnockback'),

  technique('lucky', 'lucky-shot', 'lucky.quick-draw', 'lucky.quick-draw', 'Lucky Shot',
    'Fires a fast golden ranged strike.',
    ['lp', 'hp'], 'lucky.loaded-odds.2', 'projectile'),
  technique('lucky', 'coin-flip', 'lucky.luck.prepare', 'lucky.quick-draw', 'Coin Flip',
    'Prepares a visible Luck modifier for the next attack.',
    ['lp', 'lk'], 'lucky.loaded-odds.4'),
  technique('lucky', 'jackpot-kick', 'lucky.special.jackpot-rush', 'lucky.loaded-shoulder', 'Jackpot Kick',
    'A spinning multi-hit kick that extends a confirmed route.',
    ['lk', 'hk'], 'lucky.winning-momentum.4'),
  technique('lucky', 'loaded-dice', 'lucky.special.loaded-strike', 'lucky.loaded-shoulder', 'Loaded Dice',
    'Throws a slower, heavier green-gold ranged attack.',
    ['lk', 'hp'], 'lucky.loaded-odds.6', 'projectile'),
  technique('lucky', 'all-in', 'lucky.enhanced.fortune-break', 'lucky.fortune-heel', 'All In',
    'A slow committed heavy with enormous damage and a real resource price.',
    ['hk', 'hp'], 'lucky.loaded-odds.8'),

  technique('vorgh', 'blood-rush', 'vorgh.special.berserk-dash', 'vorgh.normal.predator-rake', 'Blood Rush',
    'An aggressive armoured rush into close pressure.',
    ['lp', 'hk'], 'vorgh.predator-pressure.2'),
  technique('vorgh', 'rage-uppercut', 'vorgh.special.predator-leap', 'vorgh.normal.predator-rake', 'Rage Uppercut',
    'A brutal rising launcher.',
    ['lp', 'lk'], 'vorgh.controlled-fury.4'),
  technique('vorgh', 'pain-burst', 'vorgh.special.blood-roar', 'vorgh.normal.skull-ram', 'Pain Burst',
    'A close area burst powered by stored pain.',
    ['lk', 'hp'], 'vorgh.pain-transmutation.4'),
  technique('vorgh', 'savage-knee', 'vorgh.dual.rend', 'vorgh.normal.skull-ram', 'Savage Knee',
    'A fast knee that keeps the combo route alive.',
    ['lk', 'hk'], 'vorgh.predator-pressure.5'),
  technique('vorgh', 'last-breath', 'vorgh.ultimate.last-beast', 'vorgh.normal.rising-maul', 'Last Breath',
    'A huge low-health finisher that keeps Last Beast resource gates.',
    ['hk', 'hp'], 'vorgh.pain-transmutation.8'),

  technique('titan', 'titan-grab', 'titan.grab.command', 'titan.normal.piston-hammer', 'Titan Grab',
    'A close command grab with heavyweight carry.',
    ['lp', 'hk'], 'titan.grapple-authority.2'),
  technique('titan', 'armor-charge', 'titan.special.armour-charge', 'titan.normal.bulkhead-backfist', 'Armor Charge',
    'An armoured forward rush.',
    ['lk', 'hk'], 'titan.siege-armour.4'),
  technique('titan', 'ground-breaker', 'titan.normal.seismic-stomp', 'titan.normal.piston-hammer', 'Ground Breaker',
    'A seismic ground shockwave.',
    ['lp', 'hp'], 'titan.impact-engineering.4', 'projectile'),
  technique('titan', 'iron-slam', 'titan.grab.ground-slam', 'titan.normal.piston-hammer', 'Iron Slam',
    'Locks the opponent and drives them into the floor.',
    ['lp', 'lk'], 'titan.grapple-authority.5'),
  technique('titan', 'colossus-launch', 'titan.special.reactor-breaker', 'titan.normal.siege-ram', 'Colossus Launch',
    'A massive rising launcher with heavy recovery.',
    ['hk', 'hp'], 'titan.impact-engineering.8'),
];

export function sequenceTechniquesFor(characterId: CharacterId): readonly SequenceTechnique[] {
  return SEQUENCE_TECHNIQUES.filter((entry) => entry.characterId === characterId);
}

export function sequenceTechniqueByMoveId(moveId: string): SequenceTechnique | undefined {
  return SEQUENCE_TECHNIQUES.find((entry) => entry.moveId === moveId);
}

export function sequenceTechniquesUnlockedBy(nodeId: string): readonly SequenceTechnique[] {
  return SEQUENCE_TECHNIQUES.filter((entry) => entry.unlockNodeId === nodeId);
}
