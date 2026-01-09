/**
 * ReferenceDocListItem Tests
 * TDD test suite for document list item component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceDocListItem } from '../ReferenceDocListItem';
import type { CompletedDocumentSummary } from '../../../types';

describe('ReferenceDocListItem', () => {
  const mockOnClick = vi.fn();

  const mockDocument: CompletedDocumentSummary = {
    taskId: 'task-1',
    title: 'Test Task',
    status: 'prototype',
    references: ['ref-1', 'ref-2'],
    hasDesignDoc: true,
    hasPrd: true,
    hasPrototype: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render document title', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render status badge for prototype', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('should render status badge for archived', () => {
    const archivedDoc: CompletedDocumentSummary = {
      ...mockDocument,
      status: 'archived',
      archivedAt: '2024-01-20T00:00:00.000Z',
    };

    render(<ReferenceDocListItem document={archivedDoc} onClick={mockOnClick} />);

    expect(screen.getByText('아카이브')).toBeInTheDocument();
  });

  it('should render document type badges', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('PRD')).toBeInTheDocument();
    expect(screen.queryByText('Proto')).not.toBeInTheDocument();
  });

  it('should render references', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    expect(screen.getByText('ref-1, ref-2')).toBeInTheDocument();
  });

  it('should truncate many references', () => {
    const manyRefsDoc: CompletedDocumentSummary = {
      ...mockDocument,
      references: ['ref-1', 'ref-2', 'ref-3', 'ref-4'],
    };

    render(<ReferenceDocListItem document={manyRefsDoc} onClick={mockOnClick} />);

    expect(screen.getByText('ref-1, ref-2')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('should display date', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    // Korean date format
    expect(screen.getByText(/1월 15/)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have accessible label', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveAccessibleName(/test task 문서 보기/i);
  });

  it('should be focusable', () => {
    render(<ReferenceDocListItem document={mockDocument} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();
  });
});
