import { useEffect, useState, type FormEvent } from 'react';
import { applyLocalAccessibility, syncCurrentSettings } from '../../lib/settingsSync';
import { settingsStore, type GameSettings } from '../../stores/settingsStore';

export function SyncedSettingsForm({ userId }: { userId?: string }) {
  const [settings, setSettings] = useState(() => settingsStore.load());
  const [message, setMessage] = useState('');

  useEffect(() => {
    const refresh = () => setSettings(settingsStore.load());
    window.addEventListener('circle-clash-settings-synced', refresh);
    return () => window.removeEventListener('circle-clash-settings-synced', refresh);
  }, []);

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
        <label>Мультяшные частицы попаданий
          <select
            value={settings.bloodLevel}
            onChange={(event) => patch(setSettings, {
              bloodLevel: Number(event.target.value) as GameSettings['bloodLevel'],
            })}
          >
            <option value={0}>Выключена</option>
            <option value={1}>Мало</option>
            <option value={2}>Средне</option>
            <option value={3}>Много</option>
          </select>
        </label>
        <label>Тряска камеры
          <select value={settings.cameraShake} onChange={(event) => patch(setSettings, {
            cameraShake: Number(event.target.value) as GameSettings['cameraShake'],
          })}>
            <option value={0}>Выключена</option>
            <option value={1}>Лёгкая</option>
            <option value={2}>Средняя</option>
            <option value={3}>Сильная</option>
          </select>
        </label>
        <label>Масштаб интерфейса: {Math.round(settings.uiScale * 100)}%
          <input type="range" min="0.85" max="1.3" step="0.05"
            value={settings.uiScale}
            onChange={(event) => patch(setSettings, { uiScale: Number(event.target.value) })} />
        </label>
        <Volume label="Общая громкость" value={settings.masterVolume}
          onChange={(masterVolume) => patch(setSettings, { masterVolume })} />
        <Volume label="Музыка" value={settings.musicVolume}
          onChange={(musicVolume) => patch(setSettings, { musicVolume })} />
        <Volume label="Эффекты" value={settings.effectsVolume}
          onChange={(effectsVolume) => patch(setSettings, { effectsVolume })} />
      </div>
      <p className="settings-note">
        Частицы всегда абстрактные и мультяшные: без органов, ран и реалистичной крови.
      </p>
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
