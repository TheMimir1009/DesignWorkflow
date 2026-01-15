import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()] as any,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        'vitest.setup.ts',
        'src/types/**',
      ],
      all: true,
      lines: 85,
      functions: 85,
      branches: 85,
      statements: 85,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
