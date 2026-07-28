import type { PlayerStatistics } from '../../lib/accountTypes';

export function StatisticsCard({ statistics }: { statistics: PlayerStatistics }) {
  return (
    <section className="account-panel">
      <h2>Статистика</h2>
      <dl className="stats-grid">
        <Stat label="Рейтинг" value={statistics.rating} />
        <Stat label="Матчи" value={statistics.matches_played} />
        <Stat label="Победы" value={statistics.wins} />
        <Stat label="Поражения" value={statistics.losses} />
      </dl>
      <p className="account-note">Email никогда не попадает в рейтинг или данные матча.</p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
