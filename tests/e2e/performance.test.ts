import { test, expect } from '@playwright/test';
import {
    setupBrowser,
    teardownBrowser,
    navigateToApp,
    takeScreenshot,
    TestContext
} from './setup';

test.describe('Layered Profile Builder - Performance Tests', () => {
    let context: TestContext;

    test.beforeAll(async () => {
        context = await setupBrowser();
    });

    test.afterAll(async () => {
        await teardownBrowser(context);
    });

    test('page load performance', async () => {
        const { page } = context;

        // Measure page load time
        const startTime = Date.now();
        await navigateToApp(page);
        const loadTime = Date.now() - startTime;

        // Take screenshot of loaded state
        await takeScreenshot(page, 'performance-loaded');

        console.log(`Page load time: ${loadTime}ms`);

        // Verify reasonable load time (adjust threshold as needed)
        expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('profile compilation performance', async () => {
        const { page } = context;

        await navigateToApp(page);

        // Load demo cards and measure compilation time
        const loadDemoButton = page.locator('[data-testid="load-demo-cards"]');
        if (await loadDemoButton.isVisible()) {
            const startTime = Date.now();
            await loadDemoButton.click();

            // Wait for compilation to complete
            await page.waitForSelector('[data-testid^="available-card-"]', { timeout: 10000 });
            const compilationTime = Date.now() - startTime;

            console.log(`Profile compilation time: ${compilationTime}ms`);
            expect(compilationTime).toBeLessThan(2000); // 2 seconds
        }
    });

    test('drag and drop performance', async () => {
        const { page } = context;

        await navigateToApp(page);

        // Load some cards first
        const loadDemoButton = page.locator('[data-testid="load-demo-cards"]');
        if (await loadDemoButton.isVisible()) {
            await loadDemoButton.click();
            await page.waitForSelector('[data-testid^="available-card-"]');
        }

        // Add cards to profile
        const availableCards = page.locator('[data-testid^="available-card-"]');
        const cardCount = await availableCards.count();
        if (cardCount >= 2) {
            // Add two cards
            await availableCards.nth(0).click();
            await availableCards.nth(1).click();

            // Measure drag and drop performance
            const profileLayers = page.locator('[data-testid^="profile-layer-"]');
            const layerCount = await profileLayers.count();
            if (layerCount >= 2) {
                const firstLayer = profileLayers.nth(0);
                const secondLayer = profileLayers.nth(1);

                const startTime = Date.now();

                // Perform drag and drop
                await firstLayer.dragTo(secondLayer);

                const dragTime = Date.now() - startTime;
                console.log(`Drag and drop time: ${dragTime}ms`);
                expect(dragTime).toBeLessThan(1000); // 1 second
            }
        }
    });

    test('large profile handling', async () => {
        const { page } = context;

        await navigateToApp(page);

        // Load demo cards
        const loadDemoButton = page.locator('[data-testid="load-demo-cards"]');
        if (await loadDemoButton.isVisible()) {
            await loadDemoButton.click();
            await page.waitForSelector('[data-testid^="available-card-"]');
        }

        // Add many cards to test performance with large profiles
        const availableCards = page.locator('[data-testid^="available-card-"]');
        const cardCount = await availableCards.count();
        const maxCards = Math.min(cardCount, 10); // Test with up to 10 cards

        const startTime = Date.now();

        for (let i = 0; i < maxCards; i++) {
            await availableCards.nth(i).click();
            // Small delay to allow UI to update
            await page.waitForTimeout(100);
        }

        const addTime = Date.now() - startTime;
        console.log(`Time to add ${maxCards} cards: ${addTime}ms`);

        // Verify all cards were added
        const profileLayers = page.locator('[data-testid^="profile-layer-"]');
        const layerCount = await profileLayers.count();
        expect(layerCount).toBe(maxCards);

        // Performance should still be reasonable
        expect(addTime).toBeLessThan(5000); // 5 seconds for multiple cards

        await takeScreenshot(page, 'performance-large-profile');
    });

    test('memory usage monitoring', async () => {
        const { page } = context;

        await navigateToApp(page);

        // Get initial memory metrics using CDP
        const client = await page.context().newCDPSession(page);
        await client.send('Performance.enable');

        const initialMetrics = await client.send('Performance.getMetrics');
        const initialHeapUsed = initialMetrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;
        const initialHeapTotal = initialMetrics.metrics.find(m => m.name === 'JSHeapTotalSize')?.value || 0;

        console.log('Initial memory usage:', {
            JSHeapUsedSize: `${(initialHeapUsed / 1024 / 1024).toFixed(2)}MB`,
            JSHeapTotalSize: `${(initialHeapTotal / 1024 / 1024).toFixed(2)}MB`
        });

        // Perform operations that might increase memory usage
        const loadDemoButton = page.locator('[data-testid="load-demo-cards"]');
        if (await loadDemoButton.isVisible()) {
            await loadDemoButton.click();
            await page.waitForSelector('[data-testid^="available-card-"]');
        }

        // Add several cards
        const availableCards = page.locator('[data-testid^="available-card-"]');
        const cardCount = await availableCards.count();
        const cardsToAdd = Math.min(cardCount, 5);

        for (let i = 0; i < cardsToAdd; i++) {
            await availableCards.nth(i).click();
        }

        // Get final memory metrics
        const finalMetrics = await client.send('Performance.getMetrics');
        const finalHeapUsed = finalMetrics.metrics.find(m => m.name === 'JSHeapUsedSize')?.value || 0;
        const finalHeapTotal = finalMetrics.metrics.find(m => m.name === 'JSHeapTotalSize')?.value || 0;

        console.log('Final memory usage:', {
            JSHeapUsedSize: `${(finalHeapUsed / 1024 / 1024).toFixed(2)}MB`,
            JSHeapTotalSize: `${(finalHeapTotal / 1024 / 1024).toFixed(2)}MB`
        });

        // Memory usage should be reasonable (less than 100MB for this simple app)
        expect(finalHeapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB

        await client.detach();
    });
}); 