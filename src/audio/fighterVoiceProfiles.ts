import type { CharacterId } from '@/src/data/characterRoster';

export type VoiceCategory = 'dodge' | 'taunt' | 'victory';

interface VoiceLine {
  readonly src: string;
  readonly text: string;
}

type FighterVoiceProfile = Readonly<Record<
  VoiceCategory,
  readonly VoiceLine[]
>>;

export const FIGHTER_VOICE_PROFILES = {
  mim: {
    dodge: [
      { src: '/audio/mim/dodge-01.mp3', text: 'Это был мув или судорога?' },
      { src: '/audio/mim/dodge-02.mp3', text: 'Я бы тоже промахнулся от стыда.' },
      { src: '/audio/mim/dodge-03.mp3', text: 'Попробуй руками, мышка не поможет.' },
    ],
    taunt: [
      { src: '/audio/mim/taunt-01.mp3', text: 'Чтобы выиграть, нажми Alt+F4.' },
      { src: '/audio/mim/taunt-02.mp3', text: 'Сейчас будет момент для тиктока.' },
      { src: '/audio/mim/taunt-03.mp3', text: 'Ты точно главный герой своей истории?' },
    ],
    victory: [
      { src: '/audio/mim/victory-01.mp3', text: 'GG. Mostly me.' },
      { src: '/audio/mim/victory-02.mp3', text: 'Спасибо за бесплатные очки рейтинга.' },
      { src: '/audio/mim/victory-03.mp3', text: 'Если что, это записывалось.' },
    ],
  },
  glitch: {
    dodge: [
      { src: '/audio/glitch/dodge-01.mp3', text: 'Ошибка 403.' },
      { src: '/audio/glitch/dodge-02.mp3', text: 'Попробуйте перезагрузить противника.' },
      { src: '/audio/glitch/dodge-03.mp3', text: 'Атака не найдена.' },
    ],
    taunt: [
      { src: '/audio/glitch/taunt-01.mp3', text: 'Работает как задумано.' },
      { src: '/audio/glitch/taunt-02.mp3', text: 'Не баг. Особенность.' },
      { src: '/audio/glitch/taunt-03.mp3', text: 'Разработчик бы это не одобрил.' },
    ],
    victory: [
      { src: '/audio/glitch/victory-01.mp3', text: 'Opponent.exe перестал отвечать.' },
      { src: '/audio/glitch/victory-02.mp3', text: 'Критическая ошибка игрока.' },
      { src: '/audio/glitch/victory-03.mp3', text: 'Патчноуты были против тебя.' },
    ],
  },
} as const satisfies Partial<Record<CharacterId, FighterVoiceProfile>>;

export type VoicedCharacterId = keyof typeof FIGHTER_VOICE_PROFILES;

export function hasVoiceProfile(
  characterId: CharacterId,
): characterId is VoicedCharacterId {
  return characterId in FIGHTER_VOICE_PROFILES;
}
