import type {
  AttackCategory,
  AttackDefinition,
  HitLevel,
} from '../../combat/AttackDefinition';
import type { GameAction } from '../../core/types';

type AttackOptions = {
  startup: number;
  active?: number;
  recovery: number;
  damage: number;
  action: GameAction;
  category: AttackCategory;
  level?: HitLevel;
  reach?: number;
  height?: number;
  knockbackX?: number;
  knockbackY?: number;
  knockdown?: boolean;
  sideSwitch?: boolean;
  energyCost?: number;
  cancelInto?: readonly AttackCategory[];
};

export function makeAttack(
  characterId: string,
  slot: string,
  options: AttackOptions,
): AttackDefinition {
  const active = options.active ?? 3;
  const activeStart = options.startup;
  const cancelStart = activeStart + active;
  const cancelInto = options.cancelInto ?? [];
  return {
    id: `${characterId}-${slot}`,
    startupFrames: options.startup,
    activeFrames: active,
    recoveryFrames: options.recovery,
    damage: options.damage,
    chipDamage: Math.max(0, Math.round(options.damage * 0.12)),
    blockDamage: Math.max(5, Math.round(options.damage * 1.4)),
    hitStun: Math.max(10, options.startup + 7),
    blockStun: Math.max(6, options.startup),
    knockbackX: options.knockbackX ?? 210,
    knockbackY: options.knockbackY ?? 0,
    hitLevel: options.level ?? 'mid',
    hitboxes: [
      {
        startFrame: activeStart,
        endFrame: activeStart + active - 1,
        offsetX: 24,
        offsetY: -(options.height ?? 58),
        width: options.reach ?? 74,
        height: options.height ?? 44,
      },
    ],
    movementTimeline:
      options.category === 'heavy' || options.category === 'throw'
        ? [{ frame: Math.max(0, options.startup - 2), velocityX: 145, velocityY: 0 }]
        : [],
    cancelWindows:
      cancelInto.length > 0
        ? [{
            startFrame: cancelStart,
            endFrame: cancelStart + Math.min(5, options.recovery),
            into: cancelInto,
            onHitOnly: true,
          }]
        : [],
    comboScaling: options.category === 'light' ? 0.88 : 0.82,
    reversalType: options.category === 'super' ? 'invincible' : 'none',
    comboEscapeWindows: [{ startFrame: activeStart, endFrame: cancelStart + 2 }],
    animationId: `${slot}-animation`,
    effectId: `${slot}-impact`,
    soundId: `${slot}-sound`,
    category: options.category,
    action: options.action,
    knockdown: options.knockdown ?? false,
    sideSwitch: options.sideSwitch ?? false,
    energyGain: Math.max(4, Math.round(options.damage * 0.8)),
    energyCost: options.energyCost ?? 0,
  };
}
