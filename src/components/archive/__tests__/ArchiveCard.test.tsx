/**
 * ArchiveCard Tests
 * TDD test suite for archive card component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchiveCard } from '../ArchiveCard';
import type { Archive, Task } from '../../../types';

const mockTask: Task = {
  id: 'task-123',
  projectId: 'project-123',
  title: 'Test Task',
  status: 'prototype',
  featureList: 'Feature list content',
  designDocument: 'Design document content',
  prd: 'PRD content',
  prototype: 'Prototype content',
  references: ['ref-1', 'ref-2'],
  qaAnswers: [],
  revisions: [],
  isArchived: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockArchive: Archive = {
  id: 'archive-123',
  taskId: 'task-123',
  projectId: 'project-123',
  task: mockTask,
  archivedAt: '2024-01-02T00:00:00.000Z',
};

describe('ArchiveCard', () => {
  const defaultProps = {
    archive: mockArchive,
    onRestore: vi.fn(),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render archive task title', () => {
    render(<ArchiveCard {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should display archived date', () => {
    render(<ArchiveCard {...defaultProps} />);

    expect(screen.getByText(/Jan 2, 2024/i)).toBeInTheDocument();
  });

  it('should display document icons for existing documents', () => {
    render(<ArchiveCard {...defaultProps} />);

    expect(screen.getByTestId('icon-featurelist')).toBeInTheDocument();
    expect(screen.getByTestId('icon-design')).toBeInTheDocument();
    expect(screen.getByTestId('icon-prd')).toBeInTheDocument();
    expect(screen.getByTestId('icon-prototype')).toBeInTheDocument();
  });

  it('should call onRestore when restore button is clicked', () => {
    render(<ArchiveCard {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /restore/i }));

    expect(defaultProps.onRestore).toHaveBeenCalledWith(mockArchive.id);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ArchiveCard {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockArchive.id);
  });

  it('should call onSelect when card is clicked', () => {
    render(<ArchiveCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId(`archive-card-${mockArchive.id}`));

    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockArchive.id);
  });

  it('should highlight when selected', () => {
    render(<ArchiveCard {...defaultProps} isSelected={true} />);

    const card = screen.getByTestId(`archive-card-${mockArchive.id}`);
    expect(card.className).toContain('ring-2');
  });

  it('should display reference count', () => {
    render(<ArchiveCard {...defaultProps} />);

    expect(screen.getByText(/2 references/i)).toBeInTheDocument();
  });
});
