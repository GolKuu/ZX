import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20260728081958_game_accounts.sql', import.meta.url),
  'utf8',
);
const deleteFunction = readFileSync(
  new URL('../supabase/functions/delete-account/index.ts', import.meta.url),
  'utf8',
);
const client = readFileSync(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8');

test('all account tables enable RLS and private settings use owner policies', () => {
  for (const table of [
    'profiles',
    'player_settings',
    'player_statistics',
    'achievements',
    'player_achievements',
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(migration, /auth\.uid\(\)\) = user_id/);
  assert.doesNotMatch(migration, /create table public\.(?:profiles|player_settings)[\s\S]*?\bemail\b/);
});

test('account deletion validates JWT before using server-only admin access', () => {
  const validationPosition = deleteFunction.indexOf('auth.getUser(token)');
  const deletionPosition = deleteFunction.indexOf('auth.admin.deleteUser');
  assert.ok(validationPosition >= 0);
  assert.ok(deletionPosition > validationPosition);
  assert.doesNotMatch(client, /SERVICE_ROLE|service_role/);
  assert.doesNotMatch(client, /password/);
});
