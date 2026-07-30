import styles from './HomeArenaPreview.module.css';

export function HomeArenaPreview() {
  return (
    <aside className={styles.preview} aria-label="Предпросмотр следующего боя">
      <header>
        <span>СЛЕДУЮЩИЙ БОЙ</span>
        <b><i aria-hidden="true" /> READY</b>
      </header>

      <div className={styles.arena}>
        <div className={`${styles.fighter} ${styles.fighterLeft}`}>
          <span aria-hidden="true">I</span>
          <strong>IDOL</strong>
          <small>PLAYER 1</small>
        </div>
        <div className={styles.versus}>
          <span>VS</span>
          <i aria-hidden="true" />
        </div>
        <div className={`${styles.fighter} ${styles.fighterRight}`}>
          <span aria-hidden="true">G</span>
          <strong>GLITCH</strong>
          <small>CPU</small>
        </div>
      </div>

      <footer>
        <span>NULL CIRCLE</span>
        <span>BEST OF 3</span>
      </footer>
    </aside>
  );
}
