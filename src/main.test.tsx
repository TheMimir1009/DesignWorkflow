/**
 * React 진입점 테스트
 * main.tsx 컴포넌트 렌더링 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { StrictMode } from 'react';
import App from './App';
import { render as mainRender } from './main';

describe('React Entry Point (main.tsx)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // DOM 환경 설정
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    cleanup();
    container.remove();
    vi.clearAllMocks();
  });

  describe('Entry Point Behavior', () => {
    it('should have a root element in the DOM', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();
      expect(rootElement?.id).toBe('root');
    });

    it('should be able to render into root element', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        expect(rootElement.innerHTML).not.toBe('');
      }
    });
  });

  describe('React Component Rendering', () => {
    it('should render App component within StrictMode', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        expect(rootElement.innerHTML).toContain('Design Workflow');
        expect(rootElement.innerHTML).toContain('AI-powered game design document management');
      }
    });

    it('should render App component with correct structure', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        // Check for main structural elements
        expect(rootElement.innerHTML).toContain('min-h-screen');
        expect(rootElement.innerHTML).toContain('bg-gray-50');
        expect(rootElement.querySelector('header')).not.toBeNull();
        expect(rootElement.querySelector('main')).not.toBeNull();
      }
    });

    it('should render header with title and subtitle', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        const header = rootElement.querySelector('header');
        expect(header?.textContent).toContain('Design Workflow');
        expect(header?.textContent).toContain('AI-powered game design document management');
      }
    });

    it('should render main content area', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        const main = rootElement.querySelector('main');
        expect(main).not.toBeNull();
        expect(main?.textContent).toContain('Welcome to Design Workflow');
      }
    });

    it('should render feature checklist', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        expect(rootElement.innerHTML).toContain('React 19');
        expect(rootElement.innerHTML).toContain('Express 5.0');
        expect(rootElement.innerHTML).toContain('Zustand 5.0');
      }
    });
  });

  describe('StrictMode Integration', () => {
    it('should render within StrictMode wrapper', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        // Verify App component rendered successfully
        expect(rootElement.innerHTML).not.toBe('');
        expect(rootElement.innerHTML).toContain('Design Workflow');
      }
    });

    it('should not throw errors when rendering with StrictMode', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        expect(() => {
          render(
            <StrictMode>
              <App />
            </StrictMode>,
            { container: rootElement }
          );
        }).not.toThrow();
      }
    });
  });

  describe('Component Stability', () => {
    it('should render without crashing', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        const { getByText } = render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        expect(getByText('Design Workflow')).toBeInTheDocument();
      }
    });

    it('should handle multiple render cycles', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        // First render
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        const firstHTML = rootElement.innerHTML;

        // Second render
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        const secondHTML = rootElement.innerHTML;

        // Both renders should produce the same output
        expect(firstHTML).toBe(secondHTML);
        expect(rootElement.innerHTML).toContain('Design Workflow');
      }
    });

    it('should cleanup properly', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        const { unmount } = render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        expect(rootElement.innerHTML).not.toBe('');

        unmount();

        // After unmount, cleanup should have been called
        expect(rootElement.innerHTML).toBe('');
      }
    });
  });

  describe('Browser Environment Setup', () => {
    it('should work with standard DOM API', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        // Verify standard DOM methods work
        expect(typeof rootElement.querySelector).toBe('function');
        expect(typeof rootElement.querySelectorAll).toBe('function');
        expect(typeof rootElement.innerHTML).toBe('string');
      }
    });

    it('should not interfere with other DOM elements', () => {
      // Create another element
      const otherElement = document.createElement('div');
      otherElement.id = 'other';
      otherElement.textContent = 'Other content';
      document.body.appendChild(otherElement);

      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        // Both elements should coexist
        expect(document.getElementById('other')).not.toBeNull();
        expect(document.getElementById('other')?.textContent).toBe('Other content');
        expect(rootElement.innerHTML).toContain('Design Workflow');
      }

      otherElement.remove();
    });
  });

  describe('CSS Integration', () => {
    it('should apply Tailwind CSS classes correctly', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        // Check for Tailwind classes
        expect(rootElement.innerHTML).toContain('min-h-screen');
        expect(rootElement.innerHTML).toContain('bg-gray-50');
        expect(rootElement.innerHTML).toContain('max-w-7xl');
        expect(rootElement.innerHTML).toContain('shadow-sm');
      }
    });

    it('should maintain class structure on re-render', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        const firstRenderClasses = rootElement.innerHTML;

        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        const secondRenderClasses = rootElement.innerHTML;

        // Classes should remain consistent
        expect(firstRenderClasses).toBe(secondRenderClasses);
      }
    });
  });

  describe('Module Loading', () => {
    it('should import dependencies successfully', async () => {
      // Verify React imports work
      const { StrictMode } = await import('react');
      expect(StrictMode).toBeDefined();

      // Verify ReactDOM imports work
      const { createRoot } = await import('react-dom/client');
      expect(createRoot).toBeDefined();

      // Verify App component imports work
      const AppComponent = await import('./App');
      expect(AppComponent).toBeDefined();
    });

    it('should have correct module structure', () => {
      // App component should have default export
      expect(App).toBeDefined();
      expect(typeof App).toBe('function');
    });
  });

  describe('main.tsx Side Effects', () => {
    it('should render App component using createRoot', () => {
      // This test verifies that main.tsx behavior is replicated correctly
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        // Simulate what main.tsx does
        render(
          <StrictMode>
            <App />
          </StrictMode>,
          { container: rootElement }
        );

        // Verify the app rendered
        expect(rootElement.innerHTML).toContain('Design Workflow');
      }
    });

    it('should create root and render without errors', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        // This simulates the main.tsx entry point behavior
        expect(() => {
          render(
            <StrictMode>
              <App />
            </StrictMode>,
            { container: rootElement }
          );
        }).not.toThrow();
      }
    });
  });

  describe('main.tsx Exported render Function', () => {
    it('should call exported render function without errors', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        expect(() => {
          act(() => {
            mainRender();
          });
        }).not.toThrow();
      }
    });

    it('should render app when calling exported render', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();

      if (rootElement) {
        act(() => {
          mainRender();
        });

        expect(rootElement.innerHTML).toContain('Design Workflow');
      }
    });

    it('should throw error when root element is missing', () => {
      // Remove root element temporarily
      const rootElement = document.getElementById('root');
      rootElement?.remove();

      expect(() => {
        mainRender();
      }).toThrow('Root element not found');

      // Restore root element for other tests
      const newRoot = document.createElement('div');
      newRoot.id = 'root';
      document.body.appendChild(newRoot);
    });
  });
});
