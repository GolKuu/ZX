import { useEffect, useState } from 'react';
import {
  SHOWCASE_ANIMATION_STATES,
  animationStateLabel,
  type AnimationStateId,
} from '../../game/rendering/animation/AnimationCatalog';
import { CharacterArt } from './CharacterArt';

export function AnimationShowcase({
  characterId,
}: {
  characterId: 'granite' | 'shira';
}) {
  const [state, setState] = useState<AnimationStateId>('idle');
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setState((current) => {
        const index = SHOWCASE_ANIMATION_STATES.indexOf(current);
        return SHOWCASE_ANIMATION_STATES[(index + 1) % SHOWCASE_ANIMATION_STATES.length];
      });
    }, 1_850);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className="animation-showcase">
      <div className="animation-showcase__stage">
        <CharacterArt characterId={characterId} state={state} />
        <span>{animationStateLabel(state)}</span>
      </div>
      <div className="animation-showcase__controls" aria-label="Состояния анимации">
        {SHOWCASE_ANIMATION_STATES.map((item) => (
          <button
            type="button"
            className={item === state ? 'state-chip state-chip--active' : 'state-chip'}
            key={item}
            onClick={() => {
              setState(item);
              setPlaying(false);
            }}
          >
            {animationStateLabel(item)}
          </button>
        ))}
      </div>
      <button type="button" className="showcase-toggle" onClick={() => setPlaying(!playing)}>
        {playing ? 'Остановить автопоказ' : 'Продолжить автопоказ'}
      </button>
    </div>
  );
}
