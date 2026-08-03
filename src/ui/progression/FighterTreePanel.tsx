'use client';
import { useState } from 'react';
import { CHARACTER_ROSTER, type CharacterId } from '@/src/data/characterRoster';
import { PROGRESSION_BRANCHES, fighterNodes } from '@/src/progression/treeData';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './ProgressionHub.module.css';

export function FighterTreePanel() {
  const [fighter,setFighter] = useState<CharacterId>('mim'); const [selected,setSelected] = useState<string>();
  const profile = useProgressionStore((state) => state.profile); const purchase = useProgressionStore((state) => state.purchase);
  const reset = useProgressionStore((state) => state.respec); const owned = profile.purchasedNodes[fighter];
  const selectedNode = fighterNodes(fighter).find((node) => node.id === selected);
  return <section className={styles.panel}>
    <nav className={styles.fighters}>{CHARACTER_ROSTER.map((item) => <button type="button" key={item.id} aria-pressed={fighter===item.id} onClick={() => {setFighter(item.id);setSelected(undefined);}}>{item.mark} {item.displayName}</button>)}</nav>
    <div className={styles.treeLayout}><div className={styles.branches}>{PROGRESSION_BRANCHES[fighter].map((branch) => <section key={branch.id}>
      <header><h2>{branch.name}</h2><small>{branch.focus}</small></header>
      <div>{fighterNodes(fighter).filter((node) => node.branchId===branch.id).map((node) => {
        const bought=owned.includes(node.id); const ready=node.prerequisites.every((id)=>owned.includes(id));
        return <button type="button" key={node.id} data-state={bought?'purchased':ready?'available':'locked'} aria-label={`${node.name}, tier ${node.tier}, ${node.cost} Tokens`} onClick={()=>setSelected(node.id)}><i>{bought?'✓':node.tier}</i><span>{node.name}</span><b>{bought?'OWNED':`${node.cost} T`}</b></button>;
      })}</div></section>)}</div>
      <aside className={styles.preview}>{selectedNode ? <><small>TIER {selectedNode.tier}{selectedNode.capstone?' · CAPSTONE':''}</small><h2>{selectedNode.name}</h2><p>{selectedNode.description}</p>
        <dl><div><dt>Before</dt><dd>{selectedNode.effect.before}</dd></div><div><dt>After</dt><dd>{selectedNode.effect.after}</dd></div><div><dt>Modes</dt><dd>Story · PvE · Training preview</dd></div><div><dt>Ranked</dt><dd>Standardized; ignored</dd></div></dl>
        <button type="button" disabled={owned.includes(selectedNode.id)} onClick={()=>purchase(selectedNode.id)}>{owned.includes(selectedNode.id)?'PURCHASED':`CONFIRM · ${selectedNode.cost} TOKEN`}</button></>:<p>Select a node to inspect exact limits, prerequisites, affected moves, and restrictions.</p>}
        <button className={styles.respec} type="button" disabled={owned.length===0} onClick={()=>confirm('Free full refund outside combat. Refund every purchased node?')&&reset(fighter)}>FREE FULL RESPEC · {owned.length} NODES</button></aside>
    </div>
  </section>;
}
