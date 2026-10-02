import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ParaBank Automation Framework:
 * Single test runner on Chromium, sequential execution.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://parabank.parasoft.com',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: {
      slowMo: 1000, // 1 second delay between Playwright actions
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
