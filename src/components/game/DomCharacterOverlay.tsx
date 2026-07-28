import React, { useEffect, useRef, useState } from 'react';
import { useGameBridge } from '../../app/gameBridgeContext';
import { GameEvents } from '../../game/bridge/GameEvents';
import { CharacterArt } from '../characters/CharacterArt';
import { getCharacter } from '../../game/data/characters/circleFighters';

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

  if (!pos || !containerRef.current) return null;

  const styleFor = (p: any) => ({
    position: 'absolute' as const,
    transform: `translate(${p.x - 80}px, ${p.y - 140}px) scale(${p.facing === 1 ? 1 : -1}, 1)`,
    width: 160,
    height: 200,
    pointerEvents: 'none' as const,
  });

  const leftChar = getCharacter('caliber');
  const rightChar = getCharacter('zephyr');

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
