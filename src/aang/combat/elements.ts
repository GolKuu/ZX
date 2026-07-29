import type { FighterInput } from '@/src/sim';

export const AANG_ELEMENTS = ['air', 'fire', 'earth', 'water'] as const;
export type AangCombatElement = (typeof AANG_ELEMENTS)[number];
export type AangAttackButton = 'lp' | 'hp' | 'lk' | 'hk';
export type CombatFighterId = 'p1' | 'p2';

export const AANG_ELEMENT_INFO: Readonly<
  Record<AangCombatElement, { readonly color: string; readonly label: string }>
> = {
  air: { color: '#9beeff', label: 'Воздух' },
  fire: { color: '#ff613d', label: 'Огонь' },
  earth: { color: '#8fbd62', label: 'Земля' },
  water: { color: '#46a9ff', label: 'Вода' },
};

const INPUT_TO_BUTTON: Readonly<Record<string, AangAttackButton>> = {
  'aang-input-lp': 'lp',
  'aang-input-hp': 'hp',
  'aang-input-lk': 'lk',
  'aang-input-hk': 'hk',
  '5L': 'lp',
  '2L': 'lp',
  '5H': 'hp',
  '5M': 'lk',
  '2M': 'hk',
};

export function aangNormalMoveId(
  element: AangCombatElement,
  button: AangAttackButton,
): string {
  return `${element}-${button}`;
}

export function elementFromMove(moveId: string): AangCombatElement | null {
  return AANG_ELEMENTS.find((element) => moveId.startsWith(`${element}-`)) ?? null;
}

export function shiftElementFromMove(
  moveId: string | undefined,
): AangCombatElement | null {
  if (moveId === undefined || !moveId.startsWith('element-shift-')) return null;
  const element = moveId.slice('element-shift-'.length);
  return AANG_ELEMENTS.find((candidate) => candidate === element) ?? null;
}

export class AangCombatController {
  private element: AangCombatElement = 'air';

  public constructor(
    private readonly publish: (element: AangCombatElement) => void,
  ) {}

  public resolve(input: FighterInput): FighterInput {
    const shifted = shiftElementFromMove(input.move);
    if (shifted !== null) {
      this.element = shifted;
      this.publish(shifted);
      return input;
    }
    const button = input.move === undefined ? undefined : INPUT_TO_BUTTON[input.move];
    return button === undefined
      ? input
      : { ...input, move: aangNormalMoveId(this.element, button) };
  }

  public reset(): void {
    this.element = 'air';
    this.publish('air');
  }
}
