export type ProgressionTextKey = keyof typeof EN;
const EN = {
  hub:'PROGRESSION HUB', daily:'DAILY TOKEN', claim:'CLAIM', next:'NEXT REWARD', achievements:'ACHIEVEMENTS',
  trees:'FIGHTER TREES', challenges:'CHALLENGES', balance:'TOKEN BALANCE', purchased:'PURCHASED', available:'AVAILABLE',
  locked:'LOCKED', completed:'COMPLETED', inProgress:'IN PROGRESS', rewardClaimed:'REWARD CLAIMED', back:'BACK',
  respec:'FULL RESPEC', ranked:'Ranked uses standardized loadouts and ignores permanent Token progression.',
  training:'Training can preview base, purchased, all-node, or custom builds without changing saved Tokens.',
};
const RU: Record<ProgressionTextKey, string> = {
  hub:'ЦЕНТР ПРОГРЕССА', daily:'ЕЖЕДНЕВНЫЙ ТОКЕН', claim:'ПОЛУЧИТЬ', next:'СЛЕДУЮЩАЯ НАГРАДА', achievements:'ДОСТИЖЕНИЯ',
  trees:'ДЕРЕВЬЯ БОЙЦОВ', challenges:'ИСПЫТАНИЯ', balance:'БАЛАНС ТОКЕНОВ', purchased:'КУПЛЕНО', available:'ДОСТУПНО',
  locked:'ЗАКРЫТО', completed:'ВЫПОЛНЕНО', inProgress:'В ПРОЦЕССЕ', rewardClaimed:'НАГРАДА ПОЛУЧЕНА', back:'НАЗАД',
  respec:'ПОЛНЫЙ СБРОС', ranked:'В рейтинге используются стандартные наборы без постоянных улучшений.',
  training:'В тренировке доступны базовый, купленный, полный или тестовый наборы без изменения токенов.',
};
export const progressionText = (language: 'en' | 'ru', key: ProgressionTextKey): string => (language === 'ru' ? RU : EN)[key];
export function tokenLabel(value: number, language: 'en' | 'ru'): string {
  if (language === 'en') return `${value} Token${value === 1 ? '' : 's'}`;
  const mod10 = Math.abs(value) % 10; const mod100 = Math.abs(value) % 100;
  const word = mod10 === 1 && mod100 !== 11 ? 'токен' : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14) ? 'токена' : 'токенов';
  return `${value} ${word}`;
}
