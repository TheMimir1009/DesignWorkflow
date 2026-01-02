/**
 * Test Setup for React Component Testing
 * Configures testing environment with jsdom and React Testing Library
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
