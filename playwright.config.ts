import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// ==========================================
// Execution Mode Configuration
// ==========================================
/**
 * Execution Modes:
 * - 'production': Parallel execution, optimized for CI/CD and regression (default)
 * - 'debug': Single worker, extended timeouts, screenshots on failure
 * - 'development': Single worker, headed mode, verbose output for authoring tests
 */
const executionMode = process.env.TEST_EXECUTION_MODE || 'production';
const isDebugMode = executionMode === 'debug';
const isDevelopmentMode = executionMode === 'development';
const isProductionMode = executionMode === 'production';

// ==========================================
// Worker Configuration (Optimized by Mode)
// ==========================================
/**
 * Worker Strategy:
 * - Development/Debug: 1 worker (sequential execution for stability)
 * - Production (local): auto (50% of CPU cores)
 * - Production (CI): 2 workers (balance speed vs resource usage)
 * - Override: Set TEST_WORKERS env var (number, percentage, or 'auto')
 */
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
            process.env.CI ? 2 : undefined; // auto in local production (50% cores)
}

console.log(`🔧 Execution Mode: ${executionMode}`);
console.log(`👷 Workers: ${workers === undefined ? 'auto (50% of cores)' : workers}`);

// ==========================================
// Timeout Configuration (Optimized by Mode)
// ==========================================
/**
 * Timeout Strategy:
 * - Production: 60s test, 30s action (optimized for speed)
 * - Debug: 120s test, 45s action (extended for debugging)
 * - Development: 90s test, 45s action (balance between speed and debugging)
 */
const timeouts = {
  test: isDebugMode ? 120000 : isDevelopmentMode ? 90000 : 60000,
  action: isDebugMode ? 45000 : isDevelopmentMode ? 45000 : 30000,
  navigation: isDebugMode ? 45000 : isDevelopmentMode ? 45000 : 30000,
};

console.log(`⏱️  Timeouts: test=${timeouts.test / 1000}s, action=${timeouts.action / 1000}s`);

// ==========================================
// Retry Configuration (Optimized by Mode)
// ==========================================
/**
 * Retry Strategy:
 * - Production (CI): 2 retries (handle infrastructure flakiness)
 * - Production (local): 1 retry (catch occasional flakiness)
 * - Debug/Development: 0 retries (immediate feedback)
 */
const retries = isDebugMode || isDevelopmentMode ? 0 :
                process.env.CI ? 2 : 1;

console.log(`🔁 Retries: ${retries}`);

// ==========================================
// Visual Mode Configuration
// ==========================================
const headed = process.env.TEST_HEADED === 'true' || isDevelopmentMode;

console.log(`👁️  Headed: ${headed ? 'Yes' : 'No'}\n`);

const testDir = defineBddConfig({
  paths: ['e2e/features/**/*.feature'],
  require: ['e2e/src/steps/**/*.ts'],
});

/**
 * Chrome configuration: Use system Chrome instead of bundled Chromium
 * 
 * Using channel: 'chrome' to use system-installed Chrome browser
 * instead of Playwright's bundled Chromium. This avoids sandbox issues
 * and uses the Chrome browser already installed on the system.
 * 
 * Desktop Chrome device preset provides viewport: 1280x720, userAgent, etc.
 */
const chromeConfig = {
  ...devices['Desktop Chrome'],
  channel: 'chrome' as const, // Use system Chrome instead of bundled Chromium
};

/**
 * Reporter configuration: Monocart for dev/debug (video, network metrics), Allure for production (BDD steps).
 * - Development/Debug: Monocart when os.cpus() is available; else Playwright HTML (auto-open on failure).
 * - Production: Playwright HTML + Allure (generated in teardown).
 * Monocart can throw in some environments (e.g. empty os.cpus()); fallback avoids getting stuck.
 */
const useMonocartInDev =
  (isDevelopmentMode || isDebugMode) &&
  typeof os.cpus === 'function' &&
  os.cpus().length > 0;

