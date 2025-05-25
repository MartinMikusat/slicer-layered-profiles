import { test as base, expect, Browser, Page } from '@playwright/test';

export interface TestContext {
    browser: Browser;
    page: Page;
}

export async function setupBrowser(): Promise<TestContext> {
    const { chromium } = await import('@playwright/test');

    const browser = await chromium.launch({
        headless: process.env.CI ? true : false, // Show browser in development
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
        ],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    return { browser, page };
}

export async function teardownBrowser(context: TestContext): Promise<void> {
    await context.browser.close();
}

export async function navigateToApp(page: Page): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(baseUrl);

    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
}

export async function waitForElementWithText(
    page: Page,
    selector: string,
    text: string,
    timeout: number = 5000
): Promise<void> {
    await page.waitForFunction(
        ({ selector: sel, text: txt }) => {
            const element = document.querySelector(sel);
            return element && element.textContent?.includes(txt);
        },
        { selector, text },
        { timeout }
    );
}

export async function takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({
        path: `tests/e2e/screenshots/${name}.png`,
        fullPage: true,
    });
}

// Re-export test utilities from Playwright
export { expect } from '@playwright/test'; 