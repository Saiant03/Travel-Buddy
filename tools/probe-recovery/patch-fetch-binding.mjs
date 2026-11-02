import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}
const inputArgument = option('--input');
const outputArgument = option('--output');
if (args.length !== 4 || !inputArgument || !outputArgument ||
    args.filter((arg) => arg === '--input').length !== 1 ||
    args.filter((arg) => arg === '--output').length !== 1) {
  throw new Error('usage: node patch-fetch-binding.mjs --input ORIGINAL_BUNDLE --output PATCHED_BUNDLE');
}
const inputPath = resolve(inputArgument);
const outputPath = resolve(outputArgument);
const expectedSha256 = 'fb0afab75e7a8567ced5ec81208bac16bdbe04ac002489f589084d3d4a4e49de';
const marker = 'this.#b=e.fetcher??fetch';
const replacement = 'this.#b=e.fetcher??fetch.bind(globalThis)';

const source = await readFile(inputPath, 'utf8');
const digest = createHash('sha256').update(source).digest('hex');
if (digest !== expectedSha256) throw new Error('source bundle hash mismatch; refusing patch');
const occurrences = source.split(marker).length - 1;
if (occurrences !== 1) throw new Error(`expected one fetch receiver marker; found ${occurrences}`);

const output = source.replace(marker, replacement);
if (output.split(replacement).length - 1 !== 1 || output.replace(replacement, '').includes(marker)) {
  throw new Error('post-patch marker verification failed');
}
await writeFile(outputPath, output, { flag: 'wx', mode: 0o600 });
const patchedSha256 = createHash('sha256').update(output).digest('hex');
console.log(JSON.stringify({
  patched: true,
  originalSha256: digest,
  patchedSha256,
  replacementCount: 1,
  outputPath,
}));
