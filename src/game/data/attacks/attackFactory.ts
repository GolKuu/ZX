import type {
  AttackCategory,
  AttackDefinition,
  AttackMotion,
  AttackVisualShape,
  HitLevel,
} from '../../combat/AttackDefinition';
import type { CombatAction } from '../../core/types';
import { balanceConfig } from '../../config/balanceConfig';

type AttackOptions = {
  name: string;
  description?: string;
  startup: number;
  active?: number;
  recovery: number;
  damage: number;
  action: CombatAction;
  category: AttackCategory;
  level?: HitLevel;
  reach?: number;
  height?: number;
  knockbackX?: number;
  knockbackY?: number;
  knockdown?: boolean;
  isFinisher?: boolean;
  sideSwitch?: boolean;
  energyCost?: number;
  cancelInto?: readonly AttackCategory[];
  hitStop?: number;
  movementSpeed?: number;
  armor?: boolean;
  verticalLift?: number;
  motion?: AttackMotion;
  visualShape?: AttackVisualShape;
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
  const hitboxHeight = options.height ?? 44;
  const hitboxCenterY = targetCenterY(
    options.level ?? 'mid',
    options.motion ?? defaultMotion(options.category, options.level),
    options.verticalLift,
  );
  return {
    id: `${characterId}-${slot}`,
    name: options.name,
    description: options.description ?? '',
    startupFrames: options.startup,
    activeFrames: active,
    recoveryFrames: options.recovery,
    damage: options.damage,
    chipDamage:
      options.category === 'special' || options.category === 'super'
        ? Math.max(1, Math.round(options.damage * 0.12))
        : 0,
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
        offsetY: hitboxCenterY - hitboxHeight / 2,
        width: options.reach ?? 74,
        height: hitboxHeight,
      },
    ],
    movementTimeline:
      options.category === 'heavy' || options.category === 'throw'
        ? [{
            frame: Math.max(0, options.startup - 2),
            velocityX: options.movementSpeed ?? 145,
            velocityY: 0,
          }]
        : [],
    cancelWindows:
      cancelInto.length > 0
        ? [{
            startFrame: cancelStart,
            endFrame:
              cancelStart + Math.min(balanceConfig.comboContinuationWindow, options.recovery),
            into: cancelInto,
            onHitOnly: true,
          }]
        : [],
    comboScaling:
      options.category === 'light' || options.category === 'heavy'
        ? balanceConfig.autoComboDamageScale
        : 0.82,
    reversalType: options.category === 'super'
      ? 'invincible'
      : options.armor
        ? 'armor'
        : 'none',
    comboEscapeWindows: [{ startFrame: activeStart, endFrame: cancelStart + 2 }],
    animationId: `${slot}-animation`,
    motion: options.motion ?? defaultMotion(options.category, options.level),
    visualShape: options.visualShape ?? defaultVisualShape(options.category, options.level),
    effectId: `${slot}-impact`,
    soundId: `${slot}-sound`,
    category: options.category,
    action: options.action,
    knockdown: options.knockdown ?? false,
    isFinisher: options.isFinisher ?? false,
    sideSwitch: options.sideSwitch ?? false,
    energyGain: Math.max(4, Math.round(options.damage * 0.8)),
    energyCost: options.energyCost ?? 0,
    hitStopFrames: options.hitStop ?? (options.category === 'heavy' ? 5 : 3),
    visualReach: (options.reach ?? 74) + 24,
  };
}

function targetCenterY(
  level: HitLevel,
  motion: AttackMotion,
  verticalLift?: number,
) {
  if (verticalLift !== undefined) return -verticalLift;
  if (level === 'low') return -16;
  if (level === 'air') return -44;
  if (level === 'throw') return -92;
  if (motion === 'punch' || motion === 'roundhouse-kick') return -148;
  if (motion === 'axe-kick') return -156;
  if (motion === 'front-kick' || motion === 'thrust') return -130;
  if (motion === 'slash') return -140;
  return -114;
}

function defaultMotion(category: AttackCategory, level?: HitLevel): AttackMotion {
  if (category === 'throw') return 'throw';
  if (category === 'special' || category === 'super') return 'burst';
  if (level === 'low') return 'sweep-kick';
  if (level === 'air') return 'front-kick';
  return category === 'heavy' ? 'slam' : 'punch';
}

function defaultVisualShape(category: AttackCategory, level?: HitLevel): AttackVisualShape {
  if (level === 'low') return 'ground';
  if (category === 'special' || category === 'super') return 'burst';
  return category === 'heavy' ? 'arc' : 'line';
}
