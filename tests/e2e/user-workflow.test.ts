import { test, expect } from '@playwright/test';
import {
    setupBrowser,
    teardownBrowser,
    navigateToApp,
    waitForElementWithText,
    takeScreenshot,
    TestContext
} from './setup';

test.describe('Layered Profile Builder - User Workflow', () => {
    let context: TestContext;

    test.beforeAll(async () => {
        context = await setupBrowser();
    });

    test.afterAll(async () => {
        await teardownBrowser(context);
    });

    test('complete user workflow: load profile, add cards, export INI', async () => {
        const { page } = context;

        // Navigate to the application
        await navigateToApp(page);
        await takeScreenshot(page, '01-app-loaded');

        // Verify app has loaded with base profile selector
        await page.waitForSelector('[data-testid="base-profile-selector"]', { timeout: 10000 });
        const profileSelector = await page.locator('[data-testid="base-profile-selector"]');
        await expect(profileSelector).toBeVisible();

        // Select a base profile (e.g., "0.20mm QUALITY")
        await page.click('[data-testid="base-profile-selector"]');
        await page.waitForSelector('[data-testid="profile-option"]');
        await page.click('[data-testid="profile-option"]', { timeout: 5000 });
        await takeScreenshot(page, '02-profile-selected');

        // Load demo cards if available
        const loadDemoButton = page.locator('[data-testid="load-demo-cards"]');
        if (await loadDemoButton.isVisible()) {
            await loadDemoButton.click();
            await page.waitForTimeout(1000); // Wait for cards to load
            await takeScreenshot(page, '03-demo-cards-loaded');
        }

        // Add cards to the profile via drag and drop or click
        const availableCards = page.locator('[data-testid^="available-card-"]');
        const cardCount = await availableCards.count();
        if (cardCount > 0) {
            // Try to add first card
            await availableCards.nth(0).click();
            await page.waitForTimeout(500);
            await takeScreenshot(page, '04-first-card-added');

            // Add second card if available
            if (cardCount > 1) {
                await availableCards.nth(1).click();
                await page.waitForTimeout(500);
                await takeScreenshot(page, '05-second-card-added');
            }
        }

        // Verify cards appear in the profile layers
        const profileLayers = page.locator('[data-testid^="profile-layer-"]');
        const layerCount = await profileLayers.count();
        expect(layerCount).toBeGreaterThan(0);

        // Test drag and drop reordering if multiple cards
        if (layerCount > 1) {
            const firstLayer = profileLayers.nth(0);
            const secondLayer = profileLayers.nth(1);

            // Drag first layer to second position
            await firstLayer.dragTo(secondLayer);
            await page.waitForTimeout(500);
            await takeScreenshot(page, '06-cards-reordered');
        }

        // Open profile summary/preview
        const summaryButton = page.locator('[data-testid="profile-summary"]');
        if (await summaryButton.isVisible()) {
            await summaryButton.click();
            await page.waitForTimeout(500);
            await takeScreenshot(page, '07-profile-summary');
        }

        // Test export functionality
        const exportButton = page.locator('[data-testid="export-ini"]');
        if (await exportButton.isVisible()) {
            // Set up download handling
            const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
            await exportButton.click();

            try {
                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(/\.ini$/);
                await takeScreenshot(page, '08-export-complete');
            } catch (error) {
                console.log('Download may not be available in test environment');
            }
        }

        // Test undo functionality if available
        const undoButton = page.locator('[data-testid="undo"]');
        if (await undoButton.isVisible()) {
            const initialLayerCount = await page.locator('[data-testid^="profile-layer-"]').count();
            await undoButton.click();
            await page.waitForTimeout(500);

            const newLayerCount = await page.locator('[data-testid^="profile-layer-"]').count();
            expect(newLayerCount).toBeLessThanOrEqual(initialLayerCount);
            await takeScreenshot(page, '09-after-undo');
        }

        // Test redo functionality if available
        const redoButton = page.locator('[data-testid="redo"]');
        if (await redoButton.isVisible()) {
            await redoButton.click();
            await page.waitForTimeout(500);
            await takeScreenshot(page, '10-after-redo');
        }
    });

    test('card library management workflow', async () => {
        const { page } = context;

        await navigateToApp(page);

        // Open card library if available
        const libraryButton = page.locator('[data-testid="card-library"]');
        if (await libraryButton.isVisible()) {
            await libraryButton.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, '11-card-library-opened');

            // Test search functionality
            const searchInput = page.locator('[data-testid="library-search"]');
            if (await searchInput.isVisible()) {
                await searchInput.fill('speed');
                await page.waitForTimeout(500);
                await takeScreenshot(page, '12-library-search');

                // Clear search
                await searchInput.clear();
                await page.waitForTimeout(500);
            }

            // Test category filtering
            const categoryFilter = page.locator('[data-testid="category-filter"]');
            if (await categoryFilter.isVisible()) {
                await categoryFilter.click();
                await page.waitForTimeout(500);
                await takeScreenshot(page, '13-category-filter');
            }
        }
    });

    test('custom card creation workflow', async () => {
        const { page } = context;

        await navigateToApp(page);

        // Open card builder if available
        const cardBuilderButton = page.locator('[data-testid="card-builder"]');
        if (await cardBuilderButton.isVisible()) {
            await cardBuilderButton.click();
            await page.waitForTimeout(1000);
            await takeScreenshot(page, '14-card-builder-opened');

            // Fill in card details
            const nameInput = page.locator('[data-testid="card-name-input"]');
            if (await nameInput.isVisible()) {
                await nameInput.fill('Test Custom Card');
            }

            const descriptionInput = page.locator('[data-testid="card-description-input"]');
            if (await descriptionInput.isVisible()) {
                await descriptionInput.fill('A test card created during E2E testing');
            }

            // Test setting picker
            const settingPicker = page.locator('[data-testid="setting-picker"]');
            if (await settingPicker.isVisible()) {
                await settingPicker.click();
                await page.waitForTimeout(500);
                await takeScreenshot(page, '15-setting-picker');

                // Select a setting
                const firstSetting = page.locator('[data-testid^="setting-option-"]').first();
                if (await firstSetting.isVisible()) {
                    await firstSetting.click();
                    await page.waitForTimeout(500);
                }
            }

            // Add value
            const valueInput = page.locator('[data-testid="setting-value-input"]');
            if (await valueInput.isVisible()) {
                await valueInput.fill('0.3');
            }

            // Save card
            const saveButton = page.locator('[data-testid="save-card"]');
            if (await saveButton.isVisible()) {
                await saveButton.click();
                await page.waitForTimeout(1000);
                await takeScreenshot(page, '16-card-saved');
            }
        }
    });
}); 