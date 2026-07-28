import { useState, type FormEvent } from 'react';
import { circleFighters } from '../../game/data/characters/circleFighters';
import { updateProfile } from '../../lib/accountApi';
import type { PublicProfile } from '../../lib/accountTypes';

export function ProfileEditor({
  profile,
  onSaved,
}: {
  profile: PublicProfile;
  onSaved: () => Promise<void>;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [region, setRegion] = useState(profile.region);
  const [language, setLanguage] = useState(profile.language);
  const [favorites, setFavorites] = useState(profile.favorite_character_ids);
  const [message, setMessage] = useState('');

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      await updateProfile(profile.id, {
        nickname: nickname.trim(),
        avatar_url: avatarUrl.trim() || null,
        region,
        language,
        favorite_character_ids: favorites,
      });
      setMessage('Публичный профиль сохранён.');
      await onSaved();
    } catch {
      setMessage('Не удалось сохранить. Возможно, этот ник уже занят.');
    }
  }

  function toggleFavorite(characterId: string) {
    setFavorites((current) => {
      if (current.includes(characterId)) return current.filter((id) => id !== characterId);
      return current.length < 5 ? [...current, characterId] : current;
    });
  }

  return (
    <form className="account-panel account-panel--wide" onSubmit={save}>
      <div className="profile-heading">
        <Avatar nickname={nickname} url={avatarUrl} />
        <div>
          <h2>Публичный профиль</h2>
          <p>Создан {new Date(profile.created_at).toLocaleDateString('ru-RU')}</p>
        </div>
      </div>
      <div className="form-grid">
        <Field label="Ник" value={nickname} onChange={setNickname} minLength={3} maxLength={24} />
        <Field label="URL аватара (HTTPS)" value={avatarUrl} onChange={setAvatarUrl} type="url" />
        <label>Регион
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="KZ">Казахстан</option>
            <option value="RU">Россия</option>
            <option value="UZ">Узбекистан</option>
            <option value="KG">Кыргызстан</option>
            <option value="OTHER">Другой</option>
          </select>
        </label>
        <label>Язык
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="ru">Русский</option>
            <option value="kk">Қазақша</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <fieldset className="favorite-picker">
        <legend>Любимые персонажи — до 5</legend>
        {circleFighters.map((fighter) => (
          <label key={fighter.id}>
            <input
              type="checkbox"
              checked={favorites.includes(fighter.id)}
              onChange={() => toggleFavorite(fighter.id)}
            />
            {fighter.name}
          </label>
        ))}
      </fieldset>
      <button className="button button--primary">Сохранить профиль</button>
      {message && <p className="account-message" role="status">{message}</p>}
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', ...rest }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  minLength?: number;
  maxLength?: number;
}) {
  return <label>{label}<input {...rest} type={type} value={value}
    onChange={(event) => onChange(event.target.value)} /></label>;
}

function Avatar({ nickname, url }: { nickname: string; url: string }) {
  return url ? <img className="profile-avatar" src={url} alt="" /> : (
    <span className="profile-card__avatar">{nickname.trim().slice(0, 1).toUpperCase() || 'C'}</span>
  );
}
