/**
 * RecommendationCard Component Tests
 * Tests for individual recommendation card display
 * AC-004: UI rendering, AC-005: Individual system add, AC-010: Duplicate prevention
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecommendationCard } from '../RecommendationCard';
import type { RecommendedSystem } from '../../../services/discoveryService';

describe('RecommendationCard', () => {
  const mockSystem: RecommendedSystem = {
    id: 'system-1',
    name: 'Character System',
    relevanceScore: 95,
    matchReason: 'Character tag matching',
  };

  const defaultProps = {
    system: mockSystem,
    isAlreadyAdded: false,
    onAdd: vi.fn(),
  };

  it('should render system name', () => {
    render(<RecommendationCard {...defaultProps} />);

    expect(screen.getByText('Character System')).toBeInTheDocument();
  });

  it('should render relevance score percentage', () => {
    render(<RecommendationCard {...defaultProps} />);

    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should render progress bar with correct width', () => {
    render(<RecommendationCard {...defaultProps} />);

    const progressBar = screen.getByTestId('relevance-progress');
    expect(progressBar).toHaveStyle({ width: '95%' });
  });

  it('should render match reason when provided', () => {
    render(<RecommendationCard {...defaultProps} />);

    expect(screen.getByText('Character tag matching')).toBeInTheDocument();
  });

  it('should not render match reason when not provided', () => {
    const systemWithoutReason: RecommendedSystem = {
      id: 'system-2',
      name: 'Test System',
      relevanceScore: 80,
    };

    render(
      <RecommendationCard
        system={systemWithoutReason}
        isAlreadyAdded={false}
        onAdd={vi.fn()}
      />
    );

    expect(screen.queryByTestId('match-reason')).not.toBeInTheDocument();
  });

  it('should render add button when not already added', () => {
    render(<RecommendationCard {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  it('should call onAdd with system id when add button clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<RecommendationCard {...defaultProps} onAdd={onAdd} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(onAdd).toHaveBeenCalledWith('system-1');
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('should show "Already Added" when isAlreadyAdded is true', () => {
    render(<RecommendationCard {...defaultProps} isAlreadyAdded={true} />);

    expect(screen.getByText('Already Added')).toBeInTheDocument();
  });

  it('should disable button when isAlreadyAdded is true', () => {
    render(<RecommendationCard {...defaultProps} isAlreadyAdded={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render document icon', () => {
    render(<RecommendationCard {...defaultProps} />);

    expect(screen.getByTestId('document-icon')).toBeInTheDocument();
  });

  it('should have keyboard accessible add button', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<RecommendationCard {...defaultProps} onAdd={onAdd} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    addButton.focus();
    expect(addButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onAdd).toHaveBeenCalledWith('system-1');
  });

  it('should apply different styles based on relevance score', () => {
    const highScoreSystem: RecommendedSystem = {
      id: 'high',
      name: 'High Score',
      relevanceScore: 90,
    };

    const { rerender } = render(
      <RecommendationCard
        system={highScoreSystem}
        isAlreadyAdded={false}
        onAdd={vi.fn()}
      />
    );

    // High score should have green color
    const progressHigh = screen.getByTestId('relevance-progress');
    expect(progressHigh.className).toContain('bg-green');

    const mediumScoreSystem: RecommendedSystem = {
      id: 'medium',
      name: 'Medium Score',
      relevanceScore: 65,
    };

    rerender(
      <RecommendationCard
        system={mediumScoreSystem}
        isAlreadyAdded={false}
        onAdd={vi.fn()}
      />
    );

    // Medium score should have yellow color
    const progressMedium = screen.getByTestId('relevance-progress');
    expect(progressMedium.className).toContain('bg-yellow');

    const lowScoreSystem: RecommendedSystem = {
      id: 'low',
      name: 'Low Score',
      relevanceScore: 30,
    };

    rerender(
      <RecommendationCard
        system={lowScoreSystem}
        isAlreadyAdded={false}
        onAdd={vi.fn()}
      />
    );

    // Low score should have red color
    const progressLow = screen.getByTestId('relevance-progress');
    expect(progressLow.className).toContain('bg-red');
  });

  it('should render card with proper accessibility attributes', () => {
    render(<RecommendationCard {...defaultProps} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'Recommendation: Character System');
  });
});
