/**
 * DiscoverySkeleton Component Tests
 * Tests for loading skeleton UI during discovery fetch
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiscoverySkeleton } from '../DiscoverySkeleton';

describe('DiscoverySkeleton', () => {
  it('should render default 3 skeleton cards', () => {
    render(<DiscoverySkeleton />);

    const skeletonCards = screen.getAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(3);
  });

  it('should render custom count of skeleton cards', () => {
    render(<DiscoverySkeleton count={5} />);

    const skeletonCards = screen.getAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(5);
  });

  it('should render pulse animation elements', () => {
    render(<DiscoverySkeleton count={1} />);

    // Check for animated elements
    const animatedElements = screen.getAllByTestId('skeleton-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('should render progress bar placeholder in each card', () => {
    render(<DiscoverySkeleton count={2} />);

    const progressBars = screen.getAllByTestId('skeleton-progress');
    expect(progressBars).toHaveLength(2);
  });

  it('should render title placeholder in each card', () => {
    render(<DiscoverySkeleton count={2} />);

    const titles = screen.getAllByTestId('skeleton-title');
    expect(titles).toHaveLength(2);
  });

  it('should render button placeholder in each card', () => {
    render(<DiscoverySkeleton count={2} />);

    const buttons = screen.getAllByTestId('skeleton-button');
    expect(buttons).toHaveLength(2);
  });

  it('should have accessible role for loading state', () => {
    render(<DiscoverySkeleton />);

    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-label', 'Loading recommendations');
  });
});
