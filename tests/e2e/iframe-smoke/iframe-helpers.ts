/**
 * iframe-helpers.ts — reusable helpers for iframe smoke tests.
 *
 * Centralizes iframe ready-detection, console error capture, compute-result
 * waiting, timeout warning assertion, and screenshot capture. Used by
 * compute.spec.ts (4 compute experiments) and migration.spec.ts (4 migration
 * samples).
 */
import { Page, Locator, expect } from '@playwright/test';

/**
 * Wait for iframe to be loaded and its document body rendered.
 * Returns the iframe element handle.
 */
export async function waitForIframeReady(
  page: Page,
  selector: string = 'iframe',
  timeout: number = 10_000,
): Promise<Locator> {
  const frame = page.locator(selector);
  await frame.waitFor({ state: 'visible', timeout });
  // Wait for iframe's inner document to be ready
  const handle = await frame.elementHandle();
  if (!handle) throw new Error(`Iframe ${selector} not found`);
  await page.waitForFunction(
    (el: Element) => {
      const iframe = el as HTMLIFrameElement;
      return !!(iframe.contentDocument && iframe.contentDocument.body);
    },
    handle,
    { timeout },
  );
  return frame;
}

/**
 * Capture any console error messages that occur on the page (including
 * those from inside the iframe). Returns a function to retrieve them.
 */
export function captureConsoleErrors(page: Page): () => string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return () => errors.slice();
}

/**
 * Assert that the page does NOT display the known compute-timeout warning.
 * Looks for the literal text across both the host page and iframe content.
 */
export async function assertNoTimeoutWarning(page: Page): Promise<void> {
  const warningText = 'timeout waiting for host response';
  const hostMatches = await page.getByText(warningText, { exact: false }).count();
  expect(hostMatches, `host should not show "${warningText}"`).toBe(0);

  // Also check inside iframes
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    const count = await frame.getByText(warningText, { exact: false }).count();
    expect(count, `iframe ${frame.url()} should not show "${warningText}"`).toBe(0);
  }
}

/**
 * Assert that the iframe's canvas has non-empty pixels — i.e. something
 * actually got drawn. This catches "iframe loaded but compute never returned"
 * failures where render() was never invoked.
 */
export async function assertCanvasNonEmpty(
  page: Page,
  iframeSelector: string = 'iframe',
  canvasSelector: string = 'canvas',
): Promise<void> {
  const iframe = page.frameLocator(iframeSelector);
  const canvas = iframe.locator(canvasSelector).first();
  await canvas.waitFor({ state: 'visible', timeout: 10_000 });

  // Evaluate inside iframe: sample pixels; if every pixel is (0,0,0,0) or all
  // one uniform color, treat as blank.
  const isNonEmpty = await canvas.evaluate((el: Element) => {
    const cv = el as HTMLCanvasElement;
    const ctx = cv.getContext('2d');
    if (!ctx) return false;
    const w = Math.min(cv.width, 100);
    const h = Math.min(cv.height, 100);
    const data = ctx.getImageData(0, 0, w, h).data;
    let nonTransparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) nonTransparent++;
    }
    // Require at least 50 non-transparent pixels in the sampled area
    return nonTransparent > 50;
  });
  expect(isNonEmpty, 'canvas should have rendered pixels').toBe(true);
}

/**
 * Take a screenshot of the iframe element (not the full page) for visual
 * baseline capture. Saves under `tests/e2e/iframe-smoke/__screenshots__/`.
 */
export async function takeIframeScreenshot(
  page: Page,
  name: string,
  iframeSelector: string = 'iframe',
): Promise<void> {
  const frame = page.locator(iframeSelector);
  await frame.screenshot({
    path: `tests/e2e/iframe-smoke/__screenshots__/${name}.png`,
  });
}

/**
 * High-level smoke: navigate, wait for iframe ready, assert no timeout,
 * assert canvas non-empty, capture screenshot.
 * This is the canonical "happy path" for an iframe experiment.
 */
export async function iframeSmokeCheck(
  page: Page,
  opts: {
    path: string;
    name: string;
    iframeSelector?: string;
    canvasSelector?: string;
  },
): Promise<string[]> {
  const getErrors = captureConsoleErrors(page);
  await page.goto(opts.path, { waitUntil: 'domcontentloaded' });
  await waitForIframeReady(page, opts.iframeSelector ?? 'iframe');
  // Give iframe a moment to run its initial compute + render
  await page.waitForTimeout(2_000);
  await assertNoTimeoutWarning(page);
  await assertCanvasNonEmpty(page, opts.iframeSelector ?? 'iframe', opts.canvasSelector ?? 'canvas');
  await takeIframeScreenshot(page, opts.name, opts.iframeSelector ?? 'iframe');
  return getErrors();
}
