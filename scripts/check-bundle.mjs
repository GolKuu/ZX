import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const NEXT_DIRECTORY = path.resolve('.next');
const ROUTE_BUDGET = { raw: 500 * 1024, gzip: 140 * 1024 };
const TOTAL_CLIENT_BUDGET = { raw: 2 * 1024 * 1024, gzip: 561 * 1024 };

async function loadJson(filename) {
  return JSON.parse(await readFile(path.join(NEXT_DIRECTORY, filename), 'utf8'));
}

async function measure(files) {
  let raw = 0;
  let gzip = 0;
  for (const file of new Set(files.filter((item) => item.endsWith('.js')))) {
    const target = path.join(NEXT_DIRECTORY, file);
    const contents = await readFile(target);
    raw += (await stat(target)).size;
    gzip += gzipSync(contents).byteLength;
  }
  return { raw, gzip };
}

function format(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function collectAsyncFiles(manifest) {
  return Object.values(manifest).flatMap((entry) => entry.files ?? []);
}

const appManifest = await loadJson('app-build-manifest.json');
const loadableManifest = await loadJson('react-loadable-manifest.json');
const checkedRoutes = ['/page', '/play/page'];
const failures = [];
const routeFiles = [];

for (const route of checkedRoutes) {
  const files = appManifest.pages[route];
  if (!Array.isArray(files)) {
    failures.push(`${route}: missing from app build manifest`);
    continue;
  }
  routeFiles.push(...files);
  const size = await measure(files);
  console.log(`${route}: ${format(size.gzip)} gzip (${format(size.raw)} raw)`);
  if (size.raw > ROUTE_BUDGET.raw || size.gzip > ROUTE_BUDGET.gzip) {
    failures.push(`${route}: initial JavaScript exceeds the 500/140 KB raw/gzip budget`);
  }
}

const allClientFiles = [...routeFiles, ...collectAsyncFiles(loadableManifest)];
const totalSize = await measure(allClientFiles);
console.log(
  `All route + lazy JavaScript: ${format(totalSize.gzip)} gzip (${format(totalSize.raw)} raw)`,
);

if (totalSize.raw > TOTAL_CLIENT_BUDGET.raw || totalSize.gzip > TOTAL_CLIENT_BUDGET.gzip) {
  failures.push('All client JavaScript exceeds the 2 MB raw / 561 KB gzip budget');
}

if (failures.length > 0) {
  console.error(`Bundle budget failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log('Bundle budget passed.');
}
