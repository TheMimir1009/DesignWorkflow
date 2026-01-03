/**
 * SystemSidebar Component Tests
 * TDD test suite for sidebar with checkbox reference selection
 * TAG-005: SystemSidebar extension
 * TAG-006: SystemSidebar advanced features (search, tag filter, preview, collapse mode)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemSidebar } from '../../../src/components/system/SystemSidebar';
import { useSystemStore } from '../../../src/store/systemStore';
import { useReferenceStore } from '../../../src/store/referenceStore';
import type { SystemDocument } from '../../../src/types';

// Mock the stores
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn(),
}));

vi.mock('../../../src/store/referenceStore', () => ({
  useReferenceStore: vi.fn(),
}));

// Mock callback for preview
const mockOnPreviewDocument = vi.fn();

// Test data factory
const createMockDocument = (overrides: Partial<SystemDocument> = {}): SystemDocument => ({
  id: 'doc-1',
  projectId: 'project-1',
  name: 'Test Document',
  category: 'design',
  tags: ['test', 'sample'],
  content: 'Test content',
  dependencies: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('SystemSidebar', () => {
  const mockGetDocumentsByCategory = vi.fn();
  const mockAddReference = vi.fn();
  const mockRemoveReference = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      documents: [],
      getDocumentsByCategory: mockGetDocumentsByCategory,
      searchDocuments: vi.fn(() => []),
      filterByTags: vi.fn(() => []),
    });

    (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedReferences: [],
      addReference: mockAddReference,
      removeReference: mockRemoveReference,
    });

    mockGetDocumentsByCategory.mockReturnValue({});
    mockOnPreviewDocument.mockClear();
  });

  describe('Rendering', () => {
    it('should render the sidebar container', () => {
      render(<SystemSidebar />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render title "시스템 문서"', () => {
      render(<SystemSidebar />);

      expect(screen.getByText(/시스템 문서/i)).toBeInTheDocument();
    });

    it('should display empty state when no documents', () => {
      mockGetDocumentsByCategory.mockReturnValue({});

      render(<SystemSidebar />);

      expect(screen.getByText(/문서가 없습니다/i)).toBeInTheDocument();
    });

    it('should display categories with documents', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Design Doc 1', category: 'design' }),
          createMockDocument({ id: 'doc-2', name: 'Design Doc 2', category: 'design' }),
        ],
        economy: [
          createMockDocument({ id: 'doc-3', name: 'Economy Doc', category: 'economy' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      expect(screen.getByText('design')).toBeInTheDocument();
      expect(screen.getByText('economy')).toBeInTheDocument();
    });

    it('should display document names within categories', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design Document', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      expect(screen.getByText('Game Design Document')).toBeInTheDocument();
    });
  });

  describe('Checkbox Selection', () => {
    it('should render checkbox before each document item', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' }),
          createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
    });

    it('should have unchecked checkbox by default', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should have checked checkbox when document is in selectedReferences', () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' });
      const mockDocs = {
        design: [mockDoc],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
        removeReference: mockRemoveReference,
      });

      render(<SystemSidebar />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should call addReference when checking an unchecked document', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' });
      const mockDocs = {
        design: [mockDoc],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockAddReference).toHaveBeenCalledWith(mockDoc);
    });

    it('should call removeReference when unchecking a checked document', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' });
      const mockDocs = {
        design: [mockDoc],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
        removeReference: mockRemoveReference,
      });

      render(<SystemSidebar />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockRemoveReference).toHaveBeenCalledWith('doc-1');
    });

    it('should have proper accessible name for checkbox', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      expect(screen.getByRole('checkbox', { name: /game design/i })).toBeInTheDocument();
    });
  });

  describe('Category Collapse/Expand', () => {
    it('should render collapse/expand toggle for each category', () => {
      const mockDocs = {
        design: [createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' })],
        economy: [createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'economy' })],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const categoryButtons = screen.getAllByRole('button', { name: /toggle/i });
      expect(categoryButtons).toHaveLength(2);
    });

    it('should show documents by default (expanded)', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      expect(screen.getByText('Game Design')).toBeVisible();
    });

    it('should hide documents when category is collapsed', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      // Click collapse button
      const collapseButton = screen.getByRole('button', { name: /toggle design/i });
      await user.click(collapseButton);

      // Document should not be in the DOM when collapsed (conditional rendering)
      expect(screen.queryByText('Game Design')).not.toBeInTheDocument();
    });

    it('should show documents again when category is expanded', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const collapseButton = screen.getByRole('button', { name: /toggle design/i });

      // Collapse
      await user.click(collapseButton);
      expect(screen.queryByText('Game Design')).not.toBeInTheDocument();

      // Expand
      await user.click(collapseButton);
      expect(screen.getByText('Game Design')).toBeInTheDocument();
    });

    it('should maintain independent collapse state for each category', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [createMockDocument({ id: 'doc-1', name: 'Design Doc', category: 'design' })],
        economy: [createMockDocument({ id: 'doc-2', name: 'Economy Doc', category: 'economy' })],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      // Collapse only design category
      const designButton = screen.getByRole('button', { name: /toggle design/i });
      await user.click(designButton);

      // Design docs should not be in DOM, economy docs should be visible
      expect(screen.queryByText('Design Doc')).not.toBeInTheDocument();
      expect(screen.getByText('Economy Doc')).toBeInTheDocument();
    });
  });

  describe('Selection Indicator', () => {
    it('should display selected count in category header', () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' });
      const mockDocs = {
        design: [
          mockDoc,
          createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
        removeReference: mockRemoveReference,
      });

      render(<SystemSidebar />);

      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('should highlight selected items visually', () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' });
      const mockDocs = {
        design: [mockDoc],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
        removeReference: mockRemoveReference,
      });

      render(<SystemSidebar />);

      // The document item should have a selected style
      const docItem = screen.getByText('Doc 1').closest('li');
      expect(docItem).toHaveClass('bg-blue-900/30');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role for sidebar', () => {
      render(<SystemSidebar />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should have proper heading for sidebar title', () => {
      render(<SystemSidebar />);

      expect(screen.getByRole('heading', { name: /시스템 문서/i })).toBeInTheDocument();
    });

    it('should have accessible labels for category buttons', () => {
      const mockDocs = {
        design: [createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' })],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      expect(screen.getByRole('button', { name: /toggle design/i })).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply Tailwind CSS classes to sidebar', () => {
      render(<SystemSidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('bg-gray-900');
    });

    it('should apply hover styles to document items', () => {
      const mockDocs = {
        design: [createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' })],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const docItem = screen.getByText('Doc 1').closest('li');
      expect(docItem).toHaveClass('hover:bg-gray-800');
    });
  });

  // TAG-008: Save as Default Button
  describe('TAG-008: Save as Default Button', () => {
    // TASK-035: Add "기본값으로 저장" button to UI
    it('should render "기본값으로 저장" button when projectId is provided', () => {
      render(<SystemSidebar projectId="project-1" />);

      const saveButton = screen.getByRole('button', { name: /기본값으로 저장/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should not render "기본값으로 저장" button when no projectId', () => {
      render(<SystemSidebar />);

      expect(screen.queryByRole('button', { name: /기본값으로 저장/i })).not.toBeInTheDocument();
    });

    it('should call saveAsDefault when button is clicked', async () => {
      const user = userEvent.setup();
      const mockSaveAsDefault = vi.fn();

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [],
        addReference: mockAddReference,
        removeReference: mockRemoveReference,
        saveAsDefault: mockSaveAsDefault,
      });

      render(<SystemSidebar projectId="project-1" />);

      const saveButton = screen.getByRole('button', { name: /기본값으로 저장/i });
      await user.click(saveButton);

      expect(mockSaveAsDefault).toHaveBeenCalledWith('project-1');
    });

    it('should hide button in collapsed mode', async () => {
      const user = userEvent.setup();
      render(<SystemSidebar projectId="project-1" />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });
      await user.click(collapseToggle);

      expect(screen.queryByRole('button', { name: /기본값으로 저장/i })).not.toBeInTheDocument();
    });
  });

  // TAG-006: Advanced Features
  describe('TAG-006: Search Input', () => {
    // TASK-025: Add search input to sidebar header
    it('should render search input in sidebar header', () => {
      render(<SystemSidebar />);

      const searchInput = screen.getByPlaceholderText(/검색/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should filter documents when typing in search input', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
          createMockDocument({ id: 'doc-2', name: 'Level Design', category: 'design' }),
        ],
        economy: [
          createMockDocument({ id: 'doc-3', name: 'Economy Balance', category: 'economy' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      const mockSearchDocuments = vi.fn((query: string) => {
        if (query.toLowerCase() === 'game') {
          return [mockDocs.design[0]];
        }
        return [];
      });

      (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        documents: [...mockDocs.design, ...mockDocs.economy],
        getDocumentsByCategory: mockGetDocumentsByCategory,
        searchDocuments: mockSearchDocuments,
        filterByTags: vi.fn(() => []),
      });

      render(<SystemSidebar />);

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, 'game');

      // Should only show matching document
      expect(screen.getByText('Game Design')).toBeInTheDocument();
      expect(screen.queryByText('Level Design')).not.toBeInTheDocument();
      expect(screen.queryByText('Economy Balance')).not.toBeInTheDocument();
    });

    it('should show all documents when search is cleared', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, 'game');
      await user.clear(searchInput);

      expect(screen.getByText('Game Design')).toBeInTheDocument();
    });

    it('should have clear button when search has text', async () => {
      const user = userEvent.setup();
      render(<SystemSidebar />);

      const searchInput = screen.getByPlaceholderText(/검색/i);
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: /검색어 지우기|clear/i });
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('TAG-006: Tag Filter', () => {
    // TASK-026: Add tag filter functionality
    it('should display unique tags as filter buttons', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design', tags: ['gameplay', 'combat'] }),
          createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'design', tags: ['gameplay', 'economy'] }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        documents: mockDocs.design,
        getDocumentsByCategory: mockGetDocumentsByCategory,
        searchDocuments: vi.fn(() => []),
        filterByTags: vi.fn(() => []),
      });

      render(<SystemSidebar />);

      // Should display unique tags
      expect(screen.getByRole('button', { name: /gameplay/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /combat/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /economy/i })).toBeInTheDocument();
    });

    it('should filter documents when tag is clicked', async () => {
      const user = userEvent.setup();
      const doc1 = createMockDocument({ id: 'doc-1', name: 'Combat Doc', category: 'design', tags: ['combat'] });
      const doc2 = createMockDocument({ id: 'doc-2', name: 'Economy Doc', category: 'design', tags: ['economy'] });
      const mockDocs = {
        design: [doc1, doc2],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      const mockFilterByTags = vi.fn((tags: string[]) => {
        if (tags.includes('combat')) {
          return [doc1];
        }
        return [];
      });

      (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        documents: mockDocs.design,
        getDocumentsByCategory: mockGetDocumentsByCategory,
        searchDocuments: vi.fn(() => []),
        filterByTags: mockFilterByTags,
      });

      render(<SystemSidebar />);

      const combatTagButton = screen.getByRole('button', { name: /combat/i });
      await user.click(combatTagButton);

      // Should show only combat doc
      expect(screen.getByText('Combat Doc')).toBeInTheDocument();
      expect(screen.queryByText('Economy Doc')).not.toBeInTheDocument();
    });

    it('should toggle tag filter when clicked again', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design', tags: ['combat'] }),
          createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'design', tags: ['economy'] }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        documents: mockDocs.design,
        getDocumentsByCategory: mockGetDocumentsByCategory,
        searchDocuments: vi.fn(() => []),
        filterByTags: vi.fn(() => mockDocs.design),
      });

      render(<SystemSidebar />);

      const combatTagButton = screen.getByRole('button', { name: /combat/i });

      // Click to filter
      await user.click(combatTagButton);
      expect(combatTagButton).toHaveClass('bg-blue-600');

      // Click again to clear filter
      await user.click(combatTagButton);
      expect(combatTagButton).not.toHaveClass('bg-blue-600');
    });

    it('should highlight selected tag', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design', tags: ['combat'] }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        documents: mockDocs.design,
        getDocumentsByCategory: mockGetDocumentsByCategory,
        searchDocuments: vi.fn(() => []),
        filterByTags: vi.fn(() => mockDocs.design),
      });

      render(<SystemSidebar />);

      const combatTagButton = screen.getByRole('button', { name: /combat/i });
      await user.click(combatTagButton);

      expect(combatTagButton).toHaveClass('bg-blue-600');
    });
  });

  describe('TAG-006: Preview Button', () => {
    // TASK-027: Add eye button (preview trigger) to each item
    it('should render preview button (eye icon) for each document', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' }),
          createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar onPreviewDocument={mockOnPreviewDocument} />);

      const previewButtons = screen.getAllByRole('button', { name: /미리보기|preview/i });
      expect(previewButtons).toHaveLength(2);
    });

    it('should call onPreviewDocument when preview button is clicked', async () => {
      const user = userEvent.setup();
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' });
      const mockDocs = {
        design: [mockDoc],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar onPreviewDocument={mockOnPreviewDocument} />);

      const previewButton = screen.getByRole('button', { name: /미리보기|preview/i });
      await user.click(previewButton);

      expect(mockOnPreviewDocument).toHaveBeenCalledWith(mockDoc);
    });

    it('should have proper accessible label for preview button', () => {
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar onPreviewDocument={mockOnPreviewDocument} />);

      expect(screen.getByRole('button', { name: /game design.*미리보기|preview.*game design/i })).toBeInTheDocument();
    });
  });

  describe('TAG-006: Collapsed Mode', () => {
    // TASK-028: Add collapsed mode UI (icons only)
    it('should render collapse toggle button for sidebar', () => {
      render(<SystemSidebar />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });
      expect(collapseToggle).toBeInTheDocument();
    });

    it('should collapse sidebar to icons only when toggle is clicked', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design Document', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });
      await user.click(collapseToggle);

      // Sidebar should be collapsed - document name should not be visible
      expect(screen.queryByText('Game Design Document')).not.toBeInTheDocument();

      // Category icons should still be visible
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('w-16');
    });

    it('should expand sidebar when toggle is clicked again', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Game Design Document', category: 'design' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });

      // Collapse
      await user.click(collapseToggle);
      expect(screen.queryByText('Game Design Document')).not.toBeInTheDocument();

      // Expand
      const expandToggle = screen.getByRole('button', { name: /사이드바.*펼치기|expand.*sidebar/i });
      await user.click(expandToggle);
      expect(screen.getByText('Game Design Document')).toBeInTheDocument();
    });

    it('should show category icons in collapsed mode', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' }),
        ],
        economy: [
          createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'economy' }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      render(<SystemSidebar />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });
      await user.click(collapseToggle);

      // Category toggle buttons should still be accessible
      const designButton = screen.getByRole('button', { name: /toggle design/i });
      const economyButton = screen.getByRole('button', { name: /toggle economy/i });
      expect(designButton).toBeInTheDocument();
      expect(economyButton).toBeInTheDocument();
    });

    it('should hide search input in collapsed mode', async () => {
      const user = userEvent.setup();
      render(<SystemSidebar />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });
      await user.click(collapseToggle);

      expect(screen.queryByPlaceholderText(/검색/i)).not.toBeInTheDocument();
    });

    it('should hide tag filters in collapsed mode', async () => {
      const user = userEvent.setup();
      const mockDocs = {
        design: [
          createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design', tags: ['combat'] }),
        ],
      };
      mockGetDocumentsByCategory.mockReturnValue(mockDocs);

      (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        documents: mockDocs.design,
        getDocumentsByCategory: mockGetDocumentsByCategory,
        searchDocuments: vi.fn(() => []),
        filterByTags: vi.fn(() => []),
      });

      render(<SystemSidebar />);

      const collapseToggle = screen.getByRole('button', { name: /사이드바.*접기|collapse.*sidebar/i });
      await user.click(collapseToggle);

      expect(screen.queryByRole('button', { name: /combat/i })).not.toBeInTheDocument();
    });
  });
});
