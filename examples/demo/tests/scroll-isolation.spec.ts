import { expect, test, type Page } from '@playwright/test';

const positionPointerInsideFeed = async (page: Page) => {
  const bounds = await page.getByRole('feed').boundingBox();
  if (!bounds) throw new Error('The feed is not visible');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
};

test.beforeEach(async ({ page }) => {
  await page.goto('scroll-test.html');
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(page.getByRole('feed')).toBeVisible();
});

test('contains wheel scrolling at both feed boundaries until the consumer opts out', async ({
  page,
}) => {
  const feed = page.getByRole('feed');
  const initialPageY = await page.evaluate(() => window.scrollY);
  await positionPointerInsideFeed(page);

  await page.mouse.wheel(0, 240);
  await expect.poll(() => feed.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(initialPageY);

  await feed.evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await page.mouse.wheel(0, 320);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.scrollY)).toBe(initialPageY);

  await page.goto('scroll-test.html?chain=auto');
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect
    .poll(() => feed.evaluate(element => getComputedStyle(element).overscrollBehaviorY))
    .toBe('auto');
  await feed.evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await positionPointerInsideFeed(page);
  await page.mouse.wheel(0, 640);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialPageY);
});

test('keeps imperative and keyboard navigation inside the feed', async ({ page }) => {
  const feed = page.getByRole('feed');
  const initialPageY = await page.evaluate(() => window.scrollY);

  await page.getByRole('button', { name: 'Scroll to last item' }).click();
  await expect.poll(() => feed.evaluate(element => element.scrollTop)).toBeGreaterThan(500);
  expect(await page.evaluate(() => window.scrollY)).toBe(initialPageY);

  await feed.evaluate(element => {
    element.scrollTop = 0;
  });
  await feed.focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => feed.evaluate(element => element.scrollTop)).toBeGreaterThan(250);
  expect(await page.evaluate(() => window.scrollY)).toBe(initialPageY);
});
