import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/game/tests/**/*.integration.test.{ts,tsx}',
      'src/game/tests/AuthFlow.test.tsx',
      'src/game/tests/AiFightSetup.test.tsx',
      'src/game/tests/GameCanvasLifecycle.test.tsx',
      'src/game/tests/OnlineNetworking.test.ts',
      'src/game/tests/RoutingSmoke.test.tsx',
    ],
    environment: 'node',
  },
});
