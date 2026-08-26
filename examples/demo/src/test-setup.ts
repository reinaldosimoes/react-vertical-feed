import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

let reducedMotion = false;
const pausedStates = new WeakMap<HTMLMediaElement, boolean>();

export const setReducedMotion = (value: boolean): void => {
  reducedMotion = value;
};

export const setMediaPaused = (media: HTMLMediaElement, paused: boolean): void => {
  pausedStates.set(media, paused);
};

beforeEach(() => {
  reducedMotion = false;
  if (typeof window === 'undefined') return;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    disconnect = vi.fn();
    observe = vi.fn();
    takeRecords = vi.fn(() => []);
    unobserve = vi.fn();
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  Element.prototype.scrollTo = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get() {
      return pausedStates.get(this) ?? true;
    },
  });
  HTMLMediaElement.prototype.play = vi.fn(function (this: HTMLMediaElement) {
    pausedStates.set(this, false);
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  HTMLMediaElement.prototype.pause = vi.fn(function (this: HTMLMediaElement) {
    pausedStates.set(this, true);
    this.dispatchEvent(new Event('pause'));
  });
});

afterEach(() => {
  if (typeof document !== 'undefined') cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
