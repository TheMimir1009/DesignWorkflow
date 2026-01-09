/**
 * ArchiveDetail Tests
 * TDD test suite for archive detail component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchiveDetail } from '../ArchiveDetail';
import type { Archive, Task } from '../../../types';

const mockTask: Task = {
  id: 'task-123',
  projectId: 'project-123',
  title: 'Test Task',
  status: 'prototype',
  featureList: '# Feature List\n\n- Feature 1\n- Feature 2',
  designDocument: '# Design Document\n\nDesign content here.',
  prd: '# PRD\n\nPRD content here.',
  prototype: '# Prototype\n\nPrototype content here.',
  references: ['ref-1', 'ref-2', 'ref-3'],
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

describe('ArchiveDetail', () => {
  const defaultProps = {
    archive: mockArchive,
    onRestore: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render archive task title', () => {
    render(<ArchiveDetail {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should display archived date', () => {
    render(<ArchiveDetail {...defaultProps} />);

    expect(screen.getByText(/Jan 2, 2024/i)).toBeInTheDocument();
  });

  it('should display all document sections', () => {
    render(<ArchiveDetail {...defaultProps} />);

    // Check for section headings (h4 elements)
    const headings = screen.getAllByRole('heading', { level: 4 });
    const headingTexts = headings.map((h) => h.textContent);

    expect(headingTexts).toContain('Feature List');
    expect(headingTexts).toContain('Design Document');
    expect(headingTexts).toContain('PRD');
    expect(headingTexts).toContain('Prototype');
  });

  it('should display references', () => {
    render(<ArchiveDetail {...defaultProps} />);

    expect(screen.getByText('ref-1')).toBeInTheDocument();
    expect(screen.getByText('ref-2')).toBeInTheDocument();
    expect(screen.getByText('ref-3')).toBeInTheDocument();
  });

  it('should call onRestore when restore button is clicked', () => {
    render(<ArchiveDetail {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /restore/i }));

    expect(defaultProps.onRestore).toHaveBeenCalledWith(mockArchive.id);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ArchiveDetail {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockArchive.id);
  });

  it('should call onClose when close button is clicked', () => {
    render(<ArchiveDetail {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should render null when archive is null', () => {
    const { container } = render(<ArchiveDetail {...defaultProps} archive={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('should handle missing document content gracefully', () => {
    const archiveWithMissingDocs: Archive = {
      ...mockArchive,
      task: {
        ...mockTask,
        designDocument: null,
        prd: null,
      },
    };

    render(<ArchiveDetail {...defaultProps} archive={archiveWithMissingDocs} />);

    // Should show "No content" for missing documents
    const noContentElements = screen.getAllByText(/no content/i);
    expect(noContentElements.length).toBeGreaterThanOrEqual(2);
  });
});
