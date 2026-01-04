/**
 * CategorySelector Component Tests
 * TDD test suite for Q&A category selector component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelector } from '../../../src/components/qa/CategorySelector';
import type { QACategory } from '../../../src/types/qa';

// Test data factory
const createMockCategory = (overrides: Partial<QACategory> = {}): QACategory => ({
  id: 'game-mechanic',
  name: 'Game Mechanics',
  description: 'Core gameplay mechanics and systems',
  order: 1,
  questionCount: 5,
  ...overrides,
});

describe('CategorySelector', () => {
  const mockCategories: QACategory[] = [
    createMockCategory({ id: 'game-mechanic', name: 'Game Mechanics', order: 1, questionCount: 5 }),
    createMockCategory({ id: 'economy', name: 'Economy', order: 2, questionCount: 4 }),
    createMockCategory({ id: 'growth', name: 'Growth', order: 3, questionCount: 5 }),
  ];

  const defaultProps = {
    categories: mockCategories,
    selectedCategoryId: null,
    onSelectCategory: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all categories as tabs', () => {
      render(<CategorySelector {...defaultProps} />);

      expect(screen.getByText('Game Mechanics')).toBeInTheDocument();
      expect(screen.getByText('Economy')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
    });

    it('should render categories in order', () => {
      render(<CategorySelector {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should show question count for each category', () => {
      render(<CategorySelector {...defaultProps} />);

      // Find all elements with question counts
      const fiveElements = screen.getAllByText('5');
      const fourElements = screen.getAllByText('4');

      // Game Mechanics and Growth both have 5, Economy has 4
      expect(fiveElements).toHaveLength(2);
      expect(fourElements).toHaveLength(1);
    });

    it('should render empty state when no categories', () => {
      render(<CategorySelector {...defaultProps} categories={[]} />);

      expect(screen.getByText('No categories available')).toBeInTheDocument();
    });

    it('should highlight selected category', () => {
      render(<CategorySelector {...defaultProps} selectedCategoryId="economy" />);

      const economyTab = screen.getByRole('tab', { name: /economy/i });
      expect(economyTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should not highlight unselected categories', () => {
      render(<CategorySelector {...defaultProps} selectedCategoryId="economy" />);

      const gameMechanicTab = screen.getByRole('tab', { name: /game mechanics/i });
      expect(gameMechanicTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Interaction', () => {
    it('should call onSelectCategory when tab is clicked', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();
      render(<CategorySelector {...defaultProps} onSelectCategory={handleSelect} />);

      const economyTab = screen.getByRole('tab', { name: /economy/i });
      await user.click(economyTab);

      expect(handleSelect).toHaveBeenCalledWith('economy');
    });

    it('should call onSelectCategory with different category', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();
      render(<CategorySelector {...defaultProps} onSelectCategory={handleSelect} />);

      const growthTab = screen.getByRole('tab', { name: /growth/i });
      await user.click(growthTab);

      expect(handleSelect).toHaveBeenCalledWith('growth');
    });

    it('should call onSelectCategory with null when clicking selected category', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();
      render(
        <CategorySelector
          {...defaultProps}
          selectedCategoryId="economy"
          onSelectCategory={handleSelect}
        />
      );

      const economyTab = screen.getByRole('tab', { name: /economy/i });
      await user.click(economyTab);

      expect(handleSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('Completion Status', () => {
    it('should show completion indicator for completed categories', () => {
      render(
        <CategorySelector
          {...defaultProps}
          completedCategories={['game-mechanic']}
        />
      );

      const completedIcon = screen.getByTestId('completed-icon-game-mechanic');
      expect(completedIcon).toBeInTheDocument();
    });

    it('should not show completion indicator for incomplete categories', () => {
      render(
        <CategorySelector
          {...defaultProps}
          completedCategories={['game-mechanic']}
        />
      );

      expect(screen.queryByTestId('completed-icon-economy')).not.toBeInTheDocument();
    });

    it('should show multiple completion indicators', () => {
      render(
        <CategorySelector
          {...defaultProps}
          completedCategories={['game-mechanic', 'economy']}
        />
      );

      expect(screen.getByTestId('completed-icon-game-mechanic')).toBeInTheDocument();
      expect(screen.getByTestId('completed-icon-economy')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have tablist role', () => {
      render(<CategorySelector {...defaultProps} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should have tab role for each category', () => {
      render(<CategorySelector {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should support keyboard navigation', async () => {
      const handleSelect = vi.fn();
      const user = userEvent.setup();
      render(<CategorySelector {...defaultProps} onSelectCategory={handleSelect} />);

      const firstTab = screen.getByRole('tab', { name: /game mechanics/i });
      firstTab.focus();

      await user.keyboard('{Enter}');
      expect(handleSelect).toHaveBeenCalledWith('game-mechanic');
    });
  });
});
