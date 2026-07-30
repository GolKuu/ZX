import {
  IDOL_MOVE_IDS,
  type IdolCinematicMoveId,
} from '@/src/data/idol-move-ids';
import { IdolCancelCinematic } from './IdolCancelCinematic';
import { IdolHighlightCinematic } from './IdolHighlightCinematic';
import { IdolMillionCinematic } from './IdolMillionCinematic';

export function IdolSuperCinematic({
  fighterId,
  moveId,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly moveId: IdolCinematicMoveId;
}) {
  if (moveId === IDOL_MOVE_IDS.highlight) {
    return <IdolHighlightCinematic fighterId={fighterId} />;
  }
  if (moveId === IDOL_MOVE_IDS.million) {
    return <IdolMillionCinematic fighterId={fighterId} />;
  }
  return <IdolCancelCinematic fighterId={fighterId} />;
}
