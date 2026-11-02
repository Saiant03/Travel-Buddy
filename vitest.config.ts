import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/api/**/*.{test,spec}.{ts,tsx}',
      'tests/probes/**/*.{test,spec}.{ts,tsx}',
    ],
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
  },
});
