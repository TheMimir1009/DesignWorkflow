/**
 * SystemCard Component Tests
 * Tests for the system document card component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemCard } from '../../../src/components/system/SystemCard';
import type { SystemDocument } from '../../../src/types';

describe('SystemCard', () => {
  const mockDocument: SystemDocument = {
    id: 'sys-1',
    name: 'Test Document',
    category: 'System',
    tags: ['core', 'rules'],
    content: '# Test Content',
    dependencies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  const mockOnPreview = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render document name', () => {
    render(
      <SystemCard
        document={mockDocument}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('should render document tags', () => {
    render(
      <SystemCard
        document={mockDocument}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('core')).toBeInTheDocument();
    expect(screen.getByText('rules')).toBeInTheDocument();
  });

  it('should call onPreview when preview button is clicked', () => {
    render(
      <SystemCard
        document={mockDocument}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const previewButton = screen.getByLabelText('Preview Test Document');
    fireEvent.click(previewButton);

    expect(mockOnPreview).toHaveBeenCalledWith(mockDocument);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <SystemCard
        document={mockDocument}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByLabelText('Edit Test Document');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockDocument);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <SystemCard
        document={mockDocument}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Delete Test Document');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockDocument);
  });

  it('should render without tags when document has no tags', () => {
    const docWithoutTags = { ...mockDocument, tags: [] };

    render(
      <SystemCard
        document={docWithoutTags}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Document')).toBeInTheDocument();
    // Tags container should not be visible when empty
    expect(screen.queryByText('core')).not.toBeInTheDocument();
  });
});
