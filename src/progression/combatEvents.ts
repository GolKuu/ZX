import type { CharacterId } from '../data/characterRoster.js';
import type { CombatEvent, WorldSnapshot } from '../sim/index.js';
import { gameplayEvent } from './eventEngine.js';
import type { GameplayEvent } from './types.js';

export function progressionEventsFromCombat(events: readonly CombatEvent[], world: WorldSnapshot,
  sessionId: string, characterId: CharacterId): readonly GameplayEvent[] {
  return events.flatMap((event, index) => {
    const base = `${sessionId}:${event.frame}:${index}:${event.type}`;
    if (event.type === 'block' && event.defenderId === 'p1' && event.perfect) return [gameplayEvent('PerfectBlock', base, { characterId })];
    if (event.type === 'block' && event.defenderId === 'p1' && event.painGuard) return [gameplayEvent('PainGuard', base, { characterId })];
    if (event.type === 'guardBreak' && event.attackerId === 'p1') return [gameplayEvent('GuardBreak', base, { characterId })];
    if (event.type === 'grapple' && event.attackerId === 'p1') return [gameplayEvent('CommandGrab', base, { characterId })];
    if (event.type === 'armourAbsorbed' && event.defenderId === 'p1') return [gameplayEvent('ArmourAbsorbed', base, { characterId })];
    if (event.type === 'wallSpawned' && event.ownerId === 'p1') return [gameplayEvent('WallCreated', base, { characterId })];
    if (event.type === 'wallBounce' && event.fighterId === 'p2') return [gameplayEvent('WallRebound', base, { characterId })];
    if (event.type === 'hit' && event.attackerId === 'p1') {
      const defender = world.fighters.find((fighter) => fighter.id === 'p2');
      return defender === undefined ? [] : [gameplayEvent('ComboCompleted', base, { characterId })];
    }
    return [];
  });
}
