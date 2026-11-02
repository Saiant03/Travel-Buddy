import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  projects: [
    {
      name: 'shell',
      testMatch: 'shell.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4173',
        headless: true,
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        },
      },
    },
    {
      name: 'server-console',
      testMatch: 'server-console.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4175',
        headless: true,
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        },
      },
    },
    {
      name: 'offline-probe',
      testMatch: 'offline-probe.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4174',
        headless: true,
        serviceWorkers: 'allow',
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
        },
      },
    },
  ],
  fullyParallel: false,
  reporter: 'list',
  use: { trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build:probe && npm run preview:probe',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build:server-probe && npm run preview:server-probe',
      url: 'http://127.0.0.1:4175',
      reuseExistingServer: false,
    },
  ],
});
