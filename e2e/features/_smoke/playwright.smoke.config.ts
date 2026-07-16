import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Minimal config for the 6-ticket DAEE smoke.
 * - No BDD generation, no global setup, no allure teardown.
 * - Reuses the existing e2e/.auth/iacs-md.json (Jul 2) staging session.
 */
export default defineConfig({
  testDir: __dirname,
  testMatch: /(daee-6tix-smoke|daee-fresh-login|daee-1207-.*|daee-1208-.*|daee-1204-.*|daee-1213-.*|daee-1214-.*|daee-1199-.*|daee-wave4-.*|daee-wave5-.*)\.spec\.ts$/,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'iacs-md-smoke',
      use: {
        ...devices['Desktop Chrome'],
        // Prefer the fresh /tmp/iacs-md-fresh.json if present, else fall back to the stale saved file.
        storageState: require('fs').existsSync('/tmp/iacs-md-fresh.json')
          ? '/tmp/iacs-md-fresh.json'
          : path.resolve(__dirname, '../../.auth/iacs-md.json'),
      },
    },
  ],
});
