interface TrainingLessonBase {
  readonly title: string;
  readonly instruction: string;
}

export type TrainingLesson = TrainingLessonBase & (
  | { readonly kind: 'keys'; readonly required: readonly string[] }
  | { readonly kind: 'hits'; readonly required: number }
);

export const TRAINING_LESSONS: readonly TrainingLesson[] = [
  {
    title: 'Движение',
    instruction: 'Нажмите A и D, чтобы подойти к мишени и отступить.',
    kind: 'keys',
    required: ['KeyA', 'KeyD'],
  },
  {
    title: 'Стойка',
    instruction: 'Нажмите W для прыжка и S для приседания.',
    kind: 'keys',
    required: ['KeyW', 'KeyS'],
  },
  {
    title: 'Первые удары',
    instruction: 'Попадите по мишени 3 раза. Атаки: J, K, I и L.',
    kind: 'hits',
    required: 3,
  },
  {
    title: 'Серия ударов',
    instruction: 'Нанесите ещё 5 ударов по мишени без спешки.',
    kind: 'hits',
    required: 5,
  },
] as const;

export function lessonProgress(
  lesson: TrainingLesson,
  pressed: ReadonlySet<string>,
  hits: number,
): { readonly current: number; readonly required: number } {
  if (lesson.kind === 'hits') {
    return { current: Math.min(hits, lesson.required), required: lesson.required };
  }
  return {
    current: lesson.required.filter((key) => pressed.has(key)).length,
    required: lesson.required.length,
  };
}
