import styles from './HomeHighlights.module.css';

const highlights = [
  { value: '5', label: 'УНИКАЛЬНЫХ БОЙЦОВ' },
  { value: '2', label: 'РЕЖИМА БОЯ' },
  { value: '60', label: 'FPS · ЦЕЛЕВАЯ ЧАСТОТА' },
];

export function HomeHighlights() {
  return (
    <footer className={styles.highlights} aria-label="Особенности игры">
      {highlights.map((highlight) => (
        <div key={highlight.label}><strong>{highlight.value}</strong><span>{highlight.label}</span></div>
      ))}
      <p>ЛОКАЛЬНО · ПРОТИВ ИИ · БЕСПЛАТНО</p>
    </footer>
  );
}
