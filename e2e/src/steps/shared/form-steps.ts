import { When } from '@cucumber/cucumber';

/**
 * Shared Form Interaction Steps
 * 
 * Reusable step definitions for common form actions.
 * These steps can be used across all feature files.
 */

/**
 * Fill any field by label
 * 
 * @example
 * When I fill the "Name" field with "Product A"
 * When I fill the "Quantity" field with "100"
 */
When('I fill the {string} field with {string}', async function (
  { page },
  fieldLabel: string,
  value: string
) {
  const field = page.getByLabel(fieldLabel);
  await field.clear();
  await field.fill(value);
  console.log(`✅ Filled "${fieldLabel}" with: "${value}"`);
});

/**
 * Fill field by placeholder
 * 
 * @example
 * When I fill "Enter your email" with "test@example.com"
 */
When('I fill {string} with {string}', async function ({ page }, placeholder: string, value: string) {
  const field = page.getByPlaceholder(placeholder);
  await field.clear();
  await field.fill(value);
  console.log(`✅ Filled field with placeholder "${placeholder}"`);
});

/**
 * Clear any field
 * 
 * @example
 * When I clear the "Name" field
 */
When('I clear the {string} field', async function ({ page }, fieldLabel: string) {
  const field = page.getByLabel(fieldLabel);
  await field.clear();
  console.log(`✅ Cleared "${fieldLabel}" field`);
});

/**
 * Select option from dropdown (ShadCN/Radix Select)
 * 
 * @example
 * When I select "Electronics" from the "Category" dropdown
 */
When('I select {string} from the {string} dropdown', async function (
  { page },
  optionValue: string,
  dropdownLabel: string
) {
  // Click trigger to open dropdown
  await page.getByRole('combobox', { name: dropdownLabel }).click();
  
  // Wait for listbox to appear
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  
  // Select option
  await page.getByRole('option', { name: optionValue }).click();
  
  console.log(`✅ Selected "${optionValue}" from "${dropdownLabel}" dropdown`);
});

/**
 * Check checkbox by label
 * 
 * @example
 * When I check the "I agree to terms" checkbox
 */
When('I check the {string} checkbox', async function ({ page }, checkboxLabel: string) {
  const checkbox = page.getByRole('checkbox', { name: checkboxLabel });
  
  if (!(await checkbox.isChecked())) {
    await checkbox.click();
  }
  
  console.log(`✅ Checked "${checkboxLabel}" checkbox`);
});

/**
 * Uncheck checkbox by label
 * 
 * @example
 * When I uncheck the "Send notifications" checkbox
 */
When('I uncheck the {string} checkbox', async function ({ page }, checkboxLabel: string) {
  const checkbox = page.getByRole('checkbox', { name: checkboxLabel });
  
  if (await checkbox.isChecked()) {
    await checkbox.click();
  }
  
  console.log(`✅ Unchecked "${checkboxLabel}" checkbox`);
});

/**
 * Submit form
 * 
 * @example
 * When I submit the form
 */
When('I submit the form', async function ({ page }) {
  const submitButton = page.getByRole('button', {
    name: /submit|save|create|update|confirm/i,
  });
  await submitButton.click();
  console.log('✅ Submitted form');
});

/**
 * Submit form without entering credentials (for validation testing)
 * 
 * @example
 * When I submit the form without entering any data
 */
When('I submit the form without entering any data', async function ({ page }) {
  const submitButton = page.getByRole('button', {
    name: /submit|save|create|update|confirm/i,
  });
  await submitButton.click();
  console.log('✅ Submitted form without data (validation test)');
});

/**
 * Upload file to file input
 * 
 * @example
 * When I upload "document.pdf" to the "Attachment" field
 */
When('I upload {string} to the {string} field', async function (
  { page },
  fileName: string,
  fieldLabel: string
) {
  const fileInput = page.getByLabel(fieldLabel);
  const filePath = `e2e/fixtures/${fileName}`;
  await fileInput.setInputFiles(filePath);
  console.log(`✅ Uploaded "${fileName}" to "${fieldLabel}" field`);
});

