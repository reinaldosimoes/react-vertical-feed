import { expect, test } from '@playwright/test';

test('does not show a Play state during automatic playback handoff', async ({ page }) => {
  await page.goto('./');
  const feed = page.getByRole('feed');
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();
  await page.waitForFunction(() => {
    const firstVideo = document.querySelector('video');
    return firstVideo && !firstVideo.paused;
  });

  await page.evaluate(() => {
    const handoffStates: string[] = [];
    const captureState = () => {
      if (document.querySelector('.pause-indicator.visible')) handoffStates.push('indicator');
      if (document.querySelector('[aria-label="Play video"]')) handoffStates.push('control');
    };
    const observer = new MutationObserver(captureState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'aria-label'],
      subtree: true,
    });
    Object.assign(window, { __handoffStates: handoffStates, __handoffObserver: observer });
  });

  const bounds = await feed.boundingBox();
  if (!bounds) throw new Error('The feed is not visible');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(0, bounds.height);
  await expect.poll(() => feed.evaluate(element => element.scrollTop)).toBeGreaterThan(500);
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    const state = window as typeof window & {
      __handoffStates: string[];
      __handoffObserver: MutationObserver;
    };
    state.__handoffObserver.disconnect();
    return {
      handoffStates: state.__handoffStates,
      playingIndexes: [...document.querySelectorAll('video')]
        .map((video, index) => ({ index, paused: video.paused }))
        .filter(video => !video.paused)
        .map(video => video.index),
    };
  });

  expect(result.handoffStates).toEqual([]);
  expect(result.playingIndexes).toEqual([1]);
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();
  await expect(page.locator('.pause-indicator')).not.toHaveClass(/visible/);
});

test('keeps the playback control synchronized with feed and item Space shortcuts', async ({
  page,
}) => {
  await page.goto('./');
  const feed = page.getByRole('feed');
  const firstVideo = page.locator('video').first();
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(false);

  await feed.focus();
  await feed.press('Space');
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Play video' })).toBeVisible();

  await feed.press('Space');
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(false);
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();

  const firstItem = page.getByRole('article').first();
  await firstItem.focus();
  await firstItem.press('Space');
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Play video' })).toBeVisible();

  await firstItem.press('Space');
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(false);
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();
});

test('shows the Play state when Space-triggered playback is rejected', async ({ page }) => {
  await page.goto('./');
  const feed = page.getByRole('feed');
  const firstVideo = page.locator('video').first();
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(false);

  await firstVideo.evaluate(video => {
    video.pause();
    Object.defineProperty(video, 'play', {
      configurable: true,
      value: () => Promise.reject(new Error('Playback blocked by test')),
    });
  });
  await feed.focus();
  await feed.press('Space');

  await expect(page.getByRole('button', { name: 'Play video' })).toBeVisible();
  await expect(page.locator('.pause-indicator')).toHaveClass(/visible/);
  await expect.poll(() => firstVideo.evaluate(video => video.paused)).toBe(true);
});
