'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './StorePage.module.css';

type Category = 'all' | 'skins' | 'effects';
type Item = { id: string; name: string; subtitle: string; category: Exclude<Category, 'all'>; price: number; rarity: string; accent: string; glyph: string; description: string };
const ITEMS: Item[] = [
  { id: 'void-mim', name: 'VOID MIM', subtitle: 'Мим // Нулевая фаза', category: 'skins', price: 850, rarity: 'ЭПИЧЕСКИЙ', accent: '#d56cff', glyph: '◒', description: 'Силуэт из сжатого света. Следы движения рвутся на пиксели.' },
  { id: 'golden-lucky', name: 'GOLDEN LUCKY', subtitle: 'Лаки // Золотая ставка', category: 'skins', price: 1200, rarity: 'ЛЕГЕНДАРНЫЙ', accent: '#f0bd55', glyph: '✦', description: 'Хромированная удача с тёплым свечением и золотым контуром.' },
  { id: 'rust-vorgh', name: 'RUST VORGH', subtitle: 'Ворг // Красная зона', category: 'skins', price: 700, rarity: 'РЕДКИЙ', accent: '#f06c45', glyph: '⟁', description: 'Сколы брони, горячий металл и агрессивный янтарный визор.' },
  { id: 'neon-titan', name: 'NEON TITAN', subtitle: 'Титан // Сверхток', category: 'skins', price: 950, rarity: 'ЭПИЧЕСКИЙ', accent: '#68d7e7', glyph: '⬡', description: 'Силовая броня с холодными неоновыми магистралями.' },
  { id: 'solar-burst', name: 'SOLAR BURST', subtitle: 'Ударный эффект', category: 'effects', price: 500, rarity: 'РЕДКИЙ', accent: '#ffcf5a', glyph: '✹', description: 'При попадании экран вспыхивает короткой солнечной короной.' },
  { id: 'rift-shatter', name: 'RIFT SHATTER', subtitle: 'Ударный эффект', category: 'effects', price: 650, rarity: 'ЭПИЧЕСКИЙ', accent: '#a975ff', glyph: '⌁', description: 'Фиолетовый разлом, который разрезает воздух по диагонали.' },
  { id: 'glitch-bloom', name: 'GLITCH BLOOM', subtitle: 'Ударный эффект', category: 'effects', price: 900, rarity: 'ЛЕГЕНДАРНЫЙ', accent: '#ff5bc8', glyph: '✳', description: 'Цветочные фрагменты ошибки разлетаются после критического удара.' },
  { id: 'frost-lock', name: 'FROST LOCK', subtitle: 'Ударный эффект', category: 'effects', price: 420, rarity: 'РЕДКИЙ', accent: '#77ddff', glyph: '❄', description: 'Ледяное кольцо фиксирует момент попадания и рассыпается инеем.' },
];
const STARTING_TOKENS = 2840;

