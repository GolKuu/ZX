import assert from 'node:assert/strict';
import test from 'node:test';
import { isPrivilegedKey, mergeEnvSources, parseEnv } from './keep-awake-utils.mjs';

test('parseEnv reads quoted values and preserves equals signs', () => {
  const env = parseEnv(`
    # comment
    VITE_SUPABASE_URL="https://project.supabase.co"
    VITE_SUPABASE_ANON_KEY='header.payload=signature'
  `);

  assert.deepEqual(env, {
    VITE_SUPABASE_URL: 'https://project.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'header.payload=signature',
  });
});

test('mergeEnvSources gives the later source priority', () => {
  const env = mergeEnvSources(['VALUE=default\nONLY_DEFAULT=yes', 'VALUE=local']);

  assert.deepEqual(env, { VALUE: 'local', ONLY_DEFAULT: 'yes' });
});

test('isPrivilegedKey rejects secret and service-role keys', () => {
  const payload = Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url');

  assert.equal(isPrivilegedKey('sb_secret_example'), true);
  assert.equal(isPrivilegedKey(`header.${payload}.signature`), true);
  assert.equal(isPrivilegedKey('sb_publishable_example'), false);
  assert.equal(isPrivilegedKey('malformed-key'), false);
});
