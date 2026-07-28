import { balanceConfig } from '../config/balanceConfig';
import type {
  AttackHit,
  FighterSnapshot,
  GameAction,
  PlayerInputFrame,
} from '../core/types';

type AttackPreset = {
  action: GameAction;
  damage: number;
  cooldown: number;
  range: number;
  unblockable?: boolean;
};

const attacks: readonly AttackPreset[] = [
  { action: 'LIGHT_ATTACK', damage: 8, cooldown: 24, range: 104 },
  { action: 'HEAVY_ATTACK', damage: 14, cooldown: 38, range: 116 },
  { action: 'SPECIAL_ATTACK', damage: 18, cooldown: 54, range: 135 },
  { action: 'GRAB', damage: 11, cooldown: 42, range: 82, unblockable: true },
  { action: 'SUPER_ATTACK', damage: 25, cooldown: 90, range: 150 },
];

export class AttackSystem {
  tryAttack(
    attacker: FighterSnapshot,
    defender: FighterSnapshot,
    input: PlayerInputFrame,
  ): AttackHit | null {
    const preset = attacks.find((attack) => input.pressed.includes(attack.action));
    if (!preset || attacker.attackCooldownTicks > 0) return null;
    if (attacker.mode === 'hitstun' || attacker.mode === 'knockout') return null;

    attacker.attackCooldownTicks = preset.cooldown;
    attacker.mode = 'attacking';
    attacker.modeTicksRemaining = Math.min(18, Math.round(preset.cooldown / 2));

    const distance = Math.abs(attacker.x - defender.x);
    const heightDifference = Math.abs(attacker.y - defender.y);
    if (distance > preset.range || heightDifference > balanceConfig.fighterRadius) return null;

    return {
      attackerId: attacker.id,
      defenderId: defender.id,
      damage: preset.damage,
      hitstunTicks: balanceConfig.hitstunTicks,
      unblockable: preset.unblockable,
    };
  }
}
