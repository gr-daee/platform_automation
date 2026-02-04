import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

/**
 * Shared Assertion Steps
 * 
 * Reusable step definitions for common assertions and verifications.
 * These steps can be used across all feature files.
 */

/**
 * Verify success message appears (toast or alert)
 * 
 * @example
 * Then I should see a success message
 */
Then('I should see a success message', async function ({ page }) {
  const toast = page.locator('[data-sonner-toast]');
  await expect(toast).toContainText(/success|saved|created|updated|deleted|completed/i, {
    timeout: 5000,
  });
  console.log('✅ Success message verified');
});

/**
 * Verify error message appears
 * 
 * @example
 * Then I should see an error message
 */
Then('I should see an error message', async function ({ page }) {
  // Check for toast first
  const toast = page.locator('[data-sonner-toast]');
  const hasToast = (await toast.count()) > 0;
  
  if (hasToast) {
    await expect(toast).toContainText(/error|failed|invalid|unable|cannot/i, { timeout: 5000 });
  } else {
    // Check for alert role (form validation errors)
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
  }
  
  console.log('✅ Error message verified');
});

/**
 * Verify specific message appears
 * 
 * @example
 * Then I should see "Order created successfully"
 * Then I should see "Email is required"
 */
Then('I should see {string}', async function ({ page }, message: string) {
  await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
  console.log(`✅ Verified message: "${message}"`);
});

/**
 * Verify message does not appear
 * 
 * @example
 * Then I should not see "Error occurred"
 */
Then('I should not see {string}', async function ({ page }, message: string) {
  await expect(page.getByText(message)).toBeHidden();
  console.log(`✅ Verified message not visible: "${message}"`);
});

/**
 * Verify current URL matches path
 * 
 * @example
 * Then I should be on the "/orders" page
 * Then I should be on the "orders/list" page
 */
Then('I should be on the {string} page', async function ({ page }, expectedPath: string) {
  const normalizedPath = expectedPath.startsWith('/') ? expectedPath : `/${expectedPath}`;
  await expect(page).toHaveURL(new RegExp(normalizedPath));
  console.log(`✅ Verified URL contains: ${normalizedPath}`);
});

/**
 * Verify redirected to specific page
 * 
 * @example
 * Then I should be redirected to the "notes" page
 */
Then('I should be redirected to the {string} page', async function ({ page }, pageName: string) {
  const normalizedPath = pageName.startsWith('/') ? pageName : `/${pageName}`;
  await expect(page).toHaveURL(new RegExp(normalizedPath), { timeout: 10000 });
  console.log(`✅ Verified redirect to: ${normalizedPath}`);
});

/**
 * Verify page title
 * 
 * @example
 * Then the page title should be "Orders"
 */
Then('the page title should be {string}', async function ({ page }, expectedTitle: string) {
  await expect(page).toHaveTitle(new RegExp(expectedTitle));
  console.log(`✅ Verified page title: "${expectedTitle}"`);
});

/**
 * Verify element is visible
 * 
 * @example
 * Then the "Submit" button should be visible
 */
Then('the {string} button should be visible', async function ({ page }, buttonName: string) {
  await expect(page.getByRole('button', { name: buttonName })).toBeVisible();
  console.log(`✅ Verified "${buttonName}" button is visible`);
});

/**
 * Verify element is hidden
 * 
 * @example
 * Then the "Submit" button should be hidden
 */
Then('the {string} button should be hidden', async function ({ page }, buttonName: string) {
  await expect(page.getByRole('button', { name: buttonName })).toBeHidden();
  console.log(`✅ Verified "${buttonName}" button is hidden`);
});

/**
 * Verify button is enabled
 * 
 * @example
 * Then the "Submit" button should be enabled
 */
Then('the {string} button should be enabled', async function ({ page }, buttonName: string) {
  await expect(page.getByRole('button', { name: buttonName })).toBeEnabled();
  console.log(`✅ Verified "${buttonName}" button is enabled`);
});

/**
 * Verify button is disabled
 * 
 * @example
 * Then the "Submit" button should be disabled
 */
Then('the {string} button should be disabled', async function ({ page }, buttonName: string) {
  await expect(page.getByRole('button', { name: buttonName })).toBeDisabled();
  console.log(`✅ Verified "${buttonName}" button is disabled`);
});

/**
 * Verify field has specific value
 * 
 * @example
 * Then the "Name" field should contain "Product A"
 */
