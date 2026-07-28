import Phaser from 'phaser';
import type { LocalTeamBattleConfig } from '../../stores/teamBattleStore';
import type { ReactGameBridge } from '../bridge/ReactGameBridge';
import { createTeamFightScene } from '../rendering/scenes/TeamFightScene';
import { balanceConfig } from './balanceConfig';

export function createTeamGameConfig(
  parent: HTMLElement,
  bridge: ReactGameBridge,
  config: LocalTeamBattleConfig,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: balanceConfig.arenaWidth,
    height: balanceConfig.arenaHeight,
    backgroundColor: '#8bd8ff',
    scene: [createTeamFightScene(bridge, config)],
    render: { antialias: true, pixelArt: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: balanceConfig.arenaWidth,
      height: balanceConfig.arenaHeight,
    },
  };
}
