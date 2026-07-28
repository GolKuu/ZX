import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv } from './keep-awake-utils.mjs';

const env = parseEnv(readFileSync(new URL('../.env', import.meta.url), 'utf8'));
const baseUrl = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const publicKey = env.VITE_SUPABASE_ANON_KEY;
if (!baseUrl || !publicKey) throw new Error('Supabase environment is not configured');

const headers = {
  apikey: publicKey,
  Authorization: `Bearer ${publicKey}`,
  'Content-Type': 'application/json',
};

const publicRows = {};
for (const table of ['profiles', 'player_statistics', 'achievements', 'player_achievements']) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?select=*&limit=5`, { headers });
  assert.equal(response.status, 200, `${table} should be publicly readable`);
  const rows = await response.json();
  assert.ok(Array.isArray(rows));
  assert.ok(rows.every((row) => !Object.hasOwn(row, 'email')), `${table} must not expose email`);
  publicRows[table] = rows;
}

const privateSettings = await fetch(
  `${baseUrl}/rest/v1/player_settings?select=*&limit=1`,
  { headers },
);
if (privateSettings.status === 200) {
  assert.deepEqual(await privateSettings.json(), [], 'anonymous settings query must return no rows');
} else {
  assert.ok([401, 403].includes(privateSettings.status), 'anonymous settings read must be denied');
}

for (const [table, idColumn, value] of [
  ['profiles', 'id', publicRows.profiles[0]],
  ['player_statistics', 'user_id', publicRows.player_statistics[0]],
]) {
  assert.ok(value, `remote ${table} fixture is required`);
  const id = value[idColumn];
  const unchangedBody = table === 'profiles'
    ? { nickname: value.nickname }
    : { rating: value.rating };
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${idColumn}=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(unchangedBody),
  });
  if (response.status === 200) {
    assert.deepEqual(await response.json(), [], `anonymous ${table} update must affect no rows`);
  } else {
    assert.ok([401, 403].includes(response.status), `anonymous ${table} update must be denied`);
  }
}

const deleteWithoutJwt = await fetch(`${baseUrl}/functions/v1/delete-account`, {
  method: 'POST',
  headers: { apikey: publicKey, 'Content-Type': 'application/json' },
});
assert.equal(deleteWithoutJwt.status, 401, 'account deletion must require a valid JWT');

console.log('Remote account policies verified without exposing credentials.');
