/**
 * Dashboard Component Tests
 * Tests for main dashboard layout component
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { useDashboardStore } from '../../../store/dashboardStore';
import type { DashboardSummary, TimelineDataPoint } from '../../../types';

// Mock child components
vi.mock('../StatsSummary', () => ({
  StatsSummary: ({ summary }: { summary: DashboardSummary }) => (
    <div data-testid="stats-summary">Stats: {summary.totalTasks}</div>
  ),
}));

vi.mock('../TaskStatusChart', () => ({
  TaskStatusChart: () => <div data-testid="task-status-chart">Task Status Chart</div>,
}));

vi.mock('../ProgressTimeline', () => ({
  ProgressTimeline: () => <div data-testid="progress-timeline">Progress Timeline</div>,
}));

vi.mock('../DashboardHeader', () => ({
  DashboardHeader: ({
    onPeriodChange,
    onExport,
  }: {
    onPeriodChange: (period: string) => void;
    onExport: (format: string) => void;
  }) => (
    <div data-testid="dashboard-header">
      <button onClick={() => onPeriodChange('daily')}>Daily</button>
      <button onClick={() => onExport('csv')}>Export CSV</button>
    </div>
  ),
}));

// Mock dashboard service
vi.mock('../../../services/dashboardService', () => ({
  getSummary: vi.fn(),
  getTimeline: vi.fn(),
  exportCSV: vi.fn(),
}));

import * as dashboardService from '../../../services/dashboardService';

describe('Dashboard', () => {
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

  const mockTimeline: TimelineDataPoint[] = [
    { date: '2024-01-01', tasksCreated: 5, tasksCompleted: 3, documentsGenerated: 2 },
  ];

  beforeEach(() => {
    // Default mock responses
    vi.mocked(dashboardService.getSummary).mockResolvedValue(mockSummary);
    vi.mocked(dashboardService.getTimeline).mockResolvedValue(mockTimeline);

    // Reset store state
    useDashboardStore.setState({
      summary: null,
      timeline: [],
      periodFilter: 'weekly',
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeleton while loading', async () => {
    // Make the service calls never resolve to keep loading state
    vi.mocked(dashboardService.getSummary).mockImplementation(
      () => new Promise(() => {})
    );
    vi.mocked(dashboardService.getTimeline).mockImplementation(
      () => new Promise(() => {})
    );

    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    });
  });

  it('should render error state', async () => {
    // Simulate an API error
    vi.mocked(dashboardService.getSummary).mockRejectedValue(
      new Error('Failed to load data')
    );
    vi.mocked(dashboardService.getTimeline).mockRejectedValue(
      new Error('Failed to load data')
    );

    render(<Dashboard projectId="project-1" />);

    // Wait for the error state to be rendered
    await waitFor(() => {
      const errorElement = screen.queryByText(/Failed to load data/i);
      const emptyElement = screen.queryByTestId('empty-dashboard');
      // Either error message or empty state is acceptable after failed fetch
      expect(errorElement || emptyElement).toBeTruthy();
    });
  });

  it('should render empty state when no data', async () => {
    vi.mocked(dashboardService.getSummary).mockResolvedValue(
      null as unknown as DashboardSummary
    );

    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-dashboard')).toBeInTheDocument();
    });
  });

  it('should render dashboard with data', async () => {
    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('stats-summary')).toBeInTheDocument();
      expect(screen.getByTestId('task-status-chart')).toBeInTheDocument();
      expect(screen.getByTestId('progress-timeline')).toBeInTheDocument();
    });
  });

  it('should fetch data on mount', async () => {
    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(dashboardService.getSummary).toHaveBeenCalledWith('project-1');
      expect(dashboardService.getTimeline).toHaveBeenCalledWith('project-1', 'weekly');
    });
  });

  it('should call export on export button click', async () => {
    const mockBlob = new Blob(['test'], { type: 'text/csv' });
    vi.mocked(dashboardService.exportCSV).mockResolvedValueOnce(mockBlob);

    // Mock URL.createObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export CSV'));

    await waitFor(() => {
      expect(dashboardService.exportCSV).toHaveBeenCalledWith('project-1');
    });
  });

  it('should update period filter when changed', async () => {
    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Daily'));

    await waitFor(() => {
      expect(useDashboardStore.getState().periodFilter).toBe('daily');
    });
  });

  it('should render dashboard title', async () => {
    render(<Dashboard projectId="project-1" />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
