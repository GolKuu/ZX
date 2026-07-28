import Phaser from 'phaser';
import type { ReactGameBridge } from '../bridge/ReactGameBridge';
import type { LocalPvpMatchConfig } from '../../stores/localPvpStore';
import { balanceConfig } from './balanceConfig';
import { createFightScene } from '../rendering/scenes/FightScene';

export function createGameConfig(
  parent: HTMLElement,
  bridge: ReactGameBridge,
  matchConfig: LocalPvpMatchConfig,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: balanceConfig.arenaWidth,
    height: balanceConfig.arenaHeight,
    backgroundColor: '#8bd8ff',
    scene: [createFightScene(bridge, matchConfig)],
    render: {
      antialias: true,
      pixelArt: false,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: balanceConfig.arenaWidth,
      height: balanceConfig.arenaHeight,
    },
  };
}
