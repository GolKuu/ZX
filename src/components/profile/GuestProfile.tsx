import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../app/authContext';
import { profileStore } from '../../stores/profileStore';
import { SyncedSettingsForm } from './SyncedSettingsForm';

export function GuestProfile() {
  const [, navigate] = useLocation();
  const { leaveGuestMode } = useAuth();
  const [profile, setProfile] = useState(() => profileStore.load());
  const [message, setMessage] = useState('');

  function save(event: FormEvent) {
    event.preventDefault();
    profileStore.save(profile);
    setMessage('Гостевой профиль сохранён только на этом устройстве.');
  }

  return (
    <div className="account-grid">
      <form className="account-panel account-panel--wide" onSubmit={save}>
        <div className="profile-heading">
          <span className="profile-card__avatar">
            {profile.nickname.trim().slice(0, 1).toUpperCase() || 'Г'}
          </span>
          <div>
            <h2>Гостевой профиль</h2>
            <p>Статистика и достижения гостя не попадают в онлайн-рейтинг.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>Ник
            <input minLength={3} maxLength={24} value={profile.nickname}
              onChange={(event) => setProfile({ ...profile, nickname: event.target.value })} />
          </label>
          <label>Регион
            <input value={profile.region}
              onChange={(event) => setProfile({ ...profile, region: event.target.value })} />
          </label>
          <label>Язык
            <select value={profile.language}
              onChange={(event) => setProfile({ ...profile, language: event.target.value })}>
              <option value="ru">Русский</option>
              <option value="kk">Қазақша</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <button className="button button--primary">Сохранить локально</button>
        {message && <p className="account-message">{message}</p>}
      </form>
      <SyncedSettingsForm />
      <section className="account-panel account-panel--wide">
        <h2>Хотите облачное сохранение?</h2>
        <p>Создайте аккаунт — email останется приватным.</p>
        <button className="button button--secondary" onClick={() => {
          leaveGuestMode();
          navigate('/auth');
        }}>
          Войти или зарегистрироваться
        </button>
      </section>
    </div>
  );
}
