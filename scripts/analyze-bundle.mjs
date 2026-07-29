import { spawnSync } from 'node:child_process';
import path from 'node:path';

const nextCli = path.resolve('node_modules/next/dist/bin/next');
const result = spawnSync(process.execPath, [nextCli, 'build'], {
  env: { ...process.env, ANALYZE: 'true' },
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exitCode = result.status ?? 1;
} else {
  const budgetScript = path.resolve('scripts/check-bundle.mjs');
  const budget = spawnSync(process.execPath, [budgetScript], { stdio: 'inherit' });
  process.exitCode = budget.status ?? 1;
}
