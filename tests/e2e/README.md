# End-to-End Tests with Playwright

This directory contains E2E tests for the Layered Profile Builder using Playwright to automate browser interactions and verify the complete user workflow.

## Test Files

- `setup.ts` - Test utilities, browser setup/teardown, and helper functions
- `user-workflow.test.ts` - Complete user workflow tests (load profile, add cards, export)
- `performance.test.ts` - Performance benchmarks and memory usage monitoring

## Running Tests

### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install chromium
   ```

### Run E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with visible browser (development mode)
npm run test:e2e:dev

# Run tests with Playwright UI
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/user-workflow.test.ts
```

## Test Coverage

### User Workflow Tests (`user-workflow.test.ts`)
- ✅ Complete profile building workflow
  - Load base profile selection
  - Add demo cards to available cards
  - Add cards to profile layers
  - Drag and drop reordering
  - Profile summary/preview
  - INI export functionality
  - Undo/redo operations

- ✅ Card library management
  - Open card library interface
  - Search functionality
  - Category filtering
  - Browse and select cards

- ✅ Custom card creation
  - Open card builder
  - Fill in card details
  - Use setting picker
  - Save custom cards

### Performance Tests (`performance.test.ts`)
- ✅ Page load time measurement
- ✅ Profile compilation performance
- ✅ Drag and drop operation timing
- ✅ Large profile handling (multiple cards)
- ✅ Memory usage monitoring

## Test Artifacts

Playwright automatically captures test artifacts:
- `/test-results/` - Test execution results and traces
- `/playwright-report/` - HTML test reports
- Screenshots and videos on failure
- Network logs and browser traces

## Configuration

### Environment Variables

- `BASE_URL` - Application URL (default: `http://localhost:5173`)
- `CI` - Run in headless mode when set to `true`

### Browser Settings

- **Development**: Browser window opens, traces enabled, videos on failure
- **CI/Production**: Headless mode, faster execution, screenshots on failure

## Debugging Tests

### View Test Execution
```bash
# Run with visible browser
npm run test:e2e:dev

# Open Playwright UI for interactive debugging
npm run test:e2e:ui
```

### Debug Failed Tests
1. Check HTML report: `npx playwright show-report`
2. Review traces and screenshots in test results
3. Use browser devtools with headed mode
4. Run specific test files to isolate issues

### Common Issues

1. **Element not found**: Check that `data-testid` attributes exist in components
2. **Timing issues**: Playwright has auto-waiting, but complex interactions may need explicit waits
3. **Performance failures**: Check threshold values in performance tests
4. **Port conflicts**: Ensure dev server is running on port 5173

## Adding New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { setupBrowser, teardownBrowser, navigateToApp, TestContext } from './setup';

test.describe('Feature Name', () => {
  let context: TestContext;

  test.beforeAll(async () => {
    context = await setupBrowser();
  });

  test.afterAll(async () => {
    await teardownBrowser(context);
  });

  test('test case description', async () => {
    const { page } = context;
    await navigateToApp(page);
    
    // Test implementation
    await page.waitForSelector('[data-testid="element"]');
    await page.click('[data-testid="button"]');
    
    // Assertions
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Helper Functions

Use helper functions from `setup.ts`:
- `setupBrowser()` - Initialize browser and page
- `teardownBrowser()` - Clean up browser instance
- `navigateToApp()` - Navigate to application with waiting
- `takeScreenshot()` - Capture screenshot with naming
- `waitForElementWithText()` - Wait for specific text content

### Data Test IDs

Add `data-testid` attributes to components for reliable element selection:
```jsx
<button data-testid="export-ini">Export INI</button>
<div data-testid="profile-layer-{id}">Layer content</div>
<input data-testid="card-name-input" />
```

## Performance Benchmarks

Current performance targets:
- Page load: < 5 seconds
- Profile compilation: < 2 seconds  
- Drag and drop: < 1 second
- Multiple card addition: < 5 seconds
- Memory usage: < 100MB

## CI Integration

Tests are designed to run in CI environments:
- Headless browser execution
- Retry on failure (2 retries in CI)
- Artifact capture (screenshots, videos, traces)
- GitHub Actions reporter integration

Add to GitHub Actions or similar CI:
```yaml
- name: Run E2E Tests
  run: |
    npm run build
    npm run preview &
    sleep 5
    BASE_URL=http://localhost:4173 CI=true npm run test:e2e
    
- name: Upload Playwright Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

## Playwright Features

### Auto-waiting
Playwright automatically waits for elements to be actionable, reducing flaky tests.

### Multiple Browsers
Easily test across Chromium, Firefox, and WebKit by updating `playwright.config.ts`.

### Debugging Tools
- Time-travel debugging with traces
- Step-through debugging in UI mode
- Network request inspection
- Console log capture

### Mobile Testing
Add mobile device testing by including mobile configurations in the config file.

### API Testing
Playwright can also test APIs alongside E2E flows for comprehensive testing. 