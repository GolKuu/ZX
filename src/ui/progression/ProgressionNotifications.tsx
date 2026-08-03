'use client';
import { useEffect } from 'react';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './ProgressionHub.module.css';
export function ProgressionNotifications(){const notices=useProgressionStore((s)=>s.notices);const dismiss=useProgressionStore((s)=>s.dismissNotice);useEffect(()=>{const first=notices[0];if(!first)return;const id=setTimeout(()=>dismiss(first.id),4200);return()=>clearTimeout(id)},[dismiss,notices]);return <aside className={styles.notices} aria-live="polite">{notices.slice(0,3).map((item)=><button type="button" key={item.id} onClick={()=>dismiss(item.id)}><b>{item.title}</b><span>{item.detail}</span></button>)}</aside>}