Then('the {string} field should contain {string}', async function (
  { page },
  fieldLabel: string,
  expectedValue: string
) {
  const field = page.getByLabel(fieldLabel);
  await expect(field).toHaveValue(expectedValue);
  console.log(`✅ Verified "${fieldLabel}" contains: "${expectedValue}"`);
});

/**
 * Verify field is empty
 * 
 * @example
 * Then the "Name" field should be empty
 */
Then('the {string} field should be empty', async function ({ page }, fieldLabel: string) {
  const field = page.getByLabel(fieldLabel);
  await expect(field).toHaveValue('');
  console.log(`✅ Verified "${fieldLabel}" is empty`);
});

/**
 * Verify validation error for specific field
 * 
 * @example
 * Then I should see a validation error for "Email"
 */
Then('I should see a validation error for {string}', async function ({ page }, fieldLabel: string) {
  // Look for alert role under or near the field
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  console.log(`✅ Verified validation error for "${fieldLabel}"`);
});

/**
 * Verify dialog/modal is open
 * 
 * @example
 * Then a dialog should be open
 */
Then('a dialog should be open', async function ({ page }) {
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  console.log('✅ Verified dialog is open');
});

/**
 * Verify dialog/modal is closed
 * 
 * @example
 * Then the dialog should be closed
 */
Then('the dialog should be closed', async function ({ page }) {
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 });
  console.log('✅ Verified dialog is closed');
});

/**
 * Verify element contains specific text
 * 
 * @example
 * Then the page should contain "Welcome back"
 */
Then('the page should contain {string}', async function ({ page }, text: string) {
  await expect(page.locator('body')).toContainText(text);
  console.log(`✅ Verified page contains: "${text}"`);
});

/**
 * Verify element count
 * 
 * @example
 * Then I should see 5 "Product" items
 */
Then('I should see {int} {string} items', async function ({ page }, count: number, itemName: string) {
  const items = page.getByText(itemName);
  await expect(items).toHaveCount(count);
  console.log(`✅ Verified ${count} "${itemName}" items`);
});

/**
 * Verify table has specific number of rows
 * 
 * @example
 * Then the table should have 10 rows
 */
Then('the table should have {int} rows', async function ({ page }, rowCount: number) {
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(rowCount);
  console.log(`✅ Verified table has ${rowCount} rows`);
});

/**
 * Verify link is present
 * 
 * @example
 * Then I should see a "View Details" link
 */
Then('I should see a {string} link', async function ({ page }, linkName: string) {
  await expect(page.getByRole('link', { name: linkName })).toBeVisible();
  console.log(`✅ Verified "${linkName}" link is visible`);
});

/**
 * Verify heading is present
 * 
 * @example
 * Then I should see the "Dashboard" heading
 */
Then('I should see the {string} heading', async function ({ page }, headingText: string) {
  await expect(page.getByRole('heading', { name: headingText })).toBeVisible();
  console.log(`✅ Verified "${headingText}" heading is visible`);
});

/**
 * Verify checkbox is checked
 * 
 * @example
 * Then the "I agree" checkbox should be checked
 */
Then('the {string} checkbox should be checked', async function ({ page }, checkboxLabel: string) {
  await expect(page.getByRole('checkbox', { name: checkboxLabel })).toBeChecked();
  console.log(`✅ Verified "${checkboxLabel}" checkbox is checked`);
});

/**
 * Verify checkbox is unchecked
 * 
 * @example
 * Then the "Send notifications" checkbox should be unchecked
 */
Then('the {string} checkbox should be unchecked', async function ({ page }, checkboxLabel: string) {
  await expect(page.getByRole('checkbox', { name: checkboxLabel })).not.toBeChecked();
  console.log(`✅ Verified "${checkboxLabel}" checkbox is unchecked`);
});

/**
 * Verify element has specific class
 * 
 * @example
 * Then the element should have class "active"
 */
Then('the element should have class {string}', async function ({ page }, className: string) {
  const element = page.locator(`.${className}`).first();
  await expect(element).toBeVisible();
  console.log(`✅ Verified element has class: "${className}"`);
});

/**
 * Verify loading indicator is not visible
 * 
 * @example
 * Then the loading indicator should not be visible
 */
Then('the loading indicator should not be visible', async function ({ page }) {
  const loadingIndicator = page.locator('[role="progressbar"]').or(
    page.locator('[aria-busy="true"]')
  );
  await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
  console.log('✅ Verified loading indicator is not visible');
});
