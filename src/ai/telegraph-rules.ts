import type { FighterSnapshot } from '../sim/state.js';
import type { TelegraphRequest } from './types.js';

export function telegraphSourceChanged(
  self: FighterSnapshot,
  request: TelegraphRequest,
): boolean {
  if (request.intent !== 'combo') {
    return self.action !== null;
  }
  return (
    request.sourceActionSerial !== null
    && self.action !== null
    && self.action.serial !== request.sourceActionSerial
  );
}
