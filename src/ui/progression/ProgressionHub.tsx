'use client';
import { useState } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { useProgressionStore } from '@/src/store/progressionStore';
import { DailyTokenPanel } from './DailyTokenPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { FighterTreePanel } from './FighterTreePanel';
import { ChallengesPanel } from './ChallengesPanel';
import styles from './ProgressionHub.module.css';

type Tab='trees'|'achievements'|'challenges';
export function ProgressionHub(){const [tab,setTab]=useState<Tab>('trees');const back=useHudStore((s)=>s.openModeMenu);const language=useProgressionStore((s)=>s.language);const setLanguage=useProgressionStore((s)=>s.setLanguage);
return <div className={styles.hub} role="dialog" aria-modal="true" aria-label="YZX progression hub"><header className={styles.top}><div><small>YZX // OFFLINE-FIRST PROGRESSION</small><h1>PROGRESSION HUB</h1></div><div><button type="button" onClick={()=>setLanguage(language==='en'?'ru':'en')}>{language.toUpperCase()}</button><button type="button" onClick={back}>BACK</button></div></header><DailyTokenPanel/>
<nav className={styles.tabs}>{(['trees','achievements','challenges'] as const).map((item)=><button type="button" key={item} aria-pressed={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</nav>
{tab==='trees'?<FighterTreePanel/>:tab==='achievements'?<AchievementsPanel/>:<ChallengesPanel/>}
<footer className={styles.rules}><p>RANKED // Standardized loadouts ignore permanent Token progression.</p><p>TRAINING // Preview every node without changing permanent balance.</p></footer></div>}
