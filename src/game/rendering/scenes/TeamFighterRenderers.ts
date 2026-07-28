import Phaser from 'phaser';
import type { PlayerId } from '../../core/types';
import { getCharacter } from '../../data/characters/circleFighters';
import type { TeamSimulationSnapshot } from '../../team/TeamTypes';
import { FighterRenderer } from '../fighters/FighterRenderer';
import { FightHud } from '../hud/FightHud';

type RenderedFighter = {
  characterId: string;
  renderer: FighterRenderer;
};

export class TeamFighterRenderers {
  private readonly active: Partial<Record<PlayerId, RenderedFighter>> = {};
  private readonly helpers: Partial<Record<PlayerId, RenderedFighter>> = {};
  private hud: FightHud | null = null;
  private hudCharacters = '';

  constructor(private readonly scene: Phaser.Scene) {}

  sync(snapshot: TeamSimulationSnapshot, countdownLabel: string) {
    const context = { matchWinner: snapshot.matchWinner };
    const stopped = snapshot.hitStopTicks > 0;
    for (const teamId of ['player1', 'player2'] as const) {
      const fighter = snapshot.fighters[teamId];
      const active = this.ensure(this.active, teamId, fighter.characterId);
      active.renderer.sync(fighter, context, stopped);
      const assist = snapshot.teamBattle.teams[teamId].assist;
      if (assist) {
        const helper = this.ensure(
          this.helpers,
          teamId,
          assist.fighter.characterId,
        );
        helper.renderer.sync(assist.fighter, context, stopped);
        helper.renderer.container.setAlpha(0.88);
      } else {
        this.helpers[teamId]?.renderer.destroy();
        delete this.helpers[teamId];
      }
    }
    this.syncHud(snapshot, countdownLabel);
  }

  destroy() {
    Object.values(this.active).forEach((item) => item.renderer.destroy());
    Object.values(this.helpers).forEach((item) => item.renderer.destroy());
    this.hud?.destroy();
  }

  private ensure(
    collection: Partial<Record<PlayerId, RenderedFighter>>,
    teamId: PlayerId,
    characterId: string,
  ) {
    const current = collection[teamId];
    if (current?.characterId === characterId) return current;
    current?.renderer.destroy();
    const next = {
      characterId,
      renderer: new FighterRenderer(this.scene, teamId, getCharacter(characterId)),
    };
    collection[teamId] = next;
    return next;
  }

  private syncHud(snapshot: TeamSimulationSnapshot, countdownLabel: string) {
    const key = `${snapshot.fighters.player1.characterId}:${snapshot.fighters.player2.characterId}`;
    if (!this.hud || this.hudCharacters !== key) {
      this.hud?.destroy();
      this.hud = new FightHud(
        this.scene,
        getCharacter(snapshot.fighters.player1.characterId),
        getCharacter(snapshot.fighters.player2.characterId),
        true,
      );
      this.hudCharacters = key;
    }
    this.hud.update(snapshot, countdownLabel);
  }
}
