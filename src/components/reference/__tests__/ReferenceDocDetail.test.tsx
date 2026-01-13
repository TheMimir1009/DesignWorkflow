/**
 * ReferenceDocDetail Tests
 * TDD test suite for document detail component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceDocDetail } from '../ReferenceDocDetail';
import type { CompletedDocumentDetail } from '../../../types';

describe('ReferenceDocDetail', () => {
  const mockOnBack = vi.fn();

  const mockDocument: CompletedDocumentDetail = {
    taskId: 'task-1',
    title: 'Test Task',
    status: 'prototype',
    references: ['ref-1', 'ref-2'],
    featureList: '# Feature List\n\n- Feature 1\n- Feature 2',
    designDocument: '# Design Document\n\nDesign content here.',
    prd: '# PRD\n\nPRD content here.',
    prototype: null,
    qaAnswers: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render document title', () => {
    render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render back button', () => {
    render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

    expect(screen.getByLabelText(/목록으로 돌아가기/i)).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

    fireEvent.click(screen.getByText(/뒤로/i));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should render status badge for prototype', () => {
    render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('should render status badge for archived', () => {
    const archivedDoc: CompletedDocumentDetail = {
      ...mockDocument,
      status: 'archived',
      archivedAt: '2024-01-20T00:00:00.000Z',
    };

    render(<ReferenceDocDetail document={archivedDoc} onBack={mockOnBack} />);

    expect(screen.getByText('아카이브')).toBeInTheDocument();
  });

  it('should render references', () => {
    render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

    expect(screen.getByText('ref-1')).toBeInTheDocument();
    expect(screen.getByText('ref-2')).toBeInTheDocument();
  });

  it('should render date information', () => {
    render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

    expect(screen.getByText(/생성:/)).toBeInTheDocument();
    expect(screen.getByText(/수정:/)).toBeInTheDocument();
  });

  describe('Tabs', () => {
    it('should render all tabs', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      expect(screen.getByRole('tab', { name: /feature list/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /design doc/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /prd/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /prototype/i })).toBeInTheDocument();
    });

    it('should show feature list tab as selected by default', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      expect(screen.getByRole('tab', { name: /feature list/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('should render feature list content by default', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      // Feature List appears both as tab and as heading in content
      expect(screen.getAllByText('Feature List')).toHaveLength(2);
    });

    it('should switch tab when clicked', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      fireEvent.click(screen.getByRole('tab', { name: /design doc/i }));

      expect(screen.getByRole('tab', { name: /design doc/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('should disable tab when content is empty', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      const prototypeTab = screen.getByRole('tab', { name: /prototype/i });
      expect(prototypeTab).toBeDisabled();
    });

    it('should show empty message when no content for tab', () => {
      const docWithEmptyFeature: CompletedDocumentDetail = {
        ...mockDocument,
        featureList: '',
      };

      render(<ReferenceDocDetail document={docWithEmptyFeature} onBack={mockOnBack} />);

      expect(screen.getByText(/이 문서 유형에는 내용이 없습니다/i)).toBeInTheDocument();
    });
  });

  describe('Content rendering', () => {
    it('should render markdown content', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      // Check that markdown is rendered (Feature List heading should be present)
      expect(screen.getByRole('heading', { name: /feature list/i })).toBeInTheDocument();
    });

    it('should render design document when tab is clicked', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      fireEvent.click(screen.getByRole('tab', { name: /design doc/i }));

      expect(screen.getByRole('heading', { name: /design document/i })).toBeInTheDocument();
    });

    it('should render PRD when tab is clicked', () => {
      render(<ReferenceDocDetail document={mockDocument} onBack={mockOnBack} />);

      fireEvent.click(screen.getByRole('tab', { name: /prd/i }));

      expect(screen.getByRole('heading', { name: /prd/i })).toBeInTheDocument();
    });
  });
});
