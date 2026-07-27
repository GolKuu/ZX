import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/game/tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
