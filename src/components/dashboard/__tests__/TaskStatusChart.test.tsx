/**
 * TaskStatusChart Component Tests
 * Tests for pie chart component showing task status distribution
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskStatusChart } from '../TaskStatusChart';
import type { TasksByStatus } from '../../../types';

// Mock Recharts since it uses browser APIs
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="pie" onClick={onClick}>
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('TaskStatusChart', () => {
  const mockData: TasksByStatus = {
    featurelist: 4,
    design: 3,
    prd: 2,
    prototype: 1,
  };

  const defaultProps = {
    data: mockData,
  };

  it('should render the chart container', () => {
    render(<TaskStatusChart {...defaultProps} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should render pie component', () => {
    render(<TaskStatusChart {...defaultProps} />);

    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('should render correct number of cells for each status', () => {
    render(<TaskStatusChart {...defaultProps} />);

    // Should have 4 cells for 4 statuses
    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(4);
  });

  it('should use correct colors for each status', () => {
    render(<TaskStatusChart {...defaultProps} />);

    const cells = screen.getAllByTestId('cell');
    const colors = cells.map((cell) => cell.getAttribute('data-fill'));

    // Should include the defined colors
    expect(colors).toContain('#3B82F6'); // featurelist
    expect(colors).toContain('#10B981'); // design
    expect(colors).toContain('#F59E0B'); // prd
    expect(colors).toContain('#8B5CF6'); // prototype
  });

  it('should render tooltip component', () => {
    render(<TaskStatusChart {...defaultProps} />);

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('should render legend component', () => {
    render(<TaskStatusChart {...defaultProps} />);

    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should call onClick handler when provided and pie is clicked', () => {
    const handleClick = vi.fn();
    render(<TaskStatusChart {...defaultProps} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('pie'));

    expect(handleClick).toHaveBeenCalled();
  });

  it('should render without click handler', () => {
    render(<TaskStatusChart {...defaultProps} />);

    // Should render without errors
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    const emptyData: TasksByStatus = {
      featurelist: 0,
      design: 0,
      prd: 0,
      prototype: 0,
    };

    render(<TaskStatusChart data={emptyData} />);

    // Should still render chart even with zero values
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('should render chart title', () => {
    render(<TaskStatusChart {...defaultProps} />);

    expect(screen.getByText('Task Status Distribution')).toBeInTheDocument();
  });
});
