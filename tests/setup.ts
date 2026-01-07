/**
 * Test Setup for React Component Testing
 * Configures testing environment with jsdom and React Testing Library
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Mock localStorage for tests
const localStorageMock: Storage = {
  length: 0,
  clear: vi.fn(() => {
    localStorageMock.length = 0;
    for (const key of Object.keys(localStorageMock)) {
      if (!['length', 'clear', 'getItem', 'setItem', 'removeItem', 'key'].includes(key)) {
        delete (localStorageMock as Record<string, unknown>)[key];
      }
    }
  }),
  getItem: vi.fn((key: string) => {
    return (localStorageMock as Record<string, unknown>)[key] as string | null ?? null;
  }),
  setItem: vi.fn((key: string, value: string) => {
    (localStorageMock as Record<string, unknown>)[key] = value;
    localStorageMock.length = Object.keys(localStorageMock).filter(
      k => !['length', 'clear', 'getItem', 'setItem', 'removeItem', 'key'].includes(k)
    ).length;
  }),
  removeItem: vi.fn((key: string) => {
    delete (localStorageMock as Record<string, unknown>)[key];
    localStorageMock.length = Object.keys(localStorageMock).filter(
      k => !['length', 'clear', 'getItem', 'setItem', 'removeItem', 'key'].includes(k)
    ).length;
  }),
  key: vi.fn((index: number) => {
    const keys = Object.keys(localStorageMock).filter(
      k => !['length', 'clear', 'getItem', 'setItem', 'removeItem', 'key'].includes(k)
    );
    return keys[index] ?? null;
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
