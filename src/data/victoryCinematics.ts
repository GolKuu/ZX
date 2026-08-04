import type { CharacterId } from './characterRoster.js';

export interface VictoryCinematicDefinition {
  readonly characterId: CharacterId;
  readonly title: string;
  readonly subtitle: string;
  readonly quote: string;
  readonly accent: string;
  readonly accentSoft: string;
}

export const VICTORY_CINEMATICS: Readonly<Record<CharacterId, VictoryCinematicDefinition>> = {
  mim: {
    characterId: 'mim',
    title: 'THE LAST LAUGH',
    subtitle: 'Curtain call // no encore',
    quote: '«Публика запомнит только победителя.»',
    accent: '#67f5e8',
    accentSoft: '#1d817b',
  },
  glitch: {
    characterId: 'glitch',
    title: 'PROCESS TERMINATED',
    subtitle: 'Opponent.exe // fatal error',
    quote: '«Твоя ошибка стала частью системы.»',
    accent: '#ff3e77',
    accentSoft: '#7430ff',
  },
  lucky: {
    characterId: 'lucky',
    title: 'JACKPOT',
    subtitle: 'Impossible odds // perfect outcome',
    quote: '«Это не везение. Это мой расчёт.»',
    accent: '#ffd45f',
    accentSoft: '#f06d31',
  },
  vorgh: {
    characterId: 'vorgh',
    title: 'PAIN REMEMBERS',
    subtitle: 'Rage threshold // exceeded',
    quote: '«Теперь ты знаешь, что делает меня сильнее.»',
    accent: '#ff713d',
    accentSoft: '#8e1e19',
  },
  titan: {
    characterId: 'titan',
    title: 'FINAL DIRECTIVE',
    subtitle: 'Target neutralized // armour intact',
    quote: '«Приказ выполнен. Сопротивление окончено.»',
    accent: '#9eeaff',
    accentSoft: '#376f91',
  },
};

export function victoryCinematicFor(characterId: CharacterId): VictoryCinematicDefinition {
  return VICTORY_CINEMATICS[characterId];
}
