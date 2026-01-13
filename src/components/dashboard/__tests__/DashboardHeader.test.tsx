/**
 * DashboardHeader Component Tests
 * Tests for header with period filter and export buttons
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';
import type { PeriodFilter } from '../../../types';

describe('DashboardHeader', () => {
  const defaultProps = {
    periodFilter: 'weekly' as PeriodFilter,
    onPeriodChange: vi.fn(),
    onExport: vi.fn(),
  };

  it('should render period filter buttons', () => {
    render(<DashboardHeader {...defaultProps} />);

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('should highlight selected period', () => {
    render(<DashboardHeader {...defaultProps} periodFilter="daily" />);

    const dailyButton = screen.getByText('Daily');
    expect(dailyButton.className).toContain('bg-blue-600');
  });

  it('should call onPeriodChange when period button is clicked', () => {
    const onPeriodChange = vi.fn();
    render(<DashboardHeader {...defaultProps} onPeriodChange={onPeriodChange} />);

    fireEvent.click(screen.getByText('Daily'));
    expect(onPeriodChange).toHaveBeenCalledWith('daily');

    fireEvent.click(screen.getByText('Monthly'));
    expect(onPeriodChange).toHaveBeenCalledWith('monthly');
  });

  it('should render export buttons', () => {
    render(<DashboardHeader {...defaultProps} />);

    expect(screen.getByText('Export PNG')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should call onExport with png format when PNG button is clicked', () => {
    const onExport = vi.fn();
    render(<DashboardHeader {...defaultProps} onExport={onExport} />);

    fireEvent.click(screen.getByText('Export PNG'));
    expect(onExport).toHaveBeenCalledWith('png');
  });

  it('should call onExport with csv format when CSV button is clicked', () => {
    const onExport = vi.fn();
    render(<DashboardHeader {...defaultProps} onExport={onExport} />);

    fireEvent.click(screen.getByText('Export CSV'));
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('should render with testid', () => {
    render(<DashboardHeader {...defaultProps} />);

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
  });
});
