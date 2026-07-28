import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { AchievementList } from './AchievementList';
import { ProfileEditor } from './ProfileEditor';
import { SecurityPanel } from './SecurityPanel';
import { StatisticsCard } from './StatisticsCard';
import { SyncedSettingsForm } from './SyncedSettingsForm';
import { useAccountData } from './useAccountData';

export function AccountProfile({ user }: { user: User }) {
  const { data, error, reload } = useAccountData(user.id);

  if (error) return <p className="auth-message auth-message--error">{error}</p>;
  if (!data) return <p className="profile-status">Загружаем данные бойца…</p>;

  return (
    <div className="account-grid">
      <div className="account-toolbar">
        <Link className="button button--secondary" href={`/players/${user.id}`}>
          Открыть публичную карточку
        </Link>
      </div>
      <ProfileEditor profile={data.profile} onSaved={reload} />
      <StatisticsCard statistics={data.statistics} />
      <AchievementList achievements={data.achievements} />
      <SyncedSettingsForm userId={user.id} />
      <SecurityPanel email={user.email ?? ''} />
    </div>
  );
}
