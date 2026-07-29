import { useMemo, useState } from 'react';
import { KeyBindingEditor } from '../components/controls/KeyBindingEditor';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { ControlStorage } from '../game/input/ControlStorage';
import { findKeyboardConflicts } from '../game/input/inputValidation';

const storage = new ControlStorage();

export function ControlsPage() {
  const [profiles, setProfiles] = useState(() => storage.load());
  const [message, setMessage] = useState('');
  const conflicts = useMemo(() => findKeyboardConflicts(profiles), [profiles]);

  function save() {
    if (conflicts.length > 0) {
      setMessage('Сначала устраните конфликты клавиш.');
      return;
    }
    storage.save(profiles);
    setMessage('Настройки сохранены на этом устройстве.');
  }

  function reset() {
    setProfiles(storage.reset());
    setMessage('Настройки сброшены.');
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Два независимых профиля"
        title="Управление"
        description="Выберите действие и нажмите следующую клавишу. Используется KeyboardEvent.code."
      />
      {conflicts.length > 0 && (
        <p className="setup-error" role="alert">
          Конфликтов: {conflicts.length}. Используйте «Заменить», чтобы обменять назначения.
        </p>
      )}
      <KeyBindingEditor profiles={profiles} onChange={setProfiles} />
      <div className="controls-actions">
        <button type="button" className="button button--primary" onClick={save}>
          Сохранить
        </button>
        <button type="button" className="button button--secondary" onClick={reset}>
          Сбросить
        </button>
      </div>
      {message && <p className="controls-message">{message}</p>}
    </AppShell>
  );
}
