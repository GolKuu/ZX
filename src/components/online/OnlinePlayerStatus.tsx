import type { OnlinePlayerView } from '../../game/network/protocol';
import { getCharacter } from '../../game/data/characters/circleFighters';
import { CharacterPortrait } from '../characters/CharacterPortrait';

export function OnlinePlayerStatus({
  title,
  player,
}: {
  title: string;
  player?: OnlinePlayerView;
}) {
  return (
    <article className={`online-player ${player?.ready ? 'online-player--ready' : ''}`}>
      {player ? (
        <>
          <CharacterPortrait character={getCharacter(player.characterId)} />
          <div>
            <span>{title}</span>
            <strong>{player.ready ? 'Готов к бою' : 'Выбирает бойца'}</strong>
            <small>
              {player.connected ? 'Подключён' : 'Переподключается'}
              {player.pingMs !== null ? ` · ${player.pingMs} ms` : ''}
            </small>
          </div>
        </>
      ) : (
        <div>
          <span>{title}</span>
          <strong>Ждём друга по ссылке…</strong>
        </div>
      )}
    </article>
  );
}
