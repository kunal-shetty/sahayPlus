import { Locator, Page, expect } from '@playwright/test';

/**
 * @file human-actions.ts
 * @description Real-world human interaction simulator for Playwright exploratory testing.
 * Implements mouse movement, natural hesitation pauses, realistic typing cadence,
 * scrolling, visual layout overflow auditing, and console error monitoring.
 */

export interface HumanActionOptions {
  pauseMs?: number;
  hoverDelayMs?: number;
}

/**
 * Simulates a real human clicking an element:
 * 1. Scrolls the element into view.
 * 2. Moves the mouse to hover over it.
 * 3. Pauses briefly (eye-to-hand coordination).
 * 4. Executes the click.
 */
export async function humanClick(
  locator: Locator,
  options: HumanActionOptions = {}
): Promise<void> {
  const pause = options.pauseMs ?? 300;
  const hoverDelay = options.hoverDelayMs ?? 250;

  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
  await locator.page().waitForTimeout(hoverDelay);
  await locator.click();
  await locator.page().waitForTimeout(pause);
}

/**
 * Simulates real human typing with realistic keystroke delay
 * and optional typo-correction simulation.
 */
export async function humanType(
  locator: Locator,
  text: string,
  options: { delayMs?: number; makeTypo?: boolean } = {}
): Promise<void> {
  const delay = options.delayMs ?? 75;

  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
  await locator.click();

  // Clear existing content cleanly
  await locator.fill('');

  if (options.makeTypo && text.length > 3) {
    // Type first 2 chars, type a wrong char, backspace, then complete
    const firstTwo = text.slice(0, 2);
    const rest = text.slice(2);
    await locator.pressSequentially(firstTwo, { delay });
    await locator.pressSequentially('x', { delay: delay + 50 });
    await locator.page().waitForTimeout(180);
    await locator.press('Backspace');
    await locator.page().waitForTimeout(120);
    await locator.pressSequentially(rest, { delay });
  } else {
    await locator.pressSequentially(text, { delay });
  }

  await locator.page().waitForTimeout(200);
}

/**
 * Simulates double-tapping an element in quick succession
 * (common with elderly users or finger tremors).
 */
export async function humanDoubleTap(locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ delay: 50 });
  await locator.click({ delay: 50 });
}

/**
 * Smoothly scrolls the page up or down incrementally like a human wheel/touchpad.
 */
export async function humanScroll(
  page: Page,
  distanceY: number,
  steps = 5
): Promise<void> {
  const delta = distanceY / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(60);
  }
}

/**
 * Audits the rendered page for horizontal overflow issues,
 * clipped elements, and broken layout boundaries.
 */
export async function auditVisualLayout(page: Page): Promise<{
  hasHorizontalOverflow: boolean;
  scrollWidth: number;
  innerWidth: number;
  viewportWidth: number;
}> {
  return await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;
    const clientWidth = document.documentElement.clientWidth;

    // A tolerance of 2px for browser sub-pixel anti-aliasing
    const hasHorizontalOverflow = scrollWidth > innerWidth + 2;

    return {
      hasHorizontalOverflow,
      scrollWidth,
      innerWidth,
      viewportWidth: clientWidth,
    };
  });
}

/**
 * Sets up listeners to record all console errors and uncaught browser exceptions.
 */
export function monitorBrowserErrors(page: Page): {
  errors: string[];
  warnings: string[];
  stop: () => void;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const consoleHandler = (msg: any) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      // Filter out non-fatal or expected mock noises (e.g. favicon or external analytics)
      if (!text.includes('favicon') && !text.includes('chrome-extension')) {
        errors.push(`[Console Error] ${text}`);
      }
    } else if (type === 'warning') {
      warnings.push(`[Console Warn] ${text}`);
    }
  };

  const pageErrorHandler = (err: Error) => {
    errors.push(`[Uncaught Page Error] ${err.message}`);
  };

  page.on('console', consoleHandler);
  page.on('pageerror', pageErrorHandler);

  return {
    errors,
    warnings,
    stop: () => {
      page.off('console', consoleHandler);
      page.off('pageerror', pageErrorHandler);
    },
  };
}

