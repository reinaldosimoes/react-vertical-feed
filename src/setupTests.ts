import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});
