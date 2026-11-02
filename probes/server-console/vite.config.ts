import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { CONSOLE_CSP } from './security.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const contractRoot = new URL('../../src/shared/contracts/', import.meta.url);

async function listRuntimeContracts(directory: URL, prefix = ''): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    if (entry.isDirectory()) files.push(...await listRuntimeContracts(entryUrl, relative));
    else if (/\.tsx?$/.test(entry.name)) files.push(`../../src/shared/contracts/${relative}`);
  }
  return files;
}

const sourceFiles = [
  'index.html',
  'main.ts',
  'vite.config.ts',
  'security.ts',
  'style.css',
  'controller.ts',
  'seed.ts',
  '../auth-worker.ts',
  '../cas-worker.ts',
  '../cpu-runner.ts',
  '../server/index.ts',
  '../server/console-worker.ts',
  '../migrations/0001_probe.sql',
  '../server/wrangler.console.toml',
  '../../package.json',
  '../../package-lock.json',
  '../../tsconfig.json',
  ...await listRuntimeContracts(contractRoot),
].sort();

const digest = createHash('sha256');
for (const file of sourceFiles) {
  digest.update(file);
  digest.update('\0');
  digest.update(await readFile(new URL(file, import.meta.url)));
  digest.update('\0');
}
const sourceHash = digest.digest('hex');

const cloudflareHeaders = {
  name: 'server-probe-cloudflare-headers',
  generateBundle(this: { emitFile(asset: { type: 'asset'; fileName: string; source: string }): void }) {
    this.emitFile({
      type: 'asset',
      fileName: '_headers',
      source: `/*\n  Content-Security-Policy: ${CONSOLE_CSP}\n  X-Content-Type-Options: nosniff\n`,
    });
  },
};

export default defineConfig({
  root,
  define: { __PROBE_SOURCE_HASH__: JSON.stringify(sourceHash) },
  plugins: [cloudflareHeaders],
  build: {
    outDir: '../../dist-server-probe',
    emptyOutDir: true,
  },
});
