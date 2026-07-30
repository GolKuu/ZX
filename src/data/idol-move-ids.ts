export const IDOL_MOVE_IDS = {
  lp: 'idol.lp',
  hp: 'idol.hp',
  lk: 'idol.lk',
  hk: 'idol.hk',
  highlight: 'idol.super.highlight',
  million: 'idol.super.million',
  cancel: 'idol.ultimate.cancel',
} as const;

export type IdolCinematicMoveId =
  | typeof IDOL_MOVE_IDS.highlight
  | typeof IDOL_MOVE_IDS.million
  | typeof IDOL_MOVE_IDS.cancel;

export const IDOL_SUPER_COSTS: Readonly<Record<IdolCinematicMoveId, number>> = {
  [IDOL_MOVE_IDS.highlight]: 33,
  [IDOL_MOVE_IDS.million]: 100,
  [IDOL_MOVE_IDS.cancel]: 100,
};

export function isIdolCinematicMove(
  moveId: string,
): moveId is IdolCinematicMoveId {
  return moveId in IDOL_SUPER_COSTS;
}

export function idolSuperCostForMove(moveId: string): number | null {
  return isIdolCinematicMove(moveId) ? IDOL_SUPER_COSTS[moveId] : null;
}
