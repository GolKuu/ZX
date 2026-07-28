import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useGameBridge } from '../../app/gameBridgeContext';
import { GameEvents } from '../../game/bridge/GameEvents';
import { CharacterArt } from '../characters/CharacterArt';
import { getCharacter, circleFighters } from '../../game/data/characters/circleFighters';

export function DomCharacterOverlay({ parentRef }: { parentRef: React.RefObject<HTMLElement> }) {
  const bridge = useGameBridge();
  const [pos, setPos] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stop = bridge.on((GameEvents as any).domCharacterSync, (payload: any) => setPos(payload));
    return stop;
  }, [bridge]);

  useEffect(() => {
    if (!parentRef.current) return;
    const parent = parentRef.current as HTMLElement;
    if (!containerRef.current) {
      const div = document.createElement('div');
      div.className = 'dom-character-overlay';
      div.style.position = 'absolute';
      div.style.left = '0';
      div.style.top = '0';
      div.style.right = '0';
      div.style.bottom = '0';
      div.style.pointerEvents = 'none';
      parent.appendChild(div);
      containerRef.current = div;
    }
    return () => {
      if (containerRef.current && parent.contains(containerRef.current)) parent.removeChild(containerRef.current);
      containerRef.current = null;
    };
  }, [parentRef]);

  // generate Phaser-ready base64 textures from the SVG CharacterArt and notify the game
  useEffect(() => {
    const generated = new Set<string>();
    circleFighters.forEach((c) => {
      const id = c.id;
      if (generated.has(id)) return;
      generated.add(id);
      // create offscreen container to mount CharacterArt
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.width = '320px';
      div.style.height = '360px';
      document.body.appendChild(div);
      const root = ReactDOM.createRoot(div);
      root.render(React.createElement(CharacterArt, { characterId: id, state: 'idle' }));
      // give the browser a tick to render
      setTimeout(() => {
        const svg = div.querySelector('svg');
        if (svg) {
          const xml = new XMLSerializer().serializeToString(svg);
          const b64 = window.btoa(unescape(encodeURIComponent(xml)));
          const dataUrl = `data:image/svg+xml;base64,${b64}`;
          bridge.emit((GameEvents as any).characterTextureReady, { characterId: id, dataUrl });
        }
        root.unmount();
        if (div.parentElement) div.parentElement.removeChild(div);
      }, 50);
    });
  }, [bridge]);

  if (!pos || !containerRef.current) return null;

  const styleFor = (p: any) => ({
    position: 'absolute' as const,
    transform: `translate(${p.x - 80}px, ${p.y - 140}px) scale(${p.facing === 1 ? 1 : -1}, 1)`,
    width: 160,
    height: 200,
    pointerEvents: 'none' as const,
  });

  const p1Id = pos?.player1?.characterId ?? 'granite';
  const p2Id = pos?.player2?.characterId ?? 'shira';
  const leftChar = getCharacter(p1Id);
  const rightChar = getCharacter(p2Id);

  return (
    <div ref={containerRef}>
      <div style={styleFor(pos.player1)}>
        <CharacterArt characterId={leftChar.id} state={pos.player1.state} />
      </div>
      <div style={styleFor(pos.player2)}>
        <CharacterArt characterId={rightChar.id} state={pos.player2.state} />
      </div>
    </div>
  );
}

export default DomCharacterOverlay;