export function StorePage() {
  const [category, setCategory] = useState<Category>('all');
  const [tokens, setTokens] = useState(STARTING_TOKENS);
  const [owned, setOwned] = useState<string[]>(['solar-burst']);
  const [equipped, setEquipped] = useState('solar-burst');
  const [notice, setNotice] = useState('ВЫБЕРИ ПРЕДМЕТ ДЛЯ ПРОСМОТРА');
  const [selectedId, setSelectedId] = useState('void-mim');

  useEffect(() => { const saved = window.localStorage.getItem('ccu-store'); if (!saved) return; try { const parsed = JSON.parse(saved) as { tokens?: number; owned?: string[]; equipped?: string }; if (typeof parsed.tokens === 'number') setTokens(parsed.tokens); if (Array.isArray(parsed.owned)) setOwned(parsed.owned); if (typeof parsed.equipped === 'string') setEquipped(parsed.equipped); } catch { /* ignore corrupt local state */ } }, []);
  useEffect(() => { window.localStorage.setItem('ccu-store', JSON.stringify({ tokens, owned, equipped })); }, [tokens, owned, equipped]);
  const visibleItems = useMemo(() => category === 'all' ? ITEMS : ITEMS.filter((item) => item.category === category), [category]);
  const selected = ITEMS.find((item) => item.id === selectedId) ?? ITEMS[0]!;
  const isOwned = owned.includes(selected.id);
  function buyOrEquip() { if (isOwned) { setEquipped(selected.id); setNotice(`${selected.name} // СНАРЯЖЕНО`); return; } if (tokens < selected.price) { setNotice('НЕДОСТАТОЧНО ТОКЕНОВ // ПОБЕДИ В БОЮ'); return; } setTokens((value) => value - selected.price); setOwned((value) => [...value, selected.id]); setEquipped(selected.id); setNotice(`${selected.name} // ДОБАВЛЕНО В АРСЕНАЛ`); }

  return <main className={styles.page}>
    <div className={styles.scanlines} aria-hidden="true" />
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="На главную"><span>CC</span><b>CIRCLE CLASH <small>ULTIMATE</small></b></Link><div className={styles.headerRight}><span className={styles.status}><i />АРСЕНАЛ ОТКРЫТ</span><div className={styles.wallet}><span>◈</span><strong>{tokens.toLocaleString('ru-RU')}</strong><small>ТОКЕНОВ</small></div></div></header>
    <section className={styles.intro}><div><p className={styles.kicker}>MARKET // SEASON 01 // 08 ITEMS</p><h1>СОБЕРИ <em>СВОЙ</em><br />УДАР.</h1><p className={styles.lede}>Скины, которые видят первыми. Эффекты, которые помнят последними.</p></div><div className={styles.introMeta}><span>БАЛАНС</span><strong>{tokens.toLocaleString('ru-RU')} <b>◈</b></strong><small>+ Токены за победы и комбо</small></div></section>
    <div className={styles.layout}><section className={styles.catalog}><nav className={styles.tabs} aria-label="Категории магазина">{([['all', 'ВСЁ'], ['skins', 'СКИНЫ'], ['effects', 'ЭФФЕКТЫ УДАРА']] as const).map(([value, label]) => <button className={category === value ? styles.activeTab : ''} onClick={() => setCategory(value)} key={value}>{label}<span>{value === 'all' ? '08' : '04'}</span></button>)}</nav><div className={styles.grid}>{visibleItems.map((item, index) => <button className={`${styles.card} ${selectedId === item.id ? styles.selected : ''}`} onClick={() => { setSelectedId(item.id); setNotice('ВЫБЕРИ ДЕЙСТВИЕ СПРАВА'); }} key={item.id} style={{ '--accent': item.accent } as React.CSSProperties}><div className={styles.cardTop}><span>0{index + 1}</span><b>{item.rarity}</b></div><div className={`${styles.itemArt} ${item.category === 'effects' ? styles.effectArt : ''}`}><i>{item.glyph}</i><span /></div><div className={styles.cardInfo}><strong>{item.name}</strong><small>{item.subtitle}</small></div><div className={styles.cardBottom}>{owned.includes(item.id) ? <b className={styles.owned}>✓ В АРСЕНАЛЕ</b> : <b><span>◈</span>{item.price}</b>}<span>↗</span></div></button>)}</div></section><aside className={styles.detail} style={{ '--accent': selected.accent } as React.CSSProperties}><div className={styles.detailHeader}><span>ПРЕДПРОСМОТР // {selected.category === 'skins' ? 'SKIN' : 'HIT FX'}</span><b>{selected.rarity}</b></div><div className={`${styles.heroArt} ${selected.category === 'effects' ? styles.effectArt : ''}`}><div className={styles.ring} /><div className={styles.ringSmall} /><strong>{selected.glyph}</strong><span className={styles.crosshair}>+</span><span className={styles.coordinate}>X: 08.41<br />Y: 73.09</span></div><div className={styles.detailCopy}><p className={styles.detailEyebrow}>ITEM ID / {selected.id.toUpperCase()}</p><h2>{selected.name}</h2><p>{selected.description}</p></div><div className={styles.specs}><div><span>РЕДКОСТЬ</span><b>{selected.rarity}</b></div><div><span>ТИП</span><b>{selected.category === 'skins' ? 'ВНЕШНИЙ ВИД' : 'ПРИ ПОПАДАНИИ'}</b></div></div><button className={styles.buy} onClick={buyOrEquip}>{isOwned ? <><span>✓</span> СНАРЯДИТЬ</> : <><span>◈</span> КУПИТЬ ЗА {selected.price}</>}<i>→</i></button><p className={styles.notice}>{notice}</p></aside></div>
    <footer className={styles.footer}><span>CCU // DIGITAL ARMORY</span><Link href="/play">В БОЙ <b>→</b></Link><span>ТОКЕНЫ НЕ СГОРАЮТ</span></footer>
  </main>;
}
