import { useMemo, useState } from 'react';
import { useOptionalAuth } from '../app/authContext';
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
import { syncCurrentSettings } from '../lib/settingsSync';

const storage = new ControlStorage();

export function ControlsPage() {
  const user = useOptionalAuth()?.user ?? null;
  const [profiles, setProfiles] = useState(() => storage.load());
  const [showCombatHints, setShowCombatHints] = useState(
    () => settingsStore.load().showCombatHints,
  );
  const [message, setMessage] = useState('');
  const conflicts = useMemo(() => findKeyboardConflicts(profiles), [profiles]);

  async function save() {
    if (conflicts.length > 0) {
      setMessage('Сначала устраните конфликты клавиш.');
      return;
    }
    storage.save(profiles);
    settingsStore.save({ ...settingsStore.load(), showCombatHints });
    if (!user) {
      setMessage('Настройки сохранены на этом устройстве.');
      return;
    }
    try {
      await syncCurrentSettings(user.id);
      setMessage('Раскладка и настройки синхронизированы.');
    } catch {
      setMessage('Сохранено локально. Облако сейчас недоступно.');
    }
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
        <button type="button" className="button button--primary" onClick={() => void save()}>
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
