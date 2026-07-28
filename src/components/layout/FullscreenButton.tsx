import { useEffect, useState } from 'react';

export function FullscreenButton({ compact = false }: { compact?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported] = useState(
    () => typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen),
  );

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    sync();
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  if (!isSupported) return null;

  async function toggle() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  return (
    <button
      type="button"
      className={compact ? 'fullscreen-button fullscreen-button--compact' : 'fullscreen-button'}
      onClick={() => void toggle()}
      aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}
      title={isFullscreen ? 'Выйти из fullscreen' : 'Fullscreen'}
    >
      <span aria-hidden="true">{isFullscreen ? '↙' : '↗'}</span>
      {!compact && <span>{isFullscreen ? 'Свернуть' : 'На весь экран'}</span>}
    </button>
  );
}
