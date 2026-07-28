import { useState } from 'react';
import { Link } from 'wouter';
import { ArenaPreview } from '../components/art/ArenaPreview';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import {
  arenaCatalog,
  type ArenaId,
} from '../game/data/arenas/arenaCatalog';
import { settingsStore } from '../stores/settingsStore';

export function ArenaViewerPage() {
  const [selectedId, setSelectedId] = useState<ArenaId>(() => settingsStore.load().arenaId);
  const [saved, setSaved] = useState(false);
  const selected = arenaCatalog.find(({ id }) => id === selectedId) ?? arenaCatalog[0];

  function select(arenaId: ArenaId) {
    setSelectedId(arenaId);
    setSaved(false);
  }

  function save() {
    settingsStore.save({ ...settingsStore.load(), arenaId: selectedId });
    setSaved(true);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Art Lab · Arena Viewer"
        title="Три спокойных мира"
        description="Фон поддерживает настроение, но оставляет бойцов и атаки самыми контрастными объектами сцены."
      />
      <section className="arena-viewer">
        <div className="arena-viewer__stage">
          <ArenaPreview arenaId={selectedId} />
          <span className="arena-viewer__badge">Арена боя</span>
        </div>
        <aside className="arena-viewer__panel">
          <div>
            <p className="eyebrow">Выбрано</p>
            <h2>{selected.name}</h2>
            <p>{selected.mood}</p>
          </div>
          <div className="arena-tabs">
            {arenaCatalog.map((arena) => (
              <button
                type="button"
                key={arena.id}
                className={arena.id === selectedId ? 'arena-tab arena-tab--active' : 'arena-tab'}
                onClick={() => select(arena.id)}
                style={{ '--arena-accent': arena.accent } as React.CSSProperties}
              >
                <i />
                <span><strong>{arena.name}</strong><small>{arena.mood}</small></span>
              </button>
            ))}
          </div>
          <div className="viewer-actions">
            <button type="button" className="button button--primary" onClick={save}>
              Играть на этой арене
            </button>
            <Link href="/local-pvp" className="button button--secondary">К выбору бойцов</Link>
          </div>
          {saved && <p className="viewer-message" role="status">Арена выбрана для следующего боя.</p>}
        </aside>
      </section>
    </AppShell>
  );
}
