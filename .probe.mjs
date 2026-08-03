import { BUTTON_BIT, InputBuffer, LUCKY_COMMANDS, LUCKY_INPUT_TUNING, LUCKY_BUTTON_SLOT, resolveCommand } from './.sim-test-build/src/input/core.js';

const OPT = { leeway: LUCKY_INPUT_TUNING.leeway, settleFrames: LUCKY_INPUT_TUNING.settleFrames };
const ctx = (o = {}) => ({ grounded: true, stanceId: null, gauge: 0, superMeter: 0, ultimateReady: false, ...o });

function run(buttons, { motion = [], direction = 5, context = ctx() } = {}) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  for (const d of motion) buffer.push(d, 0);
  const mask = buttons.reduce((m, b) => m | BUTTON_BIT[LUCKY_BUTTON_SLOT[b]], 0);
  for (let i = 0; i <= OPT.settleFrames; i += 1) buffer.push(direction, mask);
  return resolveCommand(buffer, LUCKY_COMMANDS, context, OPT)?.moveId ?? null;
}

const rows = [
  ['J', run(['J'])],
  ['K', run(['K'])],
  ['I', run(['I'])],
  ['L', run(['L'])],
  ['J+I', run(['J','I'])],
  ['J+K', run(['J','K'])],
  ['I+L', run(['I','L'])],
  ['K+L', run(['K','L'])],
  ['J+K+I (m40)', run(['J','K','I'], { context: ctx({ superMeter: 40 }) })],
  ['K+I+L (m100)', run(['K','I','L'], { context: ctx({ superMeter: 100 }) })],
  ['J+K+I+L (ult)', run(['J','K','I','L'], { context: ctx({ superMeter: 100, ultimateReady: true }) })],
  ['F+J', run(['J'], { direction: 6 })],
  ['B+J', run(['J'], { direction: 4 })],
  ['D+J', run(['J'], { direction: 2 })],
  ['D+L', run(['L'], { direction: 2 })],
  ['QCF+J', run(['J'], { motion: [2,3], direction: 6 })],
  ['QCF+K', run(['K'], { motion: [2,3], direction: 6 })],
  ['QCF+I', run(['I'], { motion: [2,3], direction: 6 })],
  ['QCF+L', run(['L'], { motion: [2,3], direction: 6 })],
  ['QCB+J', run(['J'], { motion: [2,1], direction: 4 })],
  ['QCB+K', run(['K'], { motion: [2,1], direction: 4 })],
  ['DP+J (l30)', run(['J'], { motion: [6,2], direction: 3, context: ctx({ gauge: 30 }) })],
  ['DP+L', run(['L'], { motion: [6,2], direction: 3 })],
  ['QCF+J+K luck0', run(['J','K'], { motion: [2,3], direction: 6 })],
  ['QCF+J+K luck25', run(['J','K'], { motion: [2,3], direction: 6, context: ctx({ gauge: 25 }) })],
  ['QCF+J+K super', run(['J','K'], { motion: [2,3], direction: 6, context: ctx({ gauge: 25, superMeter: 40 }) })],
];
for (const [label, result] of rows) console.log(label.padEnd(16), '->', result);

console.log('--- charge ---');
function charge(counter, holdDir, releaseDir, buttons, frames = 45) {
  const buffer = new InputBuffer();
  for (let i = 0; i < frames; i += 1) buffer.push(holdDir, 0);
  const mask = buttons.reduce((m, b) => m | BUTTON_BIT[LUCKY_BUTTON_SLOT[b]], 0);
  for (let i = 0; i <= OPT.settleFrames; i += 1) buffer.push(releaseDir, mask);
  return resolveCommand(buffer, LUCKY_COMMANDS, ctx(), OPT)?.moveId ?? null;
}
console.log('holdBack40 -> F+K ->', charge('back', 4, 6, ['K']));
console.log('holdBack10 -> F+K ->', charge('back', 4, 6, ['K'], 10));
console.log('holdDown40 -> U+L ->', charge('down', 2, 8, ['L']));
console.log('holdDown10 -> U+L ->', charge('down', 2, 8, ['L'], 10));
console.log('DP+J (l30) ->', run(['J'], { motion: [6,2], direction: 3, context: ctx({ gauge: 30 }) }));
console.log('DP+L ->', run(['L'], { motion: [6,2], direction: 3 }));
console.log('DP+I+L ->', run(['I','L'], { motion: [6,2], direction: 3, context: ctx({ gauge: 60 }) }));
console.log('QCB+K+L m100 ->', run(['K','L'], { motion: [2,1], direction: 4, context: ctx({ superMeter: 100 }) }));
console.log('QCF2+J+K ult ->', run(['J','K'], { motion: [2,3,6,2,3], direction: 6, context: ctx({ superMeter: 100, ultimateReady: true }) }));
console.log('air J ->', run(['J'], { context: ctx({ grounded: false }) }));
console.log('air L ->', run(['L'], { context: ctx({ grounded: false }) }));
console.log('air D+L ->', run(['L'], { direction: 2, context: ctx({ grounded: false }) }));
console.log('air J+I ->', run(['J','I'], { context: ctx({ grounded: false }) }));
console.log('F+J+I ->', run(['J','I'], { direction: 6 }));
console.log('B+J+I ->', run(['J','I'], { direction: 4 }));
console.log('B+K+L ->', run(['K','L'], { direction: 4 }));
console.log('D+K+L ->', run(['K','L'], { direction: 2 }));
console.log('U+K+L ->', run(['K','L'], { direction: 8 }));
console.log('F+K+L ->', run(['K','L'], { direction: 6 }));
