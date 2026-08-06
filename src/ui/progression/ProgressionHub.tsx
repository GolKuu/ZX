'use client';
import { useState } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { useProgressionStore } from '@/src/store/progressionStore';
import { progressionText as t } from '@/src/progression/i18n';
import { DailyTokenPanel } from './DailyTokenPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { FighterTreePanel } from './FighterTreePanel';
import { ChallengesPanel } from './ChallengesPanel';
import { GloryRoadPanel } from './GloryRoadPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import styles from './ProgressionHub.module.css';

const TABS = ['leaderboard','glory','trees','achievements','challenges'] as const;
type Tab=(typeof TABS)[number];

export function ProgressionHub(){const [tab,setTab]=useState<Tab>('leaderboard');const back=useHudStore((s)=>s.openModeMenu);const language=useProgressionStore((s)=>s.language);const setLanguage=useProgressionStore((s)=>s.setLanguage);
return <div className={styles.hub} role="dialog" aria-modal="true" aria-label="YZX progression hub"><header className={styles.top}><div><small>YZX // OFFLINE-FIRST PROGRESSION</small><h1>PROGRESSION HUB</h1></div><div><button type="button" onClick={()=>setLanguage(language==='en'?'ru':'en')}>{language.toUpperCase()}</button><button type="button" onClick={back}>BACK</button></div></header><DailyTokenPanel/>
<nav className={styles.tabs}>{TABS.map((item)=><button type="button" key={item} aria-pressed={tab===item} onClick={()=>setTab(item)}>{t(language,item)}</button>)}</nav>
{tab==='leaderboard'?<LeaderboardPanel/>:tab==='glory'?<GloryRoadPanel/>:tab==='trees'?<FighterTreePanel/>:tab==='achievements'?<AchievementsPanel/>:<ChallengesPanel/>}
<footer className={styles.rules}><p>GLORY ROAD // {t(language,'gloryRule')}</p><p>RANKED // Standardized loadouts ignore permanent Token progression.</p><p>TRAINING // Preview every node without changing permanent balance.</p></footer></div>}
