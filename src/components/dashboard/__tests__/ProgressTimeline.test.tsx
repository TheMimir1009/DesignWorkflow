/**
 * ProgressTimeline Component Tests
 * Tests for line chart component showing progress over time
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressTimeline } from '../ProgressTimeline';
import type { TimelineDataPoint, PeriodFilter } from '../../../types';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid={`line-${dataKey}`} data-stroke={stroke} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('ProgressTimeline', () => {
  const mockData: TimelineDataPoint[] = [
    { date: '2024-01-01', tasksCreated: 5, tasksCompleted: 3, documentsGenerated: 2 },
    { date: '2024-01-02', tasksCreated: 3, tasksCompleted: 2, documentsGenerated: 1 },
    { date: '2024-01-03', tasksCreated: 7, tasksCompleted: 4, documentsGenerated: 3 },
  ];

  const defaultProps = {
    data: mockData,
    period: 'daily' as PeriodFilter,
  };

  it('should render the chart container', () => {
    render(<ProgressTimeline {...defaultProps} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render line for tasks created', () => {
    render(<ProgressTimeline {...defaultProps} />);

    const line = screen.getByTestId('line-tasksCreated');
    expect(line).toBeInTheDocument();
  });

  it('should render line for tasks completed', () => {
    render(<ProgressTimeline {...defaultProps} />);

    const line = screen.getByTestId('line-tasksCompleted');
    expect(line).toBeInTheDocument();
  });

  it('should render X-axis with date key', () => {
    render(<ProgressTimeline {...defaultProps} />);

    const xAxis = screen.getByTestId('x-axis');
    expect(xAxis).toBeInTheDocument();
    expect(xAxis.getAttribute('data-key')).toBe('date');
  });

  it('should render Y-axis', () => {
    render(<ProgressTimeline {...defaultProps} />);

    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  it('should render grid', () => {
    render(<ProgressTimeline {...defaultProps} />);

    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  it('should render tooltip', () => {
    render(<ProgressTimeline {...defaultProps} />);

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('should render legend', () => {
    render(<ProgressTimeline {...defaultProps} />);

    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should render chart title', () => {
    render(<ProgressTimeline {...defaultProps} />);

    expect(screen.getByText('Progress Timeline')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    render(<ProgressTimeline data={[]} period="daily" />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should display period indicator', () => {
    render(<ProgressTimeline {...defaultProps} period="weekly" />);

    expect(screen.getByText(/weekly/i)).toBeInTheDocument();
  });

  it('should use different colors for each line', () => {
    render(<ProgressTimeline {...defaultProps} />);

    const createdLine = screen.getByTestId('line-tasksCreated');
    const completedLine = screen.getByTestId('line-tasksCompleted');

    expect(createdLine.getAttribute('data-stroke')).not.toBe(
      completedLine.getAttribute('data-stroke')
    );
  });
});
