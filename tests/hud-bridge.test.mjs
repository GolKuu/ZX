import assert from 'node:assert/strict';
import test from 'node:test';
import { HudBridge } from '../.sim-test-build/src/hud/bridge.js';

const identities = [
  {
    id: 'alpha',
    displayName: 'Kade Ruven',
    playerTag: 'P1',
    side: 'left',
  },
  {
    id: 'bravo',
    displayName: 'Kade Ruven',
    playerTag: 'P2',
    side: 'right',
  },
];

test('HUD bridge publishes no faster than 15 Hz from a 60 Hz simulation', () => {
  const published = [];
  const bridge = new HudBridge(identities, (snapshot) => published.push(snapshot));

  for (let frame = 0; frame <= 9; frame += 1) {
    bridge.accept(world(frame), [], match());
  }

  assert.deepEqual(
    published.map((snapshot) => snapshot.frame),
    [0, 4, 8],
  );
});

test('HUD bridge maps health, energy, sides, timer, and rounds', () => {
  const published = [];
  const bridge = new HudBridge(identities, (snapshot) => published.push(snapshot));
  bridge.accept(
    world(0, {
      alphaHealth: 750,
      bravoHealth: 500,
      reverseOrder: true,
    }),
    [],
    {
      ...match({ round: 2, timerFrames: 3210, alphaWins: 1, bravoWins: 2 }),
      superCharge: { alpha: 33, bravo: 67 },
    },
  );

  const snapshot = published[0];
  assert.equal(snapshot.round, 2);
  assert.equal(snapshot.timerFrames, 3210);
  assert.equal(snapshot.fighters[0].id, 'alpha');
  assert.equal(snapshot.fighters[0].side, 'left');
  assert.equal(snapshot.fighters[0].superCharge, 33);
  assert.equal(snapshot.fighters[0].roundWins, 1);
  assert.equal(snapshot.fighters[1].id, 'bravo');
  assert.equal(snapshot.fighters[1].superCharge, 67);
  assert.equal(snapshot.fighters[1].roundWins, 2);
});

test('energy is what the controller reports, not what health implies', () => {
  const published = [];
  const bridge = new HudBridge(identities, (snapshot) => published.push(snapshot));
  bridge.accept(
    world(0, { alphaHealth: 120, bravoHealth: 1000 }),
    [],
    {
      ...match(),
      superCharge: { alpha: 0, bravo: 140 },
    },
  );

  assert.equal(published[0].fighters[0].superCharge, 0);
  assert.equal(published[0].fighters[1].superCharge, 100);
});

test('the ultimate flag follows low health and the controller can revoke it', () => {
  const published = [];
  const bridge = new HudBridge(identities, (snapshot) => published.push(snapshot));
  bridge.accept(
    world(0, { alphaHealth: 300, bravoHealth: 301 }),
    [],
    match(),
  );

  assert.equal(published[0].fighters[0].ultimateReady, true);
  assert.equal(published[0].fighters[1].ultimateReady, false);

  bridge.accept(
    world(4, { alphaHealth: 300, bravoHealth: 301 }),
    [],
    { ...match(), ultimateReady: { alpha: false, bravo: false } },
  );

  assert.equal(published[1].fighters[0].ultimateReady, false);
});

test('HUD combo aggregates hit events and clears after defender recovery', () => {
  const published = [];
  const bridge = new HudBridge(identities, (snapshot) => published.push(snapshot));
  bridge.accept(
    world(0, { bravoHitstun: 12 }),
    [hit(0, 30)],
    match(),
  );
  bridge.accept(
    world(1, { bravoHitstun: 11 }),
    [hit(1, 55)],
    match(),
  );
  bridge.accept(world(4, { bravoHitstun: 8 }), [], match());

  assert.deepEqual(published[1].combo, {
    attackerId: 'alpha',
    hits: 2,
    damage: 85,
  });

  bridge.accept(world(8), [], match());
  assert.equal(published[2].combo, null);
});

test('HUD bridge rejects simulation frame regression and supports explicit reset', () => {
  const bridge = new HudBridge(identities, () => {});
  bridge.accept(world(8), [], match());
  assert.throws(
    () => bridge.accept(world(7), [], match()),
    /received frame 7 after 8/,
  );
  bridge.reset();
  assert.doesNotThrow(() => bridge.accept(world(0), [], match()));
});

function world(
  frame,
  {
    alphaHealth = 1000,
    bravoHealth = 1000,
    bravoHitstun = 0,
    reverseOrder = false,
  } = {},
) {
  const fighters = [
    fighter('alpha', alphaHealth, 0),
    fighter('bravo', bravoHealth, bravoHitstun),
  ];
  return {
    frame,
    fighters: reverseOrder ? fighters.reverse() : fighters,
  };
}

function fighter(id, health, hitstun) {
  return {
    id,
    team: id === 'alpha' ? 1 : 2,
    health,
    maxHealth: 1000,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: id === 'alpha' ? 1 : -1,
    grounded: true,
    guarding: false,
    hitstop: 0,
    hitstun,
    action: null,
  };
}

function hit(frame, damage) {
  return {
    type: 'hit',
    frame,
    attackerId: 'alpha',
    defenderId: 'bravo',
    moveId: '5L',
    hitId: 'primary',
    damage,
    position: { x: 0, y: 0 },
  };
}

function match({
  round = 1,
  timerFrames = 5940,
  alphaWins = 0,
  bravoWins = 0,
} = {}) {
  return {
    round,
    timerFrames,
    roundWins: { alpha: alphaWins, bravo: bravoWins },
  };
}
