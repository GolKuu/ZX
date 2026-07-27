import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Phaser is intentionally isolated behind the lazy /fight route.
    chunkSizeWarningLimit: 1_700,
  },
});
