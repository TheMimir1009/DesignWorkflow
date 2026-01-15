/**
 * App 컴포넌트 테스트
 * React 19 App 컴포넌트 렌더링 및 UI 검증
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('Design Workflow')).toBeInTheDocument();
  });

  it('should render header with title', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Design Workflow');
  });

  it('should render subtitle in header', () => {
    render(<App />);
    const subtitle = screen.getByText('AI-powered game design document management');
    expect(subtitle).toBeInTheDocument();
  });

  it('should render welcome section', () => {
    render(<App />);
    const welcomeTitle = screen.getByText('Welcome to Design Workflow');
    expect(welcomeTitle).toBeInTheDocument();
  });

  it('should render welcome message', () => {
    render(<App />);
    const welcomeMessage = screen.getByText(/This is the initial setup/);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('should render tech stack information', () => {
    render(<App />);

    // Frontend info (using full line to avoid duplicates)
    expect(screen.getByText(/Frontend: React 19/)).toBeInTheDocument();
    expect(screen.getAllByText(/TypeScript 5.9/).length).toBe(2);
    expect(screen.getByText(/Vite 7.0/)).toBeInTheDocument();
    expect(screen.getByText(/Tailwind CSS 4.0/)).toBeInTheDocument();

    // Backend info
    expect(screen.getByText(/Backend: Express 5.0/)).toBeInTheDocument();

    // State management info
    expect(screen.getByText(/State Management: Zustand 5.0/)).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<App />);

    // Main container
    const mainContainer = container.querySelector('.min-h-screen.bg-gray-50');
    expect(mainContainer).toBeInTheDocument();

    // Header
    const header = container.querySelector('header.bg-white.shadow-sm');
    expect(header).toBeInTheDocument();

    // Main content
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    const subheading = screen.getByRole('heading', { level: 2 });
    expect(subheading).toBeInTheDocument();
  });

  it('should render responsive layout structure', () => {
    const { container } = render(<App />);

    // Check for max-w-7xl container class
    const maxWidthContainers = container.querySelectorAll('.max-w-7xl');
    expect(maxWidthContainers.length).toBeGreaterThan(0);

    // Check for responsive padding classes
    const responsiveElements = container.querySelectorAll('.px-4');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('should render info box with proper styling', () => {
    const { container } = render(<App />);

    const infoBox = container.querySelector('.bg-blue-50');
    expect(infoBox).toBeInTheDocument();

    const borderBox = container.querySelector('.border-blue-200');
    expect(borderBox).toBeInTheDocument();
  });

  it('should display all technology stack items', () => {
    render(<App />);

    // Check for checkmark indicators
    const checkmarks = screen.getAllByText(/✓/);
    expect(checkmarks.length).toBeGreaterThanOrEqual(3);
  });
});
