'use client';

import { useEffect, useState } from 'react';
import {
  disposeMimAttacks,
  disposeMimSpriteRig,
  loadMimAttacks,
  loadMimSpriteRig,
  type LoadedMimAttacks,
  type LoadedMimRig,
} from './mimSpriteRig';

interface MimSprites {
  readonly attacks: LoadedMimAttacks | null;
  readonly rig: LoadedMimRig | null;
}

export function useMimSprites(): MimSprites {
  const [sprites, setSprites] = useState<MimSprites>({
    attacks: null,
    rig: null,
  });

  useEffect(() => {
    let cancelled = false;
    let loaded: MimSprites = { attacks: null, rig: null };

    Promise.all([loadMimSpriteRig(), loadMimAttacks()])
      .then(([rig, attacks]) => {
        loaded = { attacks, rig };
        if (cancelled) {
          disposeMimSpriteRig(rig);
          disposeMimAttacks(attacks);
        } else {
          setSprites(loaded);
        }
      })
      .catch((error: unknown) => {
        console.warn('MIM sprite assets could not load.', error);
      });

    return () => {
      cancelled = true;
      if (loaded.rig !== null) disposeMimSpriteRig(loaded.rig);
      if (loaded.attacks !== null) disposeMimAttacks(loaded.attacks);
    };
  }, []);

  return sprites;
}
