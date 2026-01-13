/**
 * ArchiveList Tests
 * TDD test suite for archive list component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchiveList } from '../ArchiveList';
import type { Archive, Task } from '../../../types';

const createMockTask = (title: string): Task => ({
  id: `task-${title}`,
  projectId: 'project-123',
  title,
  status: 'prototype',
  featureList: 'Feature list content',
  designDocument: 'Design document content',
  prd: 'PRD content',
  prototype: 'Prototype content',
  references: [],
  qaAnswers: [],
  revisions: [],
  isArchived: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const createMockArchive = (id: string, task: Task): Archive => ({
  id,
  taskId: task.id,
  projectId: 'project-123',
  task,
  archivedAt: '2024-01-02T00:00:00.000Z',
});

const mockArchives: Archive[] = [
  createMockArchive('archive-1', createMockTask('Task 1')),
  createMockArchive('archive-2', createMockTask('Task 2')),
  createMockArchive('archive-3', createMockTask('Task 3')),
];

describe('ArchiveList', () => {
  const defaultProps = {
    archives: mockArchives,
    selectedArchiveId: null,
    searchQuery: '',
    isLoading: false,
    onRestore: vi.fn(),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
    onSearchChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list of archives', () => {
    render(<ArchiveList {...defaultProps} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('should display empty message when no archives', () => {
    render(<ArchiveList {...defaultProps} archives={[]} />);

    expect(screen.getByText(/no archived tasks/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<ArchiveList {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<ArchiveList {...defaultProps} />);

    expect(screen.getByPlaceholderText(/search archives/i)).toBeInTheDocument();
  });

  it('should call onSearchChange when search input changes', () => {
    render(<ArchiveList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search archives/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test query');
  });

  it('should show archive count', () => {
    render(<ArchiveList {...defaultProps} />);

    expect(screen.getByText(/3 archived tasks/i)).toBeInTheDocument();
  });

  it('should call onRestore when restore is clicked on a card', () => {
    render(<ArchiveList {...defaultProps} />);

    const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
    fireEvent.click(restoreButtons[0]);

    expect(defaultProps.onRestore).toHaveBeenCalledWith('archive-1');
  });

  it('should call onDelete when delete is clicked on a card', () => {
    render(<ArchiveList {...defaultProps} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(defaultProps.onDelete).toHaveBeenCalledWith('archive-1');
  });

  it('should highlight selected archive', () => {
    render(<ArchiveList {...defaultProps} selectedArchiveId="archive-2" />);

    const selectedCard = screen.getByTestId('archive-card-archive-2');
    expect(selectedCard.className).toContain('ring-2');
  });
});
