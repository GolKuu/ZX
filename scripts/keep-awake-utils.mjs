export function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      }),
  );
}

export function mergeEnvSources(sources) {
  return Object.assign({}, ...sources.map(parseEnv));
}

export function isPrivilegedKey(key) {
  if (key.startsWith('sb_secret_')) return true;

  const parts = key.split('.');
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}
