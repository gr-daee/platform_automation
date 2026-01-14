# Debug Mode and Enhanced Logging Guide

## Overview

The DAEE Platform Automation framework includes comprehensive debug mode capabilities and enhanced logging to improve test observability, debugging, and traceability.

## Features

### 1. Debug Mode

Debug mode captures comprehensive test execution data:
- Screenshots at every step (Given/When/Then)
- Full video recording
- Complete execution trace
- Verbose logging
- Transaction ID extraction

### 2. Enhanced Logging

Structured logging system with:
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Timestamped entries
- Step context tracking
- Optional file logging

### 3. Screenshot Capture

Automatic screenshot capture:
- **At validation steps (Then steps)**: ALWAYS captured (by design - per requirements)
- **At action steps (When steps)**: Only in debug mode
- **At precondition steps (Given steps)**: Only in debug mode
- **On errors**: Always captured
- **Cleanup**: Old screenshots (>24 hours) are automatically cleaned up before test runs
- **With metadata**: Step name, transaction ID, context included in filename

### 4. Transaction ID Extraction

Automatic extraction of:
- Transaction IDs from UI elements
- Order IDs from URLs
- IDs from API responses
- Custom data from selectors

## Usage

### Enabling Debug Mode

**Command Line:**
```bash
DEBUG_MODE=true npm test login
```

**Environment Variable:**
```env
DEBUG_MODE=true
```

### Normal Mode (Default)

```bash
npm test login
# Screenshots only on failure
```

### Debug Mode

```bash
DEBUG_MODE=true npm test login
# Screenshots at every step
# Full video recording
# Complete trace
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Debug Mode Configuration
DEBUG_MODE=false                    # Set to 'true' to capture screenshots at every step
DEBUG_SCREENSHOT_PATH=test-results/debug-screenshots  # Optional: custom screenshot path
DEBUG_LOG_LEVEL=INFO                # DEBUG, INFO, WARN, ERROR
DEBUG_LOG_FILE=                     # Optional: path to log file (e.g., test-results/debug.log)
```

### Log Levels

- **DEBUG**: Detailed debugging info (only in debug mode)
- **INFO**: General information (default)
- **WARN**: Warnings
- **ERROR**: Errors

## Screenshot Naming Convention

Screenshots are named with the following pattern:

```
{testName}_{stepName}_{timestamp}_{context}.png
```

**Examples:**
- `login_successful_login_20260114_200530_before_validation.png`
- `login_successful_login_20260114_200530_after_validation_txn_12345.png`
- `login_successful_login_20260114_200530_on_error.png`

## Transaction ID Extraction

### Automatic Extraction

The framework automatically tries to extract transaction IDs from:

1. **Data Attributes:**
   - `[data-transaction-id]`
   - `[data-order-id]`
   - `[data-txn-id]`

2. **Text Patterns:**
   - "Order #12345"
   - "Transaction ID: abc123"
   - "Txn ID: xyz789"

3. **URL Patterns:**
   - `/orders/12345`
   - `/transactions/abc123`
   - `?id=xyz789`

### Manual Extraction

In step definitions:

```typescript
import { transactionExtractor } from '../support/transaction-extractor';
import { testContext } from '../support/test-context';

Then('I should see order confirmation', async ({ page }) => {
  // Extract transaction ID
  const transactionId = await transactionExtractor.extractTransactionId(page);
  
  if (transactionId) {
    testContext.addTransactionId(transactionId);
    logger.info('Transaction ID extracted', { transactionId });
  }
  
  // ... validation
});
```

### Custom Extraction

```typescript
// Extract from specific selector
const orderId = await transactionExtractor.extractFromSelector(
  page,
  '.order-number',
  'textContent'
);

// Extract from URL
const urlId = await transactionExtractor.extractFromURL(page);

// Extract multiple values
const data = await transactionExtractor.extractMultiple(page, {
  selector: '[data-order-id]',
  textPattern: /Order\s*#?\s*([A-Z0-9-]+)/i,
  urlPattern: /\/orders\/([A-Z0-9-]+)/i,
});
```

## Step Definition Patterns

### Validation Steps (Then)

All validation steps should:
1. Capture screenshot before validation
2. Perform validation
3. Extract transaction IDs if available
4. Capture screenshot after validation

**Example:**
```typescript
Then('I should see a success message', async ({ page }) => {
  const stepName = 'I should see a success message';
  testContext.logStep('Then', stepName);
  
  // Capture screenshot before validation
  await testContext.captureScreenshot(page, stepName, { 
    action: 'before_validation' 
  });
  
  // Perform validation
  await loginPage.waitForSuccessRedirect();
  
  // Extract transaction ID if available
  const transactionId = await transactionExtractor.extractTransactionId(page);
  if (transactionId) {
    testContext.addTransactionId(transactionId);
  }
  
  // Capture screenshot after validation
  await testContext.captureScreenshot(page, stepName, {
    action: 'after_validation',
    transactionId: transactionId || undefined,
  });
  
  logger.info('Success message detected', transactionId ? { transactionId } : undefined);
});
```

### Action Steps (When)

Action steps in debug mode automatically capture screenshots:

```typescript
When('I submit the login form', async ({ page }) => {
  const stepName = 'I submit the login form';
  testContext.logStep('When', stepName);
  
  // Debug mode automatically captures screenshot here
  
  await loginPage.clickSignIn();
  
  // Debug mode automatically captures screenshot here
  
  logger.info('Login form submitted');
});
```

## Test Context API

### Initialization

```typescript
import { testContext } from '../support/test-context';

// Initialize for a new test
testContext.initialize('test-name');
```

### Screenshot Capture

```typescript
await testContext.captureScreenshot(page, 'step-name', {
  action: 'before_validation',
  transactionId: '12345',
});
```

### Transaction IDs

```typescript
// Add transaction ID
testContext.addTransactionId('12345');

// Get all transaction IDs
const ids = testContext.getTransactionIds();

// Add extracted data
testContext.addExtractedData('orderNumber', 'ORD-12345');
```

### Logging

```typescript
import { logger } from '../support/logger';

logger.debug('Debug message', { context: 'data' });
logger.info('Info message', { transactionId: '12345' });
logger.warn('Warning message');
logger.error('Error message', { error: 'details' });
logger.logStep('Then', 'step name', { details: 'data' });
```

## Report Integration

All screenshots and logs are automatically:
- Attached to test reports
- Linked to specific steps
- Grouped chronologically
- Displayed with transaction IDs

View reports:
```bash
npm run test:report
```

## Best Practices

1. **Use Debug Mode Sparingly**: Only enable when debugging specific issues
2. **Extract Transaction IDs**: Always extract and log transaction IDs in validation steps
3. **Capture Before/After**: Capture screenshots before and after validation
4. **Structured Logging**: Use logger instead of console.log for better traceability
5. **Error Context**: Always capture screenshots on errors

## Troubleshooting

### Screenshots Not Capturing

1. Check `DEBUG_MODE` is set correctly
2. Verify screenshot directory exists and is writable
3. Check disk space
4. Review error logs

### Transaction IDs Not Extracting

1. Verify element is visible
2. Check selector patterns match your UI
3. Use custom selector if needed
4. Check browser console for errors

### Logs Not Appearing

1. Check `DEBUG_LOG_LEVEL` setting
2. Verify log file path is writable
3. Check console output (logs always go to console)

## Related Documentation

- [Environment Setup Guide](../setup/ENV_SETUP_GUIDE.md)
- [Framework Overview](../README.md)
- [Implementation Complete](./IMPLEMENTATION_COMPLETE.md)
