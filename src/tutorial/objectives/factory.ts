/**
 * `ObjectiveSpec` → `Detector`.
 *
 * The switch is exhaustive on purpose: adding an objective kind without adding
 * its detector is a compile error, not a lesson that silently never completes.
 */

import type { Detector, DetectorDeps } from './detector.js';
import { Counter } from './detector.js';
import {
  AntiAirDetector,
  ArmourDetector,
  BlockAttackDetector,
  EscapeThrowDetector,
  GuardBreakDetector,
  HitTargetDetector,
  LandThrowDetector,
  PunishDetector,
  ReversalDetector,
  WhiffMoveDetector,
} from './combat.js';
import { ComboHitsDetector, ComboRouteDetector } from './combo.js';
import {
  PerformMotionDetector,
  PerformMoveDetector,
  PressButtonDetector,
  PressChordDetector,
} from './inputs.js';
import {
  DashDetector,
  HoldDirectionDetector,
  JumpDetector,
  ReachZoneDetector,
  SwitchSidesDetector,
} from './movement.js';
import {
  ExternalActionDetector,
  NoDamageDetector,
  ReachResourceDetector,
  SpawnWallDetector,
  SpendResourceDetector,
  SurviveDetector,
  WallInteractionDetector,
} from './resource.js';
import { AllDetector, SequenceDetector } from './composite.js';
import type { ObjectiveSpec } from './types.js';

export function createDetector(
  spec: ObjectiveSpec,
  deps: DetectorDeps,
): Detector {
  switch (spec.kind) {
    case 'holdDirection':
      return new HoldDirectionDetector(spec.direction, spec.frames);
    case 'reachZone':
      return new ReachZoneDetector(spec.zone, spec.requireDirection);
    case 'switchSides':
      return new SwitchSidesDetector();
    case 'pressButton':
      return new PressButtonDetector(spec.button, spec.count);
    case 'pressChord':
      return new PressChordDetector(spec.buttons, spec.count);
    case 'performMotion':
      return new PerformMotionDetector(spec.motion, spec.count, spec.button);
    case 'performMove':
      return new PerformMoveDetector(spec.moveIds, spec.count);
    case 'jump':
      return new JumpDetector(spec.direction, spec.count);
    case 'dash':
      return new DashDetector(spec.direction, spec.count);
    case 'hitTarget':
      return new HitTargetDetector(spec.moveIds, spec.count);
    case 'whiffMove':
      return new WhiffMoveDetector(spec.moveIds, spec.count);
    case 'blockAttack':
      return new BlockAttackDetector(
        deps,
        spec.count,
        spec.level,
        spec.requirePerfect ?? false,
        spec.requirePainGuard ?? false,
      );
    case 'takeGuardBreak':
      return new GuardBreakDetector(spec.count);
    case 'escapeThrow':
      return new EscapeThrowDetector(spec.count);
    case 'landThrow':
      return new LandThrowDetector(spec.kinds, spec.count);
    case 'reversal':
      return new ReversalDetector(spec.moveIds, spec.windowFrames);
    case 'punishRecovery':
      return new PunishDetector(deps, spec.count);
    case 'antiAir':
      return new AntiAirDetector(spec.count);
    case 'combo':
      return new ComboRouteDetector(spec.route, spec.requireTrue);
    case 'comboHits':
      return new ComboHitsDetector(spec.minimum, spec.requireTrue);
    case 'absorbWithArmour':
      return new ArmourDetector(spec.count);
    case 'reachResource':
      return new ReachResourceDetector(spec.minimum);
    case 'spendResource':
      return new SpendResourceDetector(spec.minimum);
    case 'spawnWall':
      return new SpawnWallDetector(spec.count);
    case 'wallInteraction':
      return new WallInteractionDetector(spec.phases, spec.count);
    case 'surviveSequence':
      return new SurviveDetector(spec.frames, spec.maxHitsTaken);
    case 'noDamageTaken':
      return new NoDamageDetector(spec.frames);
    case 'progressionAction':
    case 'trainingAction':
      return new ExternalActionDetector(spec.action, spec.detail);
    case 'sequence':
      return new SequenceDetector(
        spec.steps.map((step) => createDetector(step, deps)),
      );
    case 'all':
      return new AllDetector(
        spec.steps.map((step) => createDetector(step, deps)),
      );
  }
}

/** Every external detector inside a tree, so the runner can route reports. */
export function collectExternal(
  detector: Detector,
): readonly ExternalActionDetector[] {
  if (detector instanceof ExternalActionDetector) return [detector];
  if (detector instanceof SequenceDetector || detector instanceof AllDetector) {
    return detector.children.flatMap(collectExternal);
  }
  return [];
}

/** An objective that can never fail — used by pure "watch this" steps. */
export class AlwaysDetector extends Counter {
  public constructor() {
    super(1);
    this.succeed();
  }
}
