export type GalleryEffect = 'arc' | 'projectile' | 'impact' | 'block' | 'trail';

export function EffectPreview({ effect }: { effect: GalleryEffect }) {
  return (
    <div className={`effect-preview effect-preview--${effect}`} aria-hidden="true">
      <span className="effect-preview__fighter" />
      <span className="effect-preview__shape" />
      <span className="effect-preview__spark effect-preview__spark--one" />
      <span className="effect-preview__spark effect-preview__spark--two" />
      <span className="effect-preview__spark effect-preview__spark--three" />
    </div>
  );
}

export function ParticlePreview({ level }: { level: 0 | 1 | 2 | 3 }) {
  const count = [0, 5, 10, 17][level];
  return (
    <div className="particle-preview" aria-label={`Уровень частиц: ${level}`}>
      <span className="particle-preview__impact">БАМ!</span>
      {Array.from({ length: count }, (_, index) => (
        <i
          key={index}
          style={{
            '--particle-angle': `${-145 + (index * 170) / Math.max(1, count - 1)}deg`,
            '--particle-distance': `${64 + index * 4}px`,
            '--particle-opacity': Math.max(0.48, 0.95 - index * 0.025),
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
