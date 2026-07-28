import type { CharacterId } from '../../data/characters/circleFighters';

export type VictorySceneDefinition = {
  title: string;
  line: string;
};

export const VICTORY_CUTSCENE_MS = 3_200;

export const VICTORY_SCENES: Record<CharacterId, VictorySceneDefinition> = {
  granite: { title: 'НЕПОКОЛЕБИМЫЙ', line: 'Гора пережила бурю.' },
  caliber: { title: 'ТОЧНЫЙ ФИНАЛ', line: 'Последний заряд поставил точку.' },
  volt: { title: 'БЫСТРЕЕ МОЛНИИ', line: 'Гром приходит после победы.' },
  nocturne: { title: 'БЕЗДНА СМОТРИТ', line: 'Ночь забрала эту арену.' },
  ragnar: { title: 'ДРАКОН ПРОСНУЛСЯ', line: 'Пламя признаёт сильнейшего.' },
  marina: { title: 'ВЫШЕ ПРИЛИВА', line: 'Вода всегда находит путь.' },
  zephyr: { title: 'СВОБОДНЫЙ ВЕТЕР', line: 'Его нельзя удержать.' },
  origami: { title: 'ИДЕАЛЬНАЯ ФОРМА', line: 'Один сгиб изменил исход.' },
  poro: { title: 'МЯГКАЯ СИЛА', line: 'Он впитал каждый удар.' },
  fenr: { title: 'ЗОВ СТАИ', line: 'Охота закончена.' },
  sylvan: { title: 'КОРНИ ПОБЕДЫ', line: 'Лес остаётся стоять.' },
  adamant: { title: 'СИЛА ВОЛИ', line: 'Человек превзошёл предел.' },
  vassa: { title: 'ПОСЛЕДНИЙ УКУС', line: 'Яд уже решил исход.' },
  shira: { title: 'ИДЕАЛЬНЫЙ СРЕЗ', line: 'Лишнее осталось позади.' },
  pyron: { title: 'ЯРЧЕ СОЛНЦА', line: 'Арена запомнит этот жар.' },
};