/**
 * Select radio button
 * 
 * @example
 * When I select the "Male" radio button
 */
When('I select the {string} radio button', async function ({ page }, radioLabel: string) {
  await page.getByRole('radio', { name: radioLabel }).click();
  console.log(`✅ Selected "${radioLabel}" radio button`);
});

/**
 * Toggle switch on
 * 
 * @example
 * When I turn on the "Dark Mode" switch
 */
When('I turn on the {string} switch', async function ({ page }, switchLabel: string) {
  const switchElement = page.getByRole('switch', { name: switchLabel });
  
  // Check if already on
  const isChecked = await switchElement.isChecked();
  if (!isChecked) {
    await switchElement.click();
  }
  
  console.log(`✅ Turned on "${switchLabel}" switch`);
});

/**
 * Toggle switch off
 * 
 * @example
 * When I turn off the "Notifications" switch
 */
When('I turn off the {string} switch', async function ({ page }, switchLabel: string) {
  const switchElement = page.getByRole('switch', { name: switchLabel });
  
  // Check if already off
  const isChecked = await switchElement.isChecked();
  if (isChecked) {
    await switchElement.click();
  }
  
  console.log(`✅ Turned off "${switchLabel}" switch`);
});

/**
 * Fill multiple fields at once (using data table)
 * 
 * @example
 * When I fill the form with:
 *   | Name     | Product A   |
 *   | Price    | 29.99       |
 *   | Quantity | 100         |
 */
When('I fill the form with:', async function ({ page }, dataTable: any) {
  const data = dataTable.rowsHash();
  
  for (const [label, value] of Object.entries(data)) {
    const field = page.getByLabel(label);
    await field.clear();
    await field.fill(value as string);
    console.log(`✅ Filled "${label}" with: "${value}"`);
  }
});

/**
 * Select option by index (0-based)
 * 
 * @example
 * When I select the 2nd option from the "Category" dropdown
 */
When('I select the {int}nd option from the {string} dropdown', async function (
  { page },
  index: number,
  dropdownLabel: string
) {
  // Adjust for ordinal (1st, 2nd, 3rd) vs 0-based index
  const zeroBasedIndex = index - 1;
  
  await page.getByRole('combobox', { name: dropdownLabel }).click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.getByRole('option').nth(zeroBasedIndex).click();
  
  console.log(`✅ Selected option ${index} from "${dropdownLabel}" dropdown`);
});

/**
 * Press keyboard key in field
 * 
 * @example
 * When I press "Enter" in the "Search" field
 */
When('I press {string} in the {string} field', async function (
  { page },
  key: string,
  fieldLabel: string
) {
  const field = page.getByLabel(fieldLabel);
  await field.press(key);
  console.log(`✅ Pressed "${key}" in "${fieldLabel}" field`);
});

/**
 * Type text slowly (simulates real typing)
 * 
 * @example
 * When I type "search query" in the "Search" field
 */
When('I type {string} in the {string} field', async function (
  { page },
  text: string,
  fieldLabel: string
) {
  const field = page.getByLabel(fieldLabel);
  await field.clear();
  await field.pressSequentially(text, { delay: 100 });
  console.log(`✅ Typed "${text}" in "${fieldLabel}" field`);
});

/**
 * Focus on field
 * 
 * @example
 * When I focus on the "Email" field
 */
When('I focus on the {string} field', async function ({ page }, fieldLabel: string) {
  await page.getByLabel(fieldLabel).focus();
  console.log(`✅ Focused on "${fieldLabel}" field`);
});

/**
 * Blur (unfocus) field
 * 
 * @example
 * When I blur the "Email" field
 */
When('I blur the {string} field', async function ({ page }, fieldLabel: string) {
  await page.getByLabel(fieldLabel).blur();
  console.log(`✅ Blurred "${fieldLabel}" field`);
});
