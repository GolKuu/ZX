import { useMemo, useState } from 'react';
import { KeyBindingEditor } from '../components/controls/KeyBindingEditor';
import { CombinationGuide } from '../components/controls/CombinationGuide';
import { ControlGuide } from '../components/controls/ControlGuide';
import { ControlSchemeSelector } from '../components/controls/ControlSchemeSelector';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { ControlStorage } from '../game/input/ControlStorage';
import { applyControlScheme } from '../game/input/controlSchemes';
import type { ControlScheme, PlayerId } from '../game/core/types';
import { findKeyboardConflicts } from '../game/input/inputValidation';
import { settingsStore } from '../stores/settingsStore';

const storage = new ControlStorage();

export function ControlsPage() {
  const [profiles, setProfiles] = useState(() => storage.load());
  const [showCombatHints, setShowCombatHints] = useState(
    () => settingsStore.load().showCombatHints,
  );
  const [message, setMessage] = useState('');
  const conflicts = useMemo(() => findKeyboardConflicts(profiles), [profiles]);

  function save() {
    if (conflicts.length > 0) {
      setMessage('Сначала устраните конфликты клавиш.');
      return;
    }
    storage.save(profiles);
    settingsStore.save({ ...settingsStore.load(), showCombatHints });
    setMessage('Настройки сохранены на этом устройстве.');
  }

  function reset() {
    setProfiles(storage.reset());
    setMessage('Настройки сброшены.');
  }

  function changeScheme(playerId: PlayerId, scheme: ControlScheme) {
    setProfiles((current) => ({
      ...current,
      [playerId]: applyControlScheme(current[playerId], scheme),
    }));
    setMessage('');
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="8 назначаемых действий"
        title="Управление"
        description="Выберите схему и назначьте только основные кнопки. Комбинации подстроятся сами."
      />
      <div className="scheme-grid">
        {(['player1', 'player2'] as const).map((playerId) => (
          <ControlSchemeSelector
            key={playerId}
            playerId={playerId}
            value={profiles[playerId].scheme}
            onChange={(scheme) => changeScheme(playerId, scheme)}
          />
        ))}
      </div>
      <ControlGuide />
      {conflicts.length > 0 && (
        <p className="setup-error" role="alert">
          Конфликтов: {conflicts.length}. Используйте «Заменить», чтобы обменять назначения.
        </p>
      )}
      <KeyBindingEditor profiles={profiles} onChange={setProfiles} />
      <CombinationGuide />
      <label className="combat-hints-toggle">
        <input
          type="checkbox"
          checked={showCombatHints}
          onChange={(event) => setShowCombatHints(event.target.checked)}
        />
        Показывать важные боевые подсказки
      </label>
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
