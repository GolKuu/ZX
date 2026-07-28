import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const databaseUrl = process.env.SUPABASE_DB_URL?.trim();
if (!databaseUrl) {
  throw new Error('SUPABASE_DB_URL is required');
}

const outputDirectory = resolve(process.argv[2] || 'artifacts/backups');
mkdirSync(outputDirectory, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = resolve(outputDirectory, `circle-clash-${timestamp}.dump`);

await run('pg_dump', [
  '--format=custom',
  '--no-owner',
  '--no-privileges',
  '--file',
  backupPath,
], {
  ...process.env,
  PGDATABASE: databaseUrl,
});

const checksum = createHash('sha256')
  .update(readFileSync(backupPath))
  .digest('hex');
writeFileSync(
  resolve(outputDirectory, 'backup-manifest.json'),
  `${JSON.stringify({
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    file: backupPath.split(/[\\/]/).pop(),
    sha256: checksum,
  }, null, 2)}\n`,
);
process.stdout.write(`Backup created: ${backupPath}\nSHA-256: ${checksum}\n`);

function run(command, argumentsList, environment) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, argumentsList, {
      env: environment,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
