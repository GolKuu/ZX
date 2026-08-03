import assert from 'node:assert/strict';
import test from 'node:test';
import { claimDaily, dailyPeriod, dailyStatus } from '../.sim-test-build/src/progression/daily.js';
import { processGameplayEvent, gameplayEvent } from '../.sim-test-build/src/progression/eventEngine.js';
import { createProfile, transact, validateProfile } from '../.sim-test-build/src/progression/profile.js';
import { effectiveLoadout, purchaseNode, respec, setLoadout } from '../.sim-test-build/src/progression/purchases.js';
import { fighterNodes, PROGRESSION_NODES } from '../.sim-test-build/src/progression/treeData.js';
import { resolveModeProgression } from '../.sim-test-build/src/progression/modeRules.js';
import { decodeProfile, encodeProfile } from '../.sim-test-build/src/progression/storage.js';
import { processChallenges } from '../.sim-test-build/src/progression/challenges.js';

const date = (iso) => new Date(iso);
const funded = (amount=1000) => transact(createProfile('test',date('2026-08-01T10:00:00Z')),{type:'MigrationAdjustment',amount,sourceId:'test',idempotencyKey:'seed',now:date('2026-08-01T10:00:00Z')});

test('daily: first claim, same-day duplicate, restart and next day',()=>{
  const first=claimDaily(createProfile('daily',date('2026-08-01T12:00:00Z')),date('2026-08-01T12:00:00Z'));
  assert.equal(first.tokenBalance,1); assert.equal(claimDaily(first,date('2026-08-01T16:00:00Z')),first);
  const restored=decodeProfile(encodeProfile(first)); assert.ok(restored); assert.equal(claimDaily(restored,date('2026-08-02T12:00:00Z')).tokenBalance,2);
});

test('daily: day seven grants bounded two-token cycle bonus',()=>{
  let profile=createProfile('streak',date('2026-08-01T12:00:00Z'));
  for(let day=1;day<=7;day+=1) profile=claimDaily(profile,date(`2026-08-0${day}T12:00:00Z`));
  assert.equal(profile.tokenBalance,8); assert.equal(profile.daily.streak,7);
});

test('daily: timezone is pinned and cannot duplicate a period',()=>{
  const profile=claimDaily(createProfile('zone',date('2026-08-01T12:00:00Z')),date('2026-08-01T12:00:00Z'));
  assert.equal(dailyStatus(profile,date('2026-08-01T13:00:00Z')).available,false);
  assert.equal(dailyPeriod(date('2026-08-01T13:00:00Z'),profile.daily.utcOffsetMinutes).id,profile.daily.periodId);
});

test('daily: backward clock is non-punitive and does not award',()=>{
  const profile=claimDaily(createProfile('clock',date('2026-08-02T12:00:00Z')),date('2026-08-02T12:00:00Z'));
  const result=claimDaily(profile,date('2026-07-30T12:00:00Z'));
  assert.equal(result.tokenBalance,1); assert.equal(result.daily.suspiciousClock,true);
});

test('daily: trusted server time reconciles a forward local clock',()=>{
  const base=createProfile('server',date('2026-08-01T12:00:00Z'));
  const claimed=claimDaily(base,date('2030-01-01T00:00:00Z'),date('2026-08-01T12:00:00Z'));
  assert.equal(claimed.daily.periodId,dailyPeriod(date('2026-08-01T12:00:00Z'),claimed.daily.utcOffsetMinutes).id);
});

test('token ledger is idempotent and prevents negative balances',()=>{
  const profile=funded(5); assert.equal(transact(profile,{type:'AchievementReward',amount:2,sourceId:'x',idempotencyKey:'seed'}),profile);
  assert.throws(()=>transact(profile,{type:'NodePurchase',amount:-6,sourceId:'x',idempotencyKey:'spend'}),/INSUFFICIENT/);
  assert.deepEqual(validateProfile(profile),[]);
});

