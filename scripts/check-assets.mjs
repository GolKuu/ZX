import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const PUBLIC_DIRECTORY = path.resolve('public');
const TOTAL_BUDGET_BYTES = 12 * 1024 * 1024;
const FILE_BUDGETS = new Map([
  ['.avif', 750 * 1024],
  ['.glb', 5 * 1024 * 1024],
  ['.jpg', 500 * 1024],
  ['.jpeg', 500 * 1024],
  ['.ktx2', 2 * 1024 * 1024],
  ['.mp3', 2 * 1024 * 1024],
  ['.ogg', 2 * 1024 * 1024],
  ['.png', 500 * 1024],
  ['.webp', 750 * 1024],
]);
const UNCOMPRESSED_FORMATS = new Set(['.bmp', '.gltf', '.tif', '.tiff', '.wav']);

async function collectFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return [];
    throw error;
  }

  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(target) : [target];
  }));
  return nested.flat();
}

const files = await collectFiles(PUBLIC_DIRECTORY);
const failures = [];
let totalBytes = 0;

for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  const { size } = await stat(file);
  const relativePath = path.relative(PUBLIC_DIRECTORY, file);
  totalBytes += size;

  if (UNCOMPRESSED_FORMATS.has(extension)) {
    failures.push(`${relativePath}: use a compressed production format`);
  }

  const maximumBytes = FILE_BUDGETS.get(extension);
  if (maximumBytes !== undefined && size > maximumBytes) {
    failures.push(`${relativePath}: ${(size / 1024).toFixed(1)} KB exceeds its asset budget`);
  }
}

if (totalBytes > TOTAL_BUDGET_BYTES) {
  failures.push(`public/: ${(totalBytes / 1024 / 1024).toFixed(2)} MB exceeds 12 MB`);
}

if (failures.length > 0) {
  console.error(`Asset budget failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Asset budget passed: ${files.length} files, ${(totalBytes / 1024).toFixed(1)} KB`,
  );
}
