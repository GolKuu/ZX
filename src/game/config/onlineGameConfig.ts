import Phaser from 'phaser';
import type { ReactGameBridge } from '../bridge/ReactGameBridge';
import type { OnlineMatchClient } from '../network/OnlineMatchClient';
import { createOnlineFightScene } from '../rendering/scenes/OnlineFightScene';
import { balanceConfig } from './balanceConfig';

export function createOnlineGameConfig(
  parent: HTMLElement,
  bridge: ReactGameBridge,
  client: OnlineMatchClient,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: balanceConfig.arenaWidth,
    height: balanceConfig.arenaHeight,
    backgroundColor: '#8bd8ff',
    scene: [createOnlineFightScene(bridge, client)],
    render: { antialias: true, pixelArt: false },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: balanceConfig.arenaWidth,
      height: balanceConfig.arenaHeight,
    },
  };
}
