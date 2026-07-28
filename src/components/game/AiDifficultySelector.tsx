import {
  AI_DIFFICULTIES,
  type AiDifficulty,
} from '../../game/ai/AiDifficulty';

export function AiDifficultySelector({
  value,
  onChange,
}: {
  value: AiDifficulty;
  onChange: (difficulty: AiDifficulty) => void;
}) {
  return (
    <fieldset className="ai-difficulty">
      <legend>Сила компьютерного соперника</legend>
      <div className="ai-difficulty__grid">
        {AI_DIFFICULTIES.map((difficulty) => (
          <label
            className={
              value === difficulty.id
                ? 'ai-difficulty__option ai-difficulty__option--selected'
                : 'ai-difficulty__option'
            }
            key={difficulty.id}
          >
            <input
              type="radio"
              name="ai-difficulty"
              value={difficulty.id}
              checked={value === difficulty.id}
              onChange={() => onChange(difficulty.id)}
            />
            <strong>{difficulty.label}</strong>
            <small>{difficulty.description}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
