import { useState } from 'react';

export function OnlineStartPanel({
  busy,
  error,
  onCreate,
  onJoin,
}: {
  busy: boolean;
  error: string;
  onCreate: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState('');

  return (
    <section className="online-start">
      <div className="center-card">
        <p className="eyebrow">Приватный бой 1 на 1</p>
        <h2>Создайте комнату одним нажатием</h2>
        <p>Получите ссылку и отправьте её другу. Матч начнётся только после готовности обоих.</p>
        <button
          type="button"
          className="button button--primary button--large"
          disabled={busy}
          onClick={onCreate}
        >
          {busy ? 'Создаём…' : 'Создать приватную комнату'}
        </button>
      </div>
      <form
        className="center-card online-join"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.trim()) onJoin(code.trim().toUpperCase());
        }}
      >
        <p className="eyebrow">Есть код?</p>
        <h2>Войти в комнату</h2>
        <input
          aria-label="Код комнаты"
          maxLength={8}
          placeholder="ABCD2345"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
        <button type="submit" className="button button--secondary" disabled={busy}>
          Подключиться
        </button>
      </form>
      {error && <p className="setup-error" role="alert">{error}</p>}
    </section>
  );
}
