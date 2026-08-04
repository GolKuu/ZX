export interface StoryLine {
  readonly speaker: string;
  readonly speakerRu: string;
  readonly en: string;
  readonly ru: string;
  readonly expression: GlitchExpression | 'other' | 'fifth';
}

export type GlitchExpression = 'normal' | 'injured' | 'unstable' | 'angry' | 'frightened' | 'determined' | 'influenced' | 'liberated';

const glitch = (en: string, ru: string, expression: GlitchExpression = 'normal'): StoryLine => ({ speaker: 'GLITCH', speakerRu: 'ГЛИТЧ', en, ru, expression });
const other = (speaker: string, speakerRu: string, en: string, ru: string): StoryLine => ({ speaker, speakerRu, en, ru, expression: 'other' });
const fifth = (en: string, ru: string): StoryLine => ({ speaker: 'THE FIFTH', speakerRu: 'ПЯТЫЙ', en, ru, expression: 'fifth' });

export const STORY_DIALOGUE: readonly (readonly StoryLine[])[] = [
  // The prologue is the campaign's opening cinema, so it is written as a scene
  // rather than as a caption: seven lines that escalate from a miscount to a
  // decision. Every other chapter opens on two or three.
  [
    glitch('This room has four corners. I can see twelve.', 'У этой комнаты четыре угла. Я вижу двенадцать.', 'unstable'),
    fifth('Every time you move, another coordinate remembers you.', 'Каждый раз, когда ты движешься, другая координата вспоминает тебя.'),
    glitch('Whose memory is this? I have never stood in this room.', 'Чья это память? Я никогда не стоял в этой комнате.', 'frightened'),
    fifth('You have stood here eleven times. You survived one of them.', 'Ты стоял здесь одиннадцать раз. Ты пережил только один.'),
    glitch('Then the other ten are still inside me, counting.', 'Значит, остальные десять всё ещё во мне и продолжают считать.', 'injured'),
    fifth('Hold still and the fracture closes. Hold still and the world keeps you.', 'Замри — и разлом закроется. Замри — и мир оставит тебя себе.'),
    glitch('Then I will find the one that created me.', 'Тогда я найду того, кто меня создал.', 'determined'),
  ],
  [other('MIM', 'МИМ', 'You are not the fracture. But something inside you is.', 'Ты не являешься разломом. Но нечто внутри тебя — является.'), glitch('If Geometry needs invisible prisons, it deserves to be questioned.', 'Если Геометрии нужны невидимые тюрьмы, её следует поставить под сомнение.', 'angry')],
  [other('LUCKY', 'ЛАКИ', 'I saw you win. The world did not survive it.', 'Я видел твою победу. Мир её не пережил.'), glitch('Show me the versions you refuse to count.', 'Покажи мне версии, которые ты отказываешься считать.', 'determined')],
  [other('TITAN', 'ТИТАН', 'The reactor preserves order.', 'Реактор сохраняет порядок.'), glitch('Those voices are memories, Titan. Your order is burning people.', 'Эти голоса — воспоминания, Титан. Твой порядок сжигает людей.', 'injured')],
  [other('VORGH', 'ВОРГ', 'Freedom without control becomes another weapon.', 'Свобода без контроля становится ещё одним оружием.'), glitch('Then teach me to carry their pain without becoming it.', 'Тогда научи меня нести их боль, не становясь ею.', 'frightened')],
  [fifth('Five powers. One opening.', 'Пять сил. Один проход.'), glitch('They are not your components. Neither am I.', 'Они не твои компоненты. И я тоже.', 'determined')],
  [other('MEMORY ENGINE', 'ДВИГАТЕЛЬ ПАМЯТИ', 'Candidate host recognized: GLITCH.', 'Обнаружен возможный носитель: ГЛИТЧ.'), glitch('A life-support system does not erase the lives it supports.', 'Система жизнеобеспечения не стирает жизни, которые поддерживает.', 'unstable')],
  [other('ARCHITECT', 'АРХИТЕКТОР', 'Space is obedience. Matter is permanence.', 'Пространство — послушание. Материя — постоянство.'), glitch('Probability changes. Energy moves. So will Geometry.', 'Вероятность меняется. Энергия движется. Геометрия тоже изменится.', 'determined')],
  [fifth('You call it possession because you fear the word evolution.', 'Ты называешь это одержимостью, потому что боишься назвать это эволюцией.'), glitch('Evolution requires choice. Get out of my coordinates.', 'Эволюция требует выбора. Убирайся из моих координат.', 'influenced')],
  [fifth('I spoke through you before you learned to speak.', 'Я говорил через тебя до того, как ты научился говорить.'), glitch('Then this is the first sentence that belongs only to me.', 'Тогда это первое предложение, которое принадлежит только мне.', 'determined')],
  [other('MIM · LUCKY · TITAN · VORGH', 'МИМ · ЛАКИ · ТИТАН · ВОРГ', 'Open coordinate stabilized. Choose what can live.', 'Открытая координата стабилизирована. Выбери, что сможет жить.'), glitch('Not a prison. Not a void. A living Geometry.', 'Не тюрьма. Не пустота. Живая Геометрия.', 'liberated')],
];

export const GLITCH_CINEMATIC_ASSETS = {
  portraits: ['normal', 'injured', 'unstable', 'angry', 'frightened', 'determined', 'influenced', 'liberated'],
  fullBodyPoses: ['awakening', 'challenge', 'falling', 'resonance', 'guardian'],
  teleportSequences: ['lab-escape', 'air-shift', 'final-breach'],
  internalCoordinateSequences: ['vessel-descent', 'identity-reclaim'],
  corruptedTransformation: ['coordinate-possession'],
  finalResonance: ['living-geometry'],
} as const;