test('all five fighters expose three branches, 24 nodes, and cost 60',()=>{
  for(const fighter of ['mim','glitch','lucky','titan','vorgh']){const nodes=fighterNodes(fighter);assert.equal(nodes.length,24);assert.equal(new Set(nodes.map(n=>n.branchId)).size,3);assert.equal(nodes.reduce((s,n)=>s+n.cost,0),60);}
  assert.equal(PROGRESSION_NODES.length,120);
});

test('purchase validates prerequisite, balance, duplicate and capstone limit',()=>{
  let profile=funded(); const second=fighterNodes('mim')[1]; assert.equal(purchaseNode(profile,second.id).error,'PREREQUISITE_MISSING');
  const first=fighterNodes('mim')[0]; profile=purchaseNode(profile,first.id).profile; assert.equal(profile.purchasedNodes.mim.length,1);
  assert.equal(purchaseNode(profile,first.id).profile,profile);
  const capstones=fighterNodes('mim').filter(n=>n.capstone).map(n=>n.id); assert.equal(setLoadout({...profile,purchasedNodes:{...profile.purchasedNodes,mim:capstones}},'mim',capstones).error,'CAPSTONE_LIMIT');
});

test('full respec refunds exact cost once and clears loadout',()=>{
  let profile=funded(10); const first=fighterNodes('glitch')[0]; profile=purchaseNode(profile,first.id).profile;
  const before=profile.tokenBalance; const result=respec(profile,'glitch').profile;
  assert.equal(result.tokenBalance,before+first.cost); assert.deepEqual(result.purchasedNodes.glitch,[]); assert.deepEqual(result.loadouts.glitch,[]);
});

test('ranked normalizes progression and Training overrides never mutate profile',()=>{
  let profile=funded(); const first=fighterNodes('titan')[0]; profile=purchaseNode(profile,first.id).profile;
  assert.deepEqual(effectiveLoadout(profile,'titan','ranked'),[]); assert.equal(effectiveLoadout(profile,'titan','training','all').length,24);
  const resolved=resolveModeProgression(profile,'training','all'); assert.equal(resolved.persistent,false); assert.equal(profile.purchasedNodes.titan.length,1);
});

test('achievement events are one-time, reload-safe, debug-safe, and thresholded',()=>{
  let profile=createProfile('ach',date('2026-08-01T00:00:00Z'));
  const event=gameplayEvent('MatchWon','match-1',{timestamp:'2026-08-01T01:00:00Z'}); profile=processGameplayEvent(profile,event).profile;
  assert.equal(profile.tokenBalance,1); assert.equal(processGameplayEvent(profile,event).profile,profile);
  const debug=gameplayEvent('MatchWon','debug',{validMatch:false}); assert.equal(processGameplayEvent(profile,debug).profile,profile);
  for(let n=0;n<20;n+=1) profile=processGameplayEvent(profile,gameplayEvent('TrainingChallengeCompleted',`train-${n}`)).profile;
  assert.ok(profile.achievements['training-twenty'].completedAt);
});

test('challenge rewards are period-bound and idempotent',()=>{
  let profile=createProfile('challenge',date('2026-08-01T00:00:00Z'));
  const first=gameplayEvent('MatchWon','c1',{timestamp:'2026-08-01T01:00:00Z'}); const second=gameplayEvent('MatchWon','c2',{timestamp:'2026-08-01T02:00:00Z'});
  profile=processChallenges(profile,first); profile=processChallenges(profile,second); const balance=profile.tokenBalance;
  assert.equal(balance,1); assert.equal(processChallenges(profile,second).tokenBalance,balance);
});

test('tampered save checksum is rejected and legitimate save survives',()=>{
  const raw=encodeProfile(funded(5)); assert.equal(decodeProfile(raw.replace('"tokenBalance":5','"tokenBalance":500')),null);
  assert.equal(decodeProfile(raw)?.tokenBalance,5);
});
