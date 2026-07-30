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
  idol: {
    dodge: [
      { src: '/audio/idol/dodge-01.mp3', text: 'Чат, вы это видели?' },
      { src: '/audio/idol/dodge-02.mp3', text: 'Клип готов.' },
      { src: '/audio/idol/dodge-03.mp3', text: 'Модераторы, запишите это.' },
    ],
    taunt: [
      { src: '/audio/idol/taunt-01.mp3', text: 'Лайк за попытку.' },
      { src: '/audio/idol/taunt-02.mp3', text: 'Сейчас будет хайлайт.' },
      {
        src: '/audio/idol/taunt-03.mp3',
        text: 'Давайте поддержим соперника аплодисментами.',
      },
    ],
    victory: [
      { src: '/audio/idol/victory-01.mp3', text: 'Спасибо подписчикам.' },
      {
        src: '/audio/idol/victory-02.mp3',
        text: 'Этот матч уже в рекомендациях.',
      },
      {
        src: '/audio/idol/victory-03.mp3',
        text: 'Поставьте лайк поражению.',
      },
    ],
  },
  glitch: {
    dodge: [
      { src: '/audio/glitch/dodge-01.mp3', text: 'Ошибка 403.' },
      {
        src: '/audio/glitch/dodge-02.mp3',
        text: 'Попробуйте перезагрузить противника.',
      },
      { src: '/audio/glitch/dodge-03.mp3', text: 'Атака не найдена.' },
    ],
    taunt: [
      { src: '/audio/glitch/taunt-01.mp3', text: 'Работает как задумано.' },
      { src: '/audio/glitch/taunt-02.mp3', text: 'Не баг. Особенность.' },
      {
        src: '/audio/glitch/taunt-03.mp3',
        text: 'Разработчик бы это не одобрил.',
      },
    ],
    victory: [
      {
        src: '/audio/glitch/victory-01.mp3',
        text: 'Opponent.exe перестал отвечать.',
      },
      {
        src: '/audio/glitch/victory-02.mp3',
        text: 'Критическая ошибка игрока.',
      },
      {
        src: '/audio/glitch/victory-03.mp3',
        text: 'Патчноуты были против тебя.',
      },
    ],
  },
  chrono: {
    dodge: [
      { src: '/audio/chrono/dodge-01.mp3', text: 'Я видел это через пять секунд.' },
      { src: '/audio/chrono/dodge-02.mp3', text: 'Старая версия событий.' },
      { src: '/audio/chrono/dodge-03.mp3', text: 'Неудачная линия времени.' },
    ],
    taunt: [
      {
        src: '/audio/chrono/taunt-01.mp3',
        text: 'Из 143 вариантов ты выбрал худший.',
      },
      {
        src: '/audio/chrono/taunt-02.mp3',
        text: 'В другой вселенной это сработало.',
      },
      {
        src: '/audio/chrono/taunt-03.mp3',
        text: 'Статистика не на твоей стороне.',
      },
    ],
    victory: [
      {
        src: '/audio/chrono/victory-01.mp3',
        text: 'Наиболее вероятный результат.',
      },
      {
        src: '/audio/chrono/victory-02.mp3',
        text: 'Я проверял. Других концовок нет.',
      },
      {
        src: '/audio/chrono/victory-03.mp3',
        text: 'Статистика беспощадна.',
      },
    ],
  },
} as const satisfies Partial<Record<CharacterId, FighterVoiceProfile>>;

export type VoicedCharacterId = keyof typeof FIGHTER_VOICE_PROFILES;

export function hasVoiceProfile(
  characterId: CharacterId,
): characterId is VoicedCharacterId {
  return characterId in FIGHTER_VOICE_PROFILES;
}
