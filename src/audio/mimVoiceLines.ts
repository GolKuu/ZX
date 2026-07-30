export const MIM_VOICE_LINES = {
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
} as const;

export type MimVoiceCategory = keyof typeof MIM_VOICE_LINES;
