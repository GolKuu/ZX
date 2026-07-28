import { Link, useRoute } from 'wouter';
import { AchievementList } from '../components/profile/AchievementList';
import { StatisticsCard } from '../components/profile/StatisticsCard';
import { useAccountData } from '../components/profile/useAccountData';
import { AppShell } from '../components/layout/AppShell';
import { circleFighters } from '../game/data/characters/circleFighters';

export function PublicPlayerPage() {
  const [, params] = useRoute<{ playerId: string }>('/players/:playerId');
  const { data, error } = useAccountData(params?.playerId ?? '');

  return (
    <AppShell>
      <Link href="/profile" className="back-link">← Мой профиль</Link>
      {error && <section className="account-panel"><h1>Игрок не найден</h1></section>}
      {!data && !error && <p className="profile-status">Загружаем публичный профиль…</p>}
      {data && (
        <div className="account-grid">
          <section className="account-panel account-panel--wide public-player-card">
            <Avatar nickname={data.profile.nickname} url={data.profile.avatar_url} />
            <div>
              <p className="eyebrow">Публичный профиль</p>
              <h1>{data.profile.nickname}</h1>
              <p>
                Регион: {data.profile.region} · Язык: {data.profile.language} · В игре с{' '}
                {new Date(data.profile.created_at).toLocaleDateString('ru-RU')}
              </p>
              <p>
                Любимые персонажи: {favoriteNames(data.profile.favorite_character_ids)}
              </p>
            </div>
          </section>
          <StatisticsCard statistics={data.statistics} />
          <AchievementList achievements={data.achievements} />
        </div>
      )}
    </AppShell>
  );
}

function favoriteNames(ids: string[]) {
  const names = ids
    .map((id) => circleFighters.find((fighter) => fighter.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : 'ещё не выбраны';
}

function Avatar({ nickname, url }: { nickname: string; url: string | null }) {
  return url ? <img className="profile-avatar" src={url} alt="" /> : (
    <span className="profile-card__avatar">{nickname.slice(0, 1).toUpperCase()}</span>
  );
}
