import type { EarnedAchievement } from '../../lib/accountTypes';

export function AchievementList({ achievements }: { achievements: EarnedAchievement[] }) {
  return (
    <section className="account-panel">
      <h2>Достижения</h2>
      {achievements.length === 0 ? (
        <p>Первое достижение появится после матча.</p>
      ) : (
        <ul className="achievement-list">
          {achievements.map(({ achievement, awarded_at }) => (
            <li key={achievement.id}>
              <span>{achievement.icon}</span>
              <div>
                <strong>{achievement.title}</strong>
                <small>{achievement.description} · {new Date(awarded_at).toLocaleDateString('ru-RU')}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
