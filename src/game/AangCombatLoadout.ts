import {
  AangCombatController,
  type CombatFighterId,
} from '@/src/aang/combat/elements';
import type { CharacterSelection } from '@/src/data/characterRoster';
import type { FighterInput } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';

export class AangCombatLoadout {
  private readonly controllers: Readonly<
    Partial<Record<CombatFighterId, AangCombatController>>
  >;

  public constructor(selection: CharacterSelection) {
    const controllers: Partial<Record<CombatFighterId, AangCombatController>> = {};
    const setElement = useRenderStore.getState().setAangElement;
    if (selection[0] === 'aang') {
      controllers.p1 = new AangCombatController(
        (element) => setElement('p1', element),
      );
    }
    if (selection[1] === 'aang') {
      controllers.p2 = new AangCombatController(
        (element) => setElement('p2', element),
      );
    }
    this.controllers = controllers;
  }

  public resolve(fighterId: CombatFighterId, input: FighterInput): FighterInput {
    return this.controllers[fighterId]?.resolve(input) ?? input;
  }

  public reset(): void {
    for (const controller of Object.values(this.controllers)) controller.reset();
  }
}
