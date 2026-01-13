/**
 * CategorySelector Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySelector } from '../../../src/components/document/CategorySelector';
import type { QACategory } from '../../../src/types/qa';

describe('CategorySelector', () => {
  const defaultProps = {
    selected: 'game_mechanic' as QACategory,
    onChange: vi.fn(),
    disabled: false,
  };

  it('should render all three category tabs', () => {
    render(<CategorySelector {...defaultProps} />);

    expect(screen.getByText('Game Mechanics')).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
  });

  it('should highlight selected category', () => {
    render(<CategorySelector {...defaultProps} selected="economy" />);

    const economyTab = screen.getByRole('tab', { name: /economy/i });
    expect(economyTab).toHaveClass('bg-blue-500');
  });

  it('should call onChange when tab is clicked', () => {
    const onChange = vi.fn();
    render(<CategorySelector {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /growth/i }));

    expect(onChange).toHaveBeenCalledWith('growth');
  });

  it('should be disabled when disabled prop is true', () => {
    const onChange = vi.fn();
    render(<CategorySelector {...defaultProps} onChange={onChange} disabled={true} />);

    const tabs = screen.getAllByRole('tab');
    tabs.forEach((tab) => {
      expect(tab).toBeDisabled();
    });

    fireEvent.click(screen.getByRole('tab', { name: /economy/i }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should have proper aria labels for accessibility', () => {
    render(<CategorySelector {...defaultProps} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});
