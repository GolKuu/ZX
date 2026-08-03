import { CHALLENGES } from '@/src/progression/challenges';
import styles from './ProgressionHub.module.css';
export function ChallengesPanel(){return <section className={styles.panel}><div className={styles.challengeColumns}>{(['daily','weekly'] as const).map((cadence)=><div key={cadence}><h2>{cadence.toUpperCase()} CHALLENGES</h2>{CHALLENGES.filter((item)=>item.cadence===cadence).map((item)=><article key={item.id}><span>◇</span><div><b>{item.text}</b><small>First completion · +{item.reward} TOKEN</small></div></article>)}</div>)}</div></section>}
