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
      {
        src: '/audio/mim/taunt-02.mp3',
        text: 'Сейчас будет момент, который вырежут в тикток.',
      },
      { src: '/audio/mim/taunt-03.mp3', text: 'Ты точно главный герой своей истории?' },
    ],
    victory: [
      { src: '/audio/mim/victory-01.mp3', text: 'GG. Mostly me.' },
      {
        src: '/audio/mim/victory-02.mp3',
        text: 'Спасибо за бесплатные очки рейтинга.',
      },
      { src: '/audio/mim/victory-03.mp3', text: 'Если что, это записывалось.' },
    ],
  },
  echo: {
    dodge: [
      { src: '/audio/echo/dodge-01.mp3', text: 'Я это уже видел.' },
      { src: '/audio/echo/dodge-02.mp3', text: 'Повторяешься.' },
      { src: '/audio/echo/dodge-03.mp3', text: 'Скучно.' },
    ],
    taunt: [
      { src: '/audio/echo/taunt-01.mp3', text: 'Угадай, что ты сейчас нажмешь.' },
      { src: '/audio/echo/taunt-02.mp3', text: 'Я уже знаю следующий мув.' },
      { src: '/audio/echo/taunt-03.mp3', text: 'Повтори для статистики.' },
    ],
    victory: [
      { src: '/audio/echo/victory-01.mp3', text: 'Спасибо за данные.' },
      { src: '/audio/echo/victory-02.mp3', text: 'Предсказуемость — страшная сила.' },
      { src: '/audio/echo/victory-03.mp3', text: 'Я победил тебя твоим же планом.' },
    ],
  },
} as const satisfies Partial<Record<CharacterId, FighterVoiceProfile>>;

export type VoicedCharacterId = keyof typeof FIGHTER_VOICE_PROFILES;

export function hasVoiceProfile(
  characterId: CharacterId,
): characterId is VoicedCharacterId {
  return characterId in FIGHTER_VOICE_PROFILES;
}
