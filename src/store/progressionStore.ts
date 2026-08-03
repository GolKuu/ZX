'use client';

import { create } from 'zustand';
import type { CharacterId } from '@/src/data/characterRoster';
import { claimDaily, dailyStatus, type DailyStatus } from '@/src/progression/daily';
import { processGameplayEvent } from '@/src/progression/eventEngine';
import { createProfile } from '@/src/progression/profile';
import { purchaseNode, respec, setLoadout } from '@/src/progression/purchases';
import { loadProfile, saveProfile } from '@/src/progression/storage';
import type { GameplayEvent, ProgressionProfile } from '@/src/progression/types';
import { processChallenges } from '@/src/progression/challenges';

export interface ProgressionNotice { readonly id: string; readonly title: string; readonly detail: string; }
interface ProgressionState {
  profile: ProgressionProfile; hydrated: boolean; daily: DailyStatus | null;
  notices: readonly ProgressionNotice[]; language: 'en' | 'ru';
  hydrate: () => void; claimDaily: () => void; purchase: (id: string) => string | undefined;
  respec: (id: CharacterId) => void; equip: (fighter: CharacterId, ids: readonly string[]) => string | undefined;
  dispatch: (event: GameplayEvent) => void; dismissNotice: (id: string) => void;
  setLanguage: (language: 'en' | 'ru') => void;
}

const persist = (profile: ProgressionProfile): ProgressionProfile => { saveProfile(profile); return profile; };
const notice = (title: string, detail: string): ProgressionNotice => ({ id: `${Date.now()}:${title}`, title, detail });

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  profile: createProfile(), hydrated: false, daily: null, notices: [], language: 'en',
  hydrate: () => {
    const profile = loadProfile();
    const daily = dailyStatus(profile, new Date());
    set({ profile, daily, hydrated: true, notices: daily.available ? [notice('DAILY TOKEN', '+1 Token is ready')] : [] });
  },
  claimDaily: () => {
    const now = new Date(); const previous = get().profile; const profile = claimDaily(previous, now);
    const amount = profile.tokenBalance - previous.tokenBalance;
    if (amount <= 0) return;
    set((state) => ({ profile: persist(profile), daily: dailyStatus(profile, now),
      notices: [...state.notices, notice('TOKEN CLAIMED', `+${amount} Token${amount === 1 ? '' : 's'}`)] }));
  },
  purchase: (id) => {
    const result = purchaseNode(get().profile, id);
    if (result.error !== undefined) { set((state) => ({ notices: [...state.notices, notice('PURCHASE BLOCKED', result.error!)] })); return result.error; }
    if (result.profile === get().profile) return undefined;
    const fighter = id.split('.')[0] as CharacterId;
    const progressed = processGameplayEvent(result.profile, { id:`node-event:${id}`,type:'UniqueFighterNode',timestamp:new Date().toISOString(),characterId:fighter,validMatch:true });
    set((state) => ({ profile: persist(progressed.profile), notices: [...state.notices, notice('NODE PURCHASED', id), ...progressed.completed.map((entry)=>notice('ACHIEVEMENT COMPLETE',entry))] }));
    return undefined;
  },
  respec: (id) => { const result = respec(get().profile, id); set((state) => ({ profile: persist(result.profile), notices: [...state.notices, notice('FULL REFUND', `${id.toUpperCase()} tree reset`)] })); },
  equip: (fighter, ids) => { const result = setLoadout(get().profile, fighter, ids); if (result.error === undefined) set({ profile: persist(result.profile) }); return result.error; },
  dispatch: (event) => { const result = processGameplayEvent(get().profile, event); const profile=processChallenges(result.profile,event); set((state) => ({ profile: persist(profile), notices: [...state.notices, ...result.completed.map((id) => notice('ACHIEVEMENT COMPLETE', id))] })); },
  dismissNotice: (id) => set((state) => ({ notices: state.notices.filter((entry) => entry.id !== id) })),
  setLanguage: (language) => set({ language }),
}));