const reporterConfig = useMonocartInDev
  ? [
      ['list'],
      [
        'monocart-reporter',
        {
          name: 'DAEE Test Report',
          outputFile: './monocart-report/index.html',
          copyAttachments: true,
          traceViewerUrl: 'https://trace.playwright.dev/?trace={traceUrl}',
        },
      ],
    ]
  : (isDevelopmentMode || isDebugMode)
    ? [
        ['list'],
        ['html', { open: 'on-failure' }],
      ]
    : [
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
    ];

/**
 * Playwright configuration for DAEE Platform E2E Testing
 *
 * Features:
 * - BDD/Cucumber integration via playwright-bdd
 * - Conditional reporters: Monocart (dev/debug), Playwright HTML + Allure (production)
 * - Multi-environment support (local, staging)
 * - Pre-authenticated sessions via global setup
 */
export default defineConfig({
  testDir,

  /* Timeouts (optimized by execution mode) */
  timeout: timeouts.test,

  /* Test execution settings */
  fullyParallel: !isDebugMode && !isDevelopmentMode, // Sequential in debug/dev mode
  forbidOnly: !!process.env.CI,
  retries: retries,
  workers: workers,

  /* Reporter configuration (mode-based) */
  reporter: reporterConfig,
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/src/support/global.setup.ts'),
  globalTeardown: require.resolve('./e2e/src/support/global.teardown.ts'),
  
  /* Global timeout settings */
  expect: {
    timeout: timeouts.action,
  },
  
  /* Shared settings for all projects */
  use: {
    /* Base URL from environment variable */
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    
    /* Headed mode: visible browser in development mode, headless in production */
    headless: !headed,
    
    /* Debug/Dev mode: capture everything for Monocart report; Production: only on failure/retry */
    trace: isDebugMode || isDevelopmentMode ? 'on' : 'on-first-retry',
    
    /* Screenshot: on every step in dev/debug (for Monocart); production: only on failure */
    screenshot: isDebugMode || isDevelopmentMode ? 'on' : 'only-on-failure',
    
    /* Video: record all in dev/debug (for Monocart); production: only on failure */
    video: isDebugMode || isDevelopmentMode ? 'on' : 'retain-on-failure',
    
    /* Navigation timeout (optimized by mode) */
    navigationTimeout: timeouts.navigation,
    
    /* Action timeout (optimized by mode) */
    actionTimeout: timeouts.action,
  },

  /* Configure projects for major browsers */
  /**
   * Multi-User Project Strategy (70/30 Hybrid Approach)
   * 
   * Primary Projects (70% single-user tests):
   * - Use file path routing (testMatch) + tag filtering (grep)
   * - Run single-user tests ONCE + multi-user tests for their role
   * - Examples: iacs-md, iacs-finance, super-admin
   * 
   * Secondary Projects (30% multi-user tests only):
   * - Use tag-based routing (@multi-user + user tag)
   * - Run ONLY multi-user tests for specific roles
   * - Examples: multi-user-iacs-finance, multi-user-iacs-warehouse
   * 
   * Benefits:
   * - 70 single-user tests × 1 = 70 runs
   * - 30 multi-user tests × 4 users = 120 runs
   * - Total: 190 runs (vs 400 if all were multi-user!)
   */
  projects: [
    // ===== SETUP & LOGIN =====
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    
    {
      name: 'login-tests',
      testMatch: /login\.spec\.js/,              // Matches generated .spec.js files
      use: {
        ...chromeConfig,
        // Fresh context - testing login itself
        storageState: { cookies: [], origins: [] },
      },
    },

    // ===== PRIMARY USER PROJECTS (70% single-user tests) =====
    
    // IACS MD User - Primary for O2C tests + Finance tests (has finance:read permission)
    {
      name: 'iacs-md',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/iacs-md.json',
      },
      testMatch: /(o2c|finance)[/\\].*\.spec\.js$/,  // File path routing: O2C + Finance (matches generated .spec.js files)
      grep: /@iacs-md/,                          // Tag filtering
      grepInvert: /@skip-iacs-md/,               // Skip exclusions
      dependencies: ['setup'],
      testIgnore: /login\.spec\.js/,
    },

    // IACS Finance Admin - Primary for Finance tests (when created)
    {
      name: 'iacs-finance',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/iacs-finance-admin.json',
      },
      testMatch: /finance[/\\].*\.spec\.js$/,
      grep: /@iacs-finance/,
      grepInvert: /@skip-iacs-finance/,
      dependencies: ['setup'],
      testIgnore: /login\.spec\.js/,
    },

    // IACS Warehouse Manager - Primary for Warehouse tests (when created)
    {
      name: 'iacs-warehouse',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/iacs-warehouse-manager.json',
      },
      testMatch: /warehouse[/\\].*\.spec\.js$/,
      grep: /@iacs-warehouse/,
      grepInvert: /@skip-iacs-warehouse/,
      dependencies: ['setup'],
      testIgnore: /login\.spec\.js/,
    },

    // Super Admin - Primary for Admin tests + fallback
    {
      name: 'super-admin',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/admin.json',
      },
      testMatch: /(?!login|o2c|finance|warehouse).*\.spec\.js$/,
      grep: /@super-admin/,
      dependencies: ['setup'],
      testIgnore: /login\.spec\.js/,
    },

    // ===== SECONDARY USER PROJECTS (30% multi-user tests only) =====
    
    // IACS Finance - Multi-user tests only
    {
      name: 'multi-user-iacs-finance',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/iacs-finance-admin.json',
      },
      grep: /@multi-user.*@iacs-finance/,        // Only multi-user + finance tag
      testMatch: /(?!login).*\.spec\.js$/,         // Any generated spec file
      dependencies: ['setup'],
    },
    
    // IACS Warehouse - Multi-user tests only
    {
      name: 'multi-user-iacs-warehouse',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/iacs-warehouse-manager.json',
      },
      grep: /@multi-user.*@iacs-warehouse/,
      testMatch: /(?!login).*\.spec\.js$/,
      dependencies: ['setup'],
    },
    
    // Super Admin - Multi-user tests only
    {
      name: 'multi-user-super-admin',
      use: {
        ...chromeConfig,
        storageState: 'e2e/.auth/admin.json',
      },
      grep: /@multi-user.*@super-admin/,
      testMatch: /(?!login).*\.spec\.js$/,
      dependencies: ['setup'],
    },

    // ===== CROSS-BROWSER (Super Admin, smoke tests only - Production mode only) =====
    // Note: Firefox/WebKit projects only run in production mode (not dev/debug)
    // Dev mode should use Chrome only for faster iteration
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/admin.json',
      },
      grep: /@cross-browser|@smoke/,
      dependencies: ['setup'],
      testIgnore: /login\.spec\.js/,
      // Only run in production mode (skip in dev/debug)
      ...(isDevelopmentMode || isDebugMode ? { testMatch: /$^/ } : {}), // Empty regex = no matches
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/admin.json',
      },
      grep: /@cross-browser|@smoke/,
      dependencies: ['setup'],
      testIgnore: /login\.spec\.js/,
      // Only run in production mode (skip in dev/debug)
      ...(isDevelopmentMode || isDebugMode ? { testMatch: /$^/ } : {}), // Empty regex = no matches
    },

    /* Mobile viewports for responsive testing */
    // {
    //   name: 'mobile-chrome-android',
    //   testMatch: /(?!login).*mobile.*\.feature/,
    //   use: {
    //     ...devices['Pixel 5'],
    //     storageState: 'e2e/.auth/admin.json',
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'mobile-safari-ios',
    //   testMatch: /(?!login).*mobile.*\.feature/,
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
