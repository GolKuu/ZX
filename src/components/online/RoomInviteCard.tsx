import { useState } from 'react';

export function RoomInviteCard({
  roomCode,
  inviteUrl,
}: {
  roomCode: string;
  inviteUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <section className="invite-card">
      <div>
        <p className="eyebrow">Приватная комната</p>
        <strong className="room-code">{roomCode}</strong>
        <p>Отправьте другу эту ссылку. Третьего игрока сервер не пропустит.</p>
      </div>
      <div className="invite-card__actions">
        <input aria-label="Ссылка-приглашение" value={inviteUrl} readOnly />
        <button type="button" className="button button--primary" onClick={copyInvite}>
          {copied ? 'Скопировано!' : 'Копировать ссылку'}
        </button>
      </div>
    </section>
  );
}
