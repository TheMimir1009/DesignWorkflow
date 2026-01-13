/**
 * StatsSummary Component Tests
 * Tests for stat cards showing dashboard metrics
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSummary } from '../StatsSummary';
import type { DashboardSummary } from '../../../types';

describe('StatsSummary', () => {
  const mockSummary: DashboardSummary = {
    projectId: 'project-1',
    totalTasks: 10,
    tasksByStatus: {
      featurelist: 4,
      design: 3,
      prd: 2,
      prototype: 1,
    },
    completionRate: 0.1,
    archivedCount: 5,
    documentsGenerated: 8,
    lastUpdated: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    summary: mockSummary,
  };

  it('should render total tasks card', () => {
    render(<StatsSummary {...defaultProps} />);

    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should render in progress card with tasks not completed', () => {
    render(<StatsSummary {...defaultProps} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    // Total - Prototype = 10 - 1 = 9 (tasks not yet completed)
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('should render completion rate card', () => {
    render(<StatsSummary {...defaultProps} />);

    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    // 0.1 = 10%
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('should render documents generated card', () => {
    render(<StatsSummary {...defaultProps} />);

    expect(screen.getByText('Documents Generated')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('should render all four stat cards', () => {
    render(<StatsSummary {...defaultProps} />);

    expect(screen.getByTestId('stat-total-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('stat-in-progress')).toBeInTheDocument();
    expect(screen.getByTestId('stat-completion-rate')).toBeInTheDocument();
    expect(screen.getByTestId('stat-documents')).toBeInTheDocument();
  });

  it('should display icons for each stat card', () => {
    render(<StatsSummary {...defaultProps} />);

    expect(screen.getByTestId('icon-clipboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-activity')).toBeInTheDocument();
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    expect(screen.getByTestId('icon-file-text')).toBeInTheDocument();
  });

  it('should render progress bar for completion rate', () => {
    render(<StatsSummary {...defaultProps} />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toBeInTheDocument();
    // Should have 10% width style
    expect(progressBar).toHaveStyle({ width: '10%' });
  });

  it('should handle zero completion rate', () => {
    const zeroSummary: DashboardSummary = {
      ...mockSummary,
      completionRate: 0,
    };

    render(<StatsSummary summary={zeroSummary} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('should handle 100% completion rate', () => {
    const completedSummary: DashboardSummary = {
      ...mockSummary,
      totalTasks: 5,
      tasksByStatus: {
        featurelist: 0,
        design: 0,
        prd: 0,
        prototype: 5,
      },
      completionRate: 1.0,
    };

    render(<StatsSummary summary={completedSummary} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});
