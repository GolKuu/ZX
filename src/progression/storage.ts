import { migrateProfile, validateProfile } from './profile.js';
import type { ProgressionProfile } from './types.js';

export const PROFILE_KEY = 'yzx.progression.v3';
const BACKUP_KEY = `${PROFILE_KEY}.checkpoint`;
const ERROR_KEY = `${PROFILE_KEY}.recovery-report`;
interface Envelope { readonly payload: ProgressionProfile; readonly checksum: string; }

const checksum = (text: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export function encodeProfile(profile: ProgressionProfile): string {
  const payload = JSON.stringify(profile);
  return JSON.stringify({ payload: profile, checksum: checksum(payload) } satisfies Envelope);
}

export function decodeProfile(raw: string | null): ProgressionProfile | null {
  if (raw === null) return null;
  try {
    const envelope = JSON.parse(raw) as Envelope;
    if (checksum(JSON.stringify(envelope.payload)) !== envelope.checksum) return null;
    const profile = migrateProfile(envelope.payload);
    return validateProfile(profile).length === 0 ? profile : null;
  } catch { return null; }
}

export function loadProfile(): ProgressionProfile {
  if (typeof window === 'undefined') return migrateProfile(null);
  const current=decodeProfile(window.localStorage.getItem(PROFILE_KEY));if(current!==null)return current;
  const backup=decodeProfile(window.localStorage.getItem(BACKUP_KEY));if(backup!==null){window.localStorage.setItem(ERROR_KEY,JSON.stringify({at:new Date().toISOString(),reason:'PRIMARY_INVALID_BACKUP_RESTORED'}));return backup;}
  for(const key of ['yzx.progression.v2','yzx.progression.v1']){const raw=window.localStorage.getItem(key);if(raw===null)continue;try{const migrated=migrateProfile(JSON.parse(raw) as unknown);if(validateProfile(migrated).length===0)return migrated;}catch{/* continue to a non-destructive fresh profile */}}
  if(window.localStorage.getItem(PROFILE_KEY)!==null)window.localStorage.setItem(ERROR_KEY,JSON.stringify({at:new Date().toISOString(),reason:'NO_VALID_CHECKPOINT'}));
  return migrateProfile(null);
}

export function saveProfile(profile: ProgressionProfile): void {
  if (typeof window === 'undefined') return;
  const errors = validateProfile(profile);
  if (errors.length > 0) throw new Error(`INVALID_PROFILE:${errors.join(',')}`);
  const previous = window.localStorage.getItem(PROFILE_KEY);
  if (previous !== null && decodeProfile(previous) !== null) window.localStorage.setItem(BACKUP_KEY, previous);
  window.localStorage.setItem(PROFILE_KEY, encodeProfile(profile));
}
