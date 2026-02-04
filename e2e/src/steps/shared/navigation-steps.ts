import { Given, When } from '@cucumber/cucumber';

/**
 * Shared Navigation Steps
 * 
 * Reusable step definitions for common navigation actions.
 * These steps can be used across all feature files.
 */

/**
 * Navigate to any page by name
 * 
 * @example
 * Given I am on the "orders" page
 * Given I am on the "o2c/indents" page
 */
Given('I am on the {string} page', async function ({ page }, pageName: string) {
  const normalizedPath = pageName.startsWith('/') ? pageName : `/${pageName}`;
  await page.goto(normalizedPath);
  await page.waitForLoadState('networkidle');
  console.log(`✅ Navigated to ${normalizedPath}`);
});

/**
 * Navigate to a specific URL path
 * 
 * @example
 * When I navigate to "/orders/list"
 * When I navigate to "/o2c/indents/create"
 */
When('I navigate to {string}', async function ({ page }, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  console.log(`✅ Navigated to ${path}`);
});

/**
 * Click any button by name
 * 
 * @example
 * When I click the "Submit" button
 * When I click the "Add Product" button
 */
When('I click the {string} button', async function ({ page }, buttonName: string) {
  await page.getByRole('button', { name: buttonName }).click();
  console.log(`✅ Clicked "${buttonName}" button`);
});

/**
 * Click any link by name
 * 
 * @example
 * When I click the "View Details" link
 */
When('I click the {string} link', async function ({ page }, linkName: string) {
  await page.getByRole('link', { name: linkName }).click();
  console.log(`✅ Clicked "${linkName}" link`);
});

/**
 * Go back in browser history
 * 
 * @example
 * When I go back
 */
When('I go back', async function ({ page }) {
  await page.goBack();
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated back');
});

/**
 * Reload the current page
 * 
 * @example
 * When I reload the page
 */
When('I reload the page', async function ({ page }) {
  await page.reload();
  await page.waitForLoadState('networkidle');
  console.log('✅ Reloaded page');
});

/**
 * Wait for page to finish loading
 * 
 * @example
 * When I wait for the page to load
 */
When('I wait for the page to load', async function ({ page }) {
  await page.waitForLoadState('networkidle');
  console.log('✅ Page loaded');
});

/**
 * Click element with specific text
 * 
 * @example
 * When I click on "Product A"
 */
When('I click on {string}', async function ({ page }, text: string) {
  await page.getByText(text).click();
  console.log(`✅ Clicked on "${text}"`);
});

/**
 * Hover over element
 * 
 * @example
 * When I hover over "Settings"
 */
When('I hover over {string}', async function ({ page }, text: string) {
  await page.getByText(text).hover();
  console.log(`✅ Hovered over "${text}"`);
});

/**
 * Double click element
 * 
 * @example
 * When I double click "Edit"
 */
When('I double click {string}', async function ({ page }, text: string) {
  await page.getByText(text).dblclick();
  console.log(`✅ Double clicked "${text}"`);
});
