import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Execution mode configuration
// Modes: 'production' (default), 'debug', 'development'
const executionMode = process.env.TEST_EXECUTION_MODE || 'production';
const isDebugMode = process.env.DEBUG_MODE === 'true';
const isDevelopmentMode = executionMode === 'development';
const isProductionMode = executionMode === 'production';

// Worker configuration based on execution mode
let workers: number | string | undefined;
if (process.env.TEST_WORKERS) {
  // Allow explicit worker configuration
  if (process.env.TEST_WORKERS === 'auto') {
    workers = undefined; // Let Playwright decide (50% of CPU cores)
  } else if (process.env.TEST_WORKERS.includes('%')) {
    workers = process.env.TEST_WORKERS; // Percentage (e.g., "50%")
  } else {
    workers = parseInt(process.env.TEST_WORKERS, 10); // Specific number
  }
} else {
  // Default based on execution mode
  workers = isDevelopmentMode ? 1 : 
            isDebugMode ? 1 : 
            process.env.CI ? 1 : undefined; // auto in local production
}

// Headed mode configuration
const headed = process.env.TEST_HEADED === 'true' || isDevelopmentMode;

const testDir = defineBddConfig({
  paths: ['e2e/features/**/*.feature'],
  require: ['e2e/src/steps/**/*.ts'],
});

/**
 * Playwright configuration for DAEE Platform E2E Testing
 * 
 * Features:
 * - BDD/Cucumber integration via playwright-bdd
 * - Playwright HTML reporter (trace viewer link)
 * - Allure Report 3 (allure-playwright) for steps, attachments, and Allure 3 UI
 * - Multi-environment support (local, staging)
 * - Pre-authenticated sessions via global setup
 */
export default defineConfig({
  testDir,
  
  /* Maximum time one test can run for */
  timeout: 60 * 1000,
  
  /* Test execution settings */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: workers,
  
  /* Reporter configuration */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          node_version: process.version,
          playwright_version: process.env.npm_package_dependencies__playwright_test?.replace('^', '') ?? 'unknown',
        },
      },
    ],
  ],
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/src/support/global.setup.ts'),
  
  /* Shared settings for all projects */
  use: {
    /* Base URL from environment variable */
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    
    /* Headed mode: visible browser in development mode, headless in production */
    headless: !headed,
    
    /* Debug mode: capture everything, Normal mode: only on failure/retry */
    trace: isDebugMode ? 'on' : 'on-first-retry',
    
    /* Screenshot: on every step in debug mode, only on failure in normal mode */
    screenshot: isDebugMode ? 'on' : 'only-on-failure',
    
    /* Video: record all in debug mode, only on failure in normal mode */
    video: isDebugMode ? 'on' : 'retain-on-failure',
    
    /* Navigation timeout */
    navigationTimeout: 30 * 1000,
    
    /* Action timeout */
    actionTimeout: 15 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs first to authenticate
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    
    // Login tests - use fresh context (no pre-authentication)
    {
      name: 'login-tests',
      testMatch: /login\.feature/,
      use: {
        ...devices['Desktop Chrome'],
        // Don't use storage state for login tests - we're testing login itself
        // storageState: undefined,
      },
    },

    // O2C tests - IACS MD User (must be before chromium for test assignment)
    {
      name: 'chromium-o2c',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/iacs-md.json',
      },
      testMatch: /o2c[/\\].*\.feature/,
      dependencies: ['setup'],
      testIgnore: /login\.feature/,
    },

    // O2C tests - Super Admin (same tests as chromium-o2c, different user)
    // Run with: npm run test:dev -- --project=chromium-o2c-super-admin --grep "@O2C-"
    {
      name: 'chromium-o2c-super-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      testMatch: /o2c[/\\].*\.feature/,
      dependencies: ['setup'],
      testIgnore: /login\.feature/,
    },

    // Default chromium - Super Admin (excludes O2C - they use chromium-o2c)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use pre-authenticated state from setup
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      // Exclude login tests - they need fresh context; exclude O2C - they use chromium-o2c
      testIgnore: [/login\.feature/, /o2c[/\\].*\.feature/],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      // Exclude login tests - they need fresh context
      // Exclude O2C tests - run only on chromium for now
      testIgnore: [/login\.feature/, /o2c\/.*\.feature/],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      // Exclude login tests - they need fresh context
      // Exclude O2C tests - run only on chromium for now
      testIgnore: [/login\.feature/, /o2c\/.*\.feature/],
    },

    /* Mobile viewports for responsive testing */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //     storageState: 'e2e/.auth/admin.json',
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 13'],
    //     storageState: 'e2e/.auth/admin.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  /* Development server configuration */
  webServer: process.env.CI ? undefined : {
    command: 'cd ../web_app && npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
