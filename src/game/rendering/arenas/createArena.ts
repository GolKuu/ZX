import Phaser from 'phaser';
import { balanceConfig } from '../../config/balanceConfig';
import type { ArenaId } from '../../data/arenas/arenaCatalog';
import { settingsStore } from '../../../stores/settingsStore';
import {
  paintMoonNursery,
  paintPaperHarbor,
  paintQuietCanopy,
} from './ArenaPainters';

export function createArena(
  scene: Phaser.Scene,
  arenaId: ArenaId = settingsStore.load().arenaId,
) {
  const graphics = scene.add.graphics();
  if (arenaId === 'moon-nursery') paintMoonNursery(graphics);
  else if (arenaId === 'paper-harbor') paintPaperHarbor(graphics);
  else paintQuietCanopy(graphics);

  graphics.fillGradientStyle(0x596273, 0x596273, 0x343c4a, 0x343c4a, 1);
  graphics.fillRect(0, balanceConfig.groundY, balanceConfig.arenaWidth, 90);
  graphics.fillStyle(accentFor(arenaId))
    .fillRect(0, balanceConfig.groundY, balanceConfig.arenaWidth, 7);
  return graphics;
}

function accentFor(arenaId: ArenaId) {
  if (arenaId === 'moon-nursery') return 0x75e0ce;
  if (arenaId === 'paper-harbor') return 0xff7185;
  return 0xffb95a;
}
