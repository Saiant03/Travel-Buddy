import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const probeRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: resolve(probeRoot, '../../tests/e2e'),
  testMatch: ['offline-probe.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  outputDir: resolve(probeRoot, '../../test-results/offline-probe'),
  use: {
    baseURL: 'http://127.0.0.1:4174',
    headless: true,
    serviceWorkers: 'allow',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] },
  },
});
