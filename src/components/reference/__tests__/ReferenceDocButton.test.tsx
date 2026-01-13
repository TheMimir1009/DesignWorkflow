/**
 * ReferenceDocButton Tests
 * TDD test suite for reference document button component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceDocButton } from '../ReferenceDocButton';
import { useReferenceDocStore } from '../../../store/referenceDocStore';

// Mock the store with implementation
vi.mock('../../../store/referenceDocStore', () => ({
  useReferenceDocStore: vi.fn(),
}));

const mockedStore = vi.mocked(useReferenceDocStore);

describe('ReferenceDocButton', () => {
  const mockOpenPanel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock selector pattern used by Zustand
    mockedStore.mockImplementation((selector) => {
      const state = {
        openPanel: mockOpenPanel,
        isPanelOpen: false,
      };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });
  });

  it('should render button with text', () => {
    render(<ReferenceDocButton />);

    expect(screen.getByRole('button', { name: /참조 문서 보기/i })).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(<ReferenceDocButton />);

    expect(screen.getByTestId('reference-doc-icon')).toBeInTheDocument();
  });

  it('should call openPanel when clicked', () => {
    render(<ReferenceDocButton />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenPanel).toHaveBeenCalledTimes(1);
  });

  it('should have accessible name', () => {
    render(<ReferenceDocButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/참조 문서 보기/i);
  });

  it('should apply correct styles', () => {
    render(<ReferenceDocButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center');
  });

  it('should show active state when panel is open', () => {
    mockedStore.mockImplementation((selector) => {
      const state = {
        openPanel: mockOpenPanel,
        isPanelOpen: true,
      };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<ReferenceDocButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should show inactive state when panel is closed', () => {
    render(<ReferenceDocButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
