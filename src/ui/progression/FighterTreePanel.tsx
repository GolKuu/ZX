'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import { CHARACTER_ROSTER, type CharacterId } from '@/src/data/characterRoster';
import {
  progressionMoveCommands,
  type ProgressionMoveCommand,
} from '@/src/progression/moveCommands';
import { PROGRESSION_BRANCHES, fighterNodes } from '@/src/progression/treeData';
import { useControlStore } from '@/src/store/controlStore';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './ProgressionHub.module.css';

export function FighterTreePanel() {
  const [fighter, setFighter] = useState<CharacterId>('mim');
  const [selected, setSelected] = useState<string>();
  const profile = useProgressionStore((state) => state.profile);
  const purchase = useProgressionStore((state) => state.purchase);
  const reset = useProgressionStore((state) => state.respec);
  const bindings = useControlStore((state) => state.bindings);
  const hydrateControls = useControlStore((state) => state.hydrate);
  const owned = profile.purchasedNodes[fighter];
  const selectedNode = fighterNodes(fighter).find((node) => node.id === selected);
  const moveCommands = selectedNode === undefined
    ? []
    : progressionMoveCommands(fighter, selectedNode.affectedMoves, bindings);

  useEffect(hydrateControls, [hydrateControls]);

  return (
    <section className={styles.panel}>
      <nav className={styles.fighters}>
        {CHARACTER_ROSTER.map((item) => (
          <button
            aria-pressed={fighter === item.id}
            key={item.id}
            onClick={() => {
              setFighter(item.id);
              setSelected(undefined);
            }}
            type="button"
          >
            {item.mark} {item.displayName}
          </button>
        ))}
      </nav>
      <div className={styles.treeLayout}>
        <div className={styles.branches}>
          {PROGRESSION_BRANCHES[fighter].map((branch) => (
            <section key={branch.id}>
              <header><h2>{branch.name}</h2><small>{branch.focus}</small></header>
              <div>
                {fighterNodes(fighter)
                  .filter((node) => node.branchId === branch.id)
                  .map((node) => {
                    const bought = owned.includes(node.id);
                    const ready = node.prerequisites.every((id) => owned.includes(id));
                    return (
                      <button
                        aria-label={`${node.name}, tier ${node.tier}, ${node.cost} Tokens`}
                        data-state={bought ? 'purchased' : ready ? 'available' : 'locked'}
                        key={node.id}
                        onClick={() => setSelected(node.id)}
                        type="button"
                      >
                        <i>{bought ? '✓' : node.tier}</i>
                        <span>{node.name}</span>
                        <b>{bought ? 'OWNED' : `${node.cost} T`}</b>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
        <aside className={styles.preview}>
          {selectedNode === undefined ? (
            <p>Select a node to inspect exact limits, affected moves, commands, and restrictions.</p>
          ) : (
            <>
              <small>TIER {selectedNode.tier}{selectedNode.capstone ? ' · CAPSTONE' : ''}</small>
              <h2>{selectedNode.name}</h2>
              <p>{selectedNode.description}</p>
              <dl>
                <div><dt>Before</dt><dd>{selectedNode.effect.before}</dd></div>
                <div><dt>After</dt><dd>{selectedNode.effect.after}</dd></div>
                <div><dt>Modes</dt><dd>Story · PvE · Training preview</dd></div>
                <div><dt>Ranked</dt><dd>Standardized; ignored</dd></div>
              </dl>
              <section
                aria-label="Комбинации затронутых приёмов"
                className={styles.commandPreview}
              >
                <header>
                  <small>MOVE COMBINATIONS</small>
                  <span>{owned.includes(selectedNode.id) ? 'ACTIVE' : 'PREVIEW'}</span>
                </header>
                {moveCommands.map((command) => (
                  <AnimatedCommand command={command} key={command.moveId} />
                ))}
              </section>
              <button
                disabled={owned.includes(selectedNode.id)}
                onClick={() => purchase(selectedNode.id)}
                type="button"
              >
                {owned.includes(selectedNode.id)
                  ? 'PURCHASED'
                  : `CONFIRM · ${selectedNode.cost} TOKEN`}
              </button>
            </>
          )}
          <button
            className={styles.respec}
            disabled={owned.length === 0}
            onClick={() => confirm('Free full refund outside combat. Refund every purchased node?') && reset(fighter)}
            type="button"
          >
            FREE FULL RESPEC · {owned.length} NODES
          </button>
        </aside>
      </div>
    </section>
  );
}

function AnimatedCommand({ command }: { readonly command: ProgressionMoveCommand }) {
  return (
    <article className={styles.commandMove}>
      <div><strong>{command.name}</strong><code>{command.moveId}</code></div>
      {command.description === undefined ? null : <p>{command.description}</p>}
      <div aria-label={command.notation} className={styles.commandSequence}>
        {command.steps.map((step, index) => (
          <span className={styles.commandStep} key={`${command.moveId}-${index}`}>
            {index === 0 ? null : <i aria-hidden="true">→</i>}
            <span
              className={styles.commandChord}
              style={{ '--command-step': index } as CSSProperties}
            >
              {step.hold === true ? <em>HOLD</em> : null}
              {step.keys.map((key, keyIndex) => (
                <span key={`${key}-${keyIndex}`}>
                  {keyIndex === 0 ? null : <b aria-hidden="true">+</b>}
                  <kbd>{key}</kbd>
                </span>
              ))}
            </span>
          </span>
        ))}
      </div>
    </article>
  );
}
