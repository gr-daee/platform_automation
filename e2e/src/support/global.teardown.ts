import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Global Teardown for DAEE Platform E2E Tests
 * 
 * Purpose: Automatically generate Allure report after test execution
 * Similar to Extent Reports in WebdriverIO - report is always ready after tests
 * 
 * Flow:
 * 1. Tests complete (allure-results/ populated by allure-playwright)
 * 2. Global teardown runs
 * 3. Generate Allure HTML report from allure-results/
 * 4. Report is ready for viewing (no manual generation needed)
 * 
 * Usage:
 * - Report automatically generated after each test run
 * - View with: npm run test:report:allure:open
 * - Or open: allure-report/index.html
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n📊 ===== GENERATING ALLURE REPORT =====\n');

  const projectRoot = path.resolve(__dirname, '../../../');
  const allureResultsDir = path.join(projectRoot, 'allure-results');
  const allureReportDir = path.join(projectRoot, 'allure-report');

  try {
    // Check if allure-results directory exists and has results
    const fs = require('fs');
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

    // Generate Allure report
    execSync(
      `npx allure generate "${allureResultsDir}" -o "${allureReportDir}" --clean`,
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
    // Don't throw - allow tests to complete even if report generation fails
  }
}

export default globalTeardown;
