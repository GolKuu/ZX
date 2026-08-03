import type { CharacterId } from '../data/characterRoster.js';
import { transact } from './profile.js';
import { fighterNodes, nodeById } from './treeData.js';
import type { ProgressionMode, ProgressionProfile } from './types.js';

export interface PurchaseResult { readonly profile: ProgressionProfile; readonly error?: string; }
export const ACTIVE_LOADOUT_BUDGET = 20;

export function purchaseNode(profile: ProgressionProfile, nodeId: string, now = new Date()): PurchaseResult {
  const node = nodeById(nodeId);
  if (node === undefined) return { profile, error: 'NODE_NOT_FOUND' };
  const owned = profile.purchasedNodes[node.fighterId];
  if (owned.includes(node.id)) return { profile };
  if (!node.prerequisites.every((id) => owned.includes(id))) return { profile, error: 'PREREQUISITE_MISSING' };
  if (node.exclusions.some((id) => owned.includes(id))) return { profile, error: 'NODE_EXCLUDED' };
  if (profile.tokenBalance < node.cost) return { profile, error: 'INSUFFICIENT_TOKENS' };
  const paid = transact(profile, { type: 'NodePurchase', amount: -node.cost, sourceId: node.id,
    idempotencyKey: `purchase:${node.id}`, now });
  const nextOwned = [...owned, node.id];
  return { profile: { ...paid, purchasedNodes: { ...paid.purchasedNodes, [node.fighterId]: nextOwned },
    loadouts: { ...paid.loadouts, [node.fighterId]: legalLoadout(nextOwned) } } };
}

export function setLoadout(profile: ProgressionProfile, fighterId: CharacterId, requested: readonly string[]): PurchaseResult {
  const legal = requested.filter((id) => profile.purchasedNodes[fighterId].includes(id) && nodeById(id)?.fighterId === fighterId);
  if (legal.length !== requested.length) return { profile, error: 'UNOWNED_NODE' };
  if (legal.filter((id) => nodeById(id)?.capstone).length > 1) return { profile, error: 'CAPSTONE_LIMIT' };
  if (!legal.every((id)=>nodeById(id)?.prerequisites.every((required)=>legal.includes(required))===true)) return {profile,error:'PREREQUISITE_MISSING'};
  if (loadoutCost(legal)>ACTIVE_LOADOUT_BUDGET) return {profile,error:'LOADOUT_BUDGET'};
  return { profile: { ...profile, loadouts: { ...profile.loadouts, [fighterId]: [...new Set(legal)] } } };
}

export function respec(profile: ProgressionProfile, fighterId: CharacterId, now = new Date()): PurchaseResult {
  const owned = profile.purchasedNodes[fighterId];
  if (owned.length === 0) return { profile };
  const refund = owned.reduce((sum, id) => sum + (nodeById(id)?.cost ?? 0), 0);
  const key = `respec:${fighterId}:${profile.transactions.length + 1}`;
  const refunded = transact(profile, { type: 'RespecRefund', amount: refund, sourceId: fighterId, idempotencyKey: key, now });
  return { profile: { ...refunded, purchasedNodes: { ...refunded.purchasedNodes, [fighterId]: [] },
    loadouts: { ...refunded.loadouts, [fighterId]: [] }, freeRespecUsed: { ...refunded.freeRespecUsed, [fighterId]: true } } };
}

export function effectiveLoadout(profile: ProgressionProfile, fighterId: CharacterId, mode: ProgressionMode,
  training: 'purchased' | 'base' | 'all' | readonly string[] = 'purchased'): readonly string[] {
  if (mode === 'ranked') return [];
  if (mode !== 'training' || training === 'purchased') return profile.loadouts[fighterId];
  if (training === 'base') return [];
  if (training === 'all') return fighterNodes(fighterId).map((node) => node.id);
  return legalLoadout(training.filter((id) => nodeById(id)?.fighterId === fighterId));
}

const legalLoadout = (nodes: readonly string[]): readonly string[] => {
  let capstone = false; let spent=0;
  return nodes.filter((id) => {
    const node=nodeById(id);if(node===undefined||spent+node.cost>ACTIVE_LOADOUT_BUDGET)return false;
    if (node.capstone) { if (capstone) return false; capstone = true; }
    spent+=node.cost;
    return true;
  });
};
export const loadoutCost=(nodes:readonly string[]):number=>nodes.reduce((sum,id)=>sum+(nodeById(id)?.cost??0),0);
