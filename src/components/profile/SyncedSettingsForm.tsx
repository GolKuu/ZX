import { useState, type FormEvent } from 'react';
import { applyLocalAccessibility, syncCurrentSettings } from '../../lib/settingsSync';
import { settingsStore, type GameSettings } from '../../stores/settingsStore';

export function SyncedSettingsForm({ userId }: { userId?: string }) {
  const [settings, setSettings] = useState(() => settingsStore.load());
  const [message, setMessage] = useState('');

  async function save(event: FormEvent) {
    event.preventDefault();
    settingsStore.save(settings);
    applyLocalAccessibility(settings);
    if (!userId) {
      setMessage('Настройки сохранены на этом устройстве.');
      return;
    }
    try {
      await syncCurrentSettings(userId);
      setMessage('Настройки и раскладка синхронизированы.');
    } catch {
      setMessage('Сохранено локально. Облачная синхронизация продолжится после подключения.');
    }
  }

  return (
    <form className="account-panel account-panel--wide settings-form" onSubmit={save}>
      <div>
        <h2>Игровые настройки</h2>
        <p>Раскладка из раздела «Управление» синхронизируется вместе с этими параметрами.</p>
      </div>
      <div className="form-grid">
        <label>Графика
          <select
            value={settings.graphicsQuality}
            onChange={(event) => patch(setSettings, { graphicsQuality: event.target.value as GameSettings['graphicsQuality'] })}
          >
            <option value="low">Низкая</option>
            <option value="medium">Средняя</option>
            <option value="high">Высокая</option>
          </select>
        </label>
        <label>Уровень крови
          <select
            value={settings.bloodLevel}
            onChange={(event) => patch(setSettings, { bloodLevel: Number(event.target.value) as 0 | 1 | 2 })}
          >
            <option value={0}>Выключена</option>
            <option value={1}>Умеренно</option>
            <option value={2}>Полностью</option>
          </select>
        </label>
        <Volume label="Общая громкость" value={settings.masterVolume}
          onChange={(masterVolume) => patch(setSettings, { masterVolume })} />
        <Volume label="Музыка" value={settings.musicVolume}
          onChange={(musicVolume) => patch(setSettings, { musicVolume })} />
        <Volume label="Эффекты" value={settings.effectsVolume}
          onChange={(effectsVolume) => patch(setSettings, { effectsVolume })} />
      </div>
      <fieldset className="accessibility-options">
        <legend>Доступность</legend>
        <Toggle label="Уменьшить движение" checked={settings.reducedMotion}
          onChange={(reducedMotion) => patch(setSettings, { reducedMotion })} />
        <Toggle label="Высокая контрастность" checked={settings.highContrast}
          onChange={(highContrast) => patch(setSettings, { highContrast })} />
        <Toggle label="Крупный текст" checked={settings.largeText}
          onChange={(largeText) => patch(setSettings, { largeText })} />
        <Toggle label="Боевые подсказки" checked={settings.showCombatHints}
          onChange={(showCombatHints) => patch(setSettings, { showCombatHints })} />
      </fieldset>
      <button className="button button--primary">Сохранить настройки</button>
      {message && <p className="account-message" role="status">{message}</p>}
    </form>
  );
}

function Volume({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>{label}: {Math.round(value * 100)}%
      <input type="range" min="0" max="1" step="0.05" value={value}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return <label><input type="checkbox" checked={checked}
    onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}

function patch(
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>,
  change: Partial<GameSettings>,
) {
  setSettings((current) => ({ ...current, ...change }));
}
