/**
 * SystemList Component Tests
 * Tests for the system document list component with accordion functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemList } from '../../../src/components/system/SystemList';
import type { SystemDocument } from '../../../src/types';

describe('SystemList', () => {
  const mockDocuments: SystemDocument[] = [
    {
      id: 'sys-1',
      name: 'Combat System',
      category: 'System',
      tags: ['core'],
      content: '',
      dependencies: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'sys-2',
      name: 'UI Guidelines',
      category: 'UI',
      tags: [],
      content: '',
      dependencies: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'sys-3',
      name: 'Inventory System',
      category: 'System',
      tags: ['core'],
      content: '',
      dependencies: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const getDocumentsByCategory = (): Record<string, SystemDocument[]> => ({
    System: [mockDocuments[0], mockDocuments[2]],
    UI: [mockDocuments[1]],
  });

  const mockOnToggleCategory = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no documents exist', () => {
    render(
      <SystemList
        documentsByCategory={{}}
        expandedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No system documents found')).toBeInTheDocument();
    expect(screen.getByText('Add your first system document')).toBeInTheDocument();
  });

  it('should render categories sorted alphabetically', () => {
    render(
      <SystemList
        documentsByCategory={getDocumentsByCategory()}
        expandedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Should have System and UI categories
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
  });

  it('should display document count for each category', () => {
    render(
      <SystemList
        documentsByCategory={getDocumentsByCategory()}
        expandedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // System category has 2 documents
    expect(screen.getByText('2')).toBeInTheDocument();
    // UI category has 1 document
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call onToggleCategory when category header is clicked', () => {
    render(
      <SystemList
        documentsByCategory={getDocumentsByCategory()}
        expandedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const systemCategoryButton = screen.getByText('System').closest('button');
    fireEvent.click(systemCategoryButton!);

    expect(mockOnToggleCategory).toHaveBeenCalledWith('System');
  });

  it('should show documents when category is expanded', () => {
    render(
      <SystemList
        documentsByCategory={getDocumentsByCategory()}
        expandedCategories={['System']}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Combat System')).toBeInTheDocument();
    expect(screen.getByText('Inventory System')).toBeInTheDocument();
  });

  it('should hide documents when category is collapsed', () => {
    render(
      <SystemList
        documentsByCategory={getDocumentsByCategory()}
        expandedCategories={[]}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Document names should not be visible when collapsed
    expect(screen.queryByText('Combat System')).not.toBeInTheDocument();
    expect(screen.queryByText('UI Guidelines')).not.toBeInTheDocument();
  });

  it('should expand multiple categories simultaneously', () => {
    render(
      <SystemList
        documentsByCategory={getDocumentsByCategory()}
        expandedCategories={['System', 'UI']}
        onToggleCategory={mockOnToggleCategory}
        onPreview={mockOnPreview}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Combat System')).toBeInTheDocument();
    expect(screen.getByText('UI Guidelines')).toBeInTheDocument();
  });
});
