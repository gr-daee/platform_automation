import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Global Teardown for DAEE Platform E2E Tests
 *
 * Conditional behavior based on TEST_EXECUTION_MODE:
 * - production: Generate Allure report (allure-results → allure-report)
 * - development/debug: Skip Allure; open Monocart report if present (auto-open for dev workflow)
 */
async function globalTeardown(_config: FullConfig) {
  const executionMode = process.env.TEST_EXECUTION_MODE || 'production';
  const isDevOrDebug = executionMode === 'development' || executionMode === 'debug';
  const projectRoot = path.resolve(__dirname, '../../../');
  const fs = require('fs') as typeof import('fs');

  if (isDevOrDebug) {
    // Dev/Debug: open Monocart report if it was generated (Monocart reporter runs during tests)
    const monocartReportPath = path.join(projectRoot, 'monocart-report', 'index.html');
    if (fs.existsSync(monocartReportPath)) {
      console.log('\n📊 ===== OPENING MONOCART REPORT =====\n');
      try {
        execSync(`npx monocart show-report monocart-report/index.html`, {
          cwd: projectRoot,
          stdio: 'inherit',
          env: { ...process.env },
        });
      } catch (err) {
        console.log('💡 To view the report manually: npx monocart show-report monocart-report/index.html\n');
      }
    }
    return;
  }

  // Production: generate Allure report
  console.log('\n📊 ===== GENERATING ALLURE REPORT =====\n');

  const allureResultsDir = path.join(projectRoot, 'allure-results');
  const allureReportDir = path.join(projectRoot, 'allure-report');

  try {
    if (!fs.existsSync(allureResultsDir)) {
      console.log('⚠️  No allure-results directory found. Skipping report generation.');
      return;
    }

    const resultFiles = fs.readdirSync(allureResultsDir).filter((file: string) =>
      file.endsWith('-result.json')
    );

    if (resultFiles.length === 0) {
      console.log('⚠️  No test results found in allure-results/. Skipping report generation.');
      return;
    }

    console.log(`📈 Found ${resultFiles.length} test result(s)`);
    console.log('🔄 Generating Allure report...');

    // Allure 3: use relative paths from projectRoot; pattern defaults to ./**/allure-results
    execSync(
      `npx allure generate allure-results --output allure-report --clean`,
      {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env },
      }
    );

    console.log('✅ Allure report generated successfully!');
    console.log(`📁 Report location: ${allureReportDir}/index.html`);
    console.log('\n💡 To view the report:');
    console.log('   npm run test:report:allure:open');
    console.log('   Or open: allure-report/index.html\n');
  } catch (error) {
    console.error('❌ Failed to generate Allure report:', (error as Error).message);
    console.error('💡 You can manually generate the report with:');
    console.error('   npm run test:report:allure:generate\n');
  }
}

export default globalTeardown;
