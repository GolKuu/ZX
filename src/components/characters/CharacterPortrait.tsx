import type { CSSProperties } from 'react';
import type { CharacterDefinition } from '../../game/data/characters/circleFighters';

export function CharacterPortrait({
  character,
  large = false,
}: {
  character: CharacterDefinition;
  large?: boolean;
}) {
  return (
    <span
      className={large ? 'fighter-portrait fighter-portrait--large' : 'fighter-portrait'}
      style={{
        '--fighter-color': character.cssColor,
        '--fighter-accent': character.accentCss,
      } as CSSProperties}
      aria-hidden="true"
    >
      {character.visualModel.symbol}
    </span>
  );
}
