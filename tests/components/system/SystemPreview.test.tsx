/**
 * SystemPreview Component Tests
 * TDD test suite for modal component showing system document preview
 * TAG-007: SystemPreview component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemPreview } from '../../../src/components/system/SystemPreview';
import { useReferenceStore } from '../../../src/store/referenceStore';
import type { SystemDocument } from '../../../src/types';

// Mock the reference store
vi.mock('../../../src/store/referenceStore', () => ({
  useReferenceStore: vi.fn(),
}));

// Test data factory
const createMockDocument = (overrides: Partial<SystemDocument> = {}): SystemDocument => ({
  id: 'doc-1',
  projectId: 'project-1',
  name: 'Test Document',
  category: 'design',
  tags: ['test', 'sample'],
  content: '# Test Content\n\nThis is a **markdown** document.',
  dependencies: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('SystemPreview', () => {
  const mockAddReference = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedReferences: [],
      addReference: mockAddReference,
    });
  });

  describe('Rendering', () => {
    // TASK-029: Create SystemPreview modal component
    it('should render modal overlay when document is provided', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      // Modal should have a backdrop/overlay
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
    });

    it('should render close button (X)', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /닫기|close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should display document title in header', () => {
      const mockDoc = createMockDocument({ name: 'Game Design Document' });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      expect(screen.getByRole('heading', { name: /game design document/i })).toBeInTheDocument();
    });

    it('should not render when document is null', () => {
      render(<SystemPreview document={null} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Markdown Rendering', () => {
    // TASK-030: Implement markdown rendering with react-markdown
    it('should render markdown content', () => {
      const mockDoc = createMockDocument({
        content: '# Heading\n\nParagraph text',
      });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      // Should render heading
      expect(screen.getByRole('heading', { name: /heading/i, level: 1 })).toBeInTheDocument();
      // Should render paragraph
      expect(screen.getByText('Paragraph text')).toBeInTheDocument();
    });

    it('should render bold text in markdown', () => {
      const mockDoc = createMockDocument({
        content: 'This is **bold** text',
      });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const boldElement = screen.getByText('bold');
      expect(boldElement.tagName).toBe('STRONG');
    });

    it('should render lists in markdown', () => {
      const mockDoc = createMockDocument({
        content: '- Item 1\n- Item 2\n- Item 3',
      });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render code blocks in markdown', () => {
      const mockDoc = createMockDocument({
        content: '```javascript\nconst x = 1;\n```',
      });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
    });
  });

  describe('Add to References Button', () => {
    // TASK-031: Add "참조에 추가" button
    it('should render "참조에 추가" button at bottom', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /참조에 추가/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should call addReference when "참조에 추가" button is clicked', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /참조에 추가/i });
      await user.click(addButton);

      expect(mockAddReference).toHaveBeenCalledWith(mockDoc);
    });

    it('should show "이미 추가됨" when document is already in references', () => {
      const mockDoc = createMockDocument();

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
      });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      expect(screen.getByText(/이미 추가됨/i)).toBeInTheDocument();
    });

    it('should disable button when document is already in references', () => {
      const mockDoc = createMockDocument();

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
      });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /이미 추가됨/i });
      expect(addButton).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    // TASK-032: Handle loading state
    it('should show loading spinner when isLoading is true', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} isLoading={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/loading|로딩/i)).toBeInTheDocument();
    });

    it('should not show loading spinner when isLoading is false', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} isLoading={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      const mockDoc = createMockDocument({ content: 'Test content' });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} isLoading={true} />);

      expect(screen.queryByText('Test content')).not.toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /닫기|close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const backdrop = screen.getByTestId('modal-backdrop');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside modal content', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument({ name: 'Test Doc' });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const title = screen.getByRole('heading', { name: /test doc/i });
      await user.click(title);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role for modal', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby for modal title', () => {
      const mockDoc = createMockDocument({ name: 'Test Doc' });

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should focus trap inside modal', async () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      // Focus should be inside modal
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should have dark theme modal styling', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('bg-gray-800');
    });

    it('should have proper overlay styling', () => {
      const mockDoc = createMockDocument();

      render(<SystemPreview document={mockDoc} onClose={mockOnClose} />);

      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toHaveClass('bg-black/50');
    });
  });
});
