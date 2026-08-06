'use client';

import { useEffect } from 'react';
import { useRenderStore } from '@/src/store/renderStore';

export function ThemeSync() {
  const theme = useRenderStore((state) => state.theme);
  const hydratePreferences = useRenderStore((state) => state.hydratePreferences);

  useEffect(() => {
    hydratePreferences();
  }, [hydratePreferences]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}
