/**
 * SideBySideView Component Tests
 * Tests for REQ-007: Side-by-side document comparison view
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SideBySideView } from '../SideBySideView';
import { useReferenceDocStore } from '../../../store/referenceDocStore';
import type { CompletedDocumentDetail } from '../../../types';

// Mock the store
vi.mock('../../../store/referenceDocStore', () => ({
  useReferenceDocStore: vi.fn(),
}));

// Mock DocumentPreview
vi.mock('../../document/DocumentPreview', () => ({
  DocumentPreview: ({ content }: { content: string }) => (
    <div data-testid="document-preview">{content}</div>
  ),
}));

const mockDocument: CompletedDocumentDetail = {
  taskId: 'task-1',
  title: 'Test Document',
  status: 'prototype',
  references: ['system-1'],
  featureList: '# Feature List\nContent here',
  designDocument: '# Design Doc\nDesign content',
  prd: '# PRD\nPRD content',
  prototype: null,
  qaAnswers: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-09T00:00:00Z',
};

describe('SideBySideView', () => {
  const mockCloseSideBySide = vi.fn();
  const mockSetSplitRatio = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useReferenceDocStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) =>
        selector({
          isSideBySideOpen: true,
          selectedDocument: mockDocument,
          splitRatio: 50,
          closeSideBySide: mockCloseSideBySide,
          setSplitRatio: mockSetSplitRatio,
        })
    );
  });

  describe('Rendering', () => {
    it('should render when isSideBySideOpen is true', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      expect(screen.getByTestId('side-by-side-view')).toBeInTheDocument();
    });

    it('should not render when isSideBySideOpen is false', () => {
      (useReferenceDocStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            isSideBySideOpen: false,
            selectedDocument: mockDocument,
            splitRatio: 50,
            closeSideBySide: mockCloseSideBySide,
            setSplitRatio: mockSetSplitRatio,
          })
      );

      render(
        <SideBySideView currentContent="# Current Document" />
      );

      expect(screen.queryByTestId('side-by-side-view')).not.toBeInTheDocument();
    });

    it('should render current document on left panel', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const leftPanel = screen.getByTestId('left-panel');
      expect(leftPanel).toBeInTheDocument();
      expect(screen.getByText('현재 문서')).toBeInTheDocument();
    });

    it('should render reference document on right panel', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const rightPanel = screen.getByTestId('right-panel');
      expect(rightPanel).toBeInTheDocument();
      expect(screen.getByText(/참조 문서/)).toBeInTheDocument();
    });

    it('should display reference document title', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      // Title appears in header and right panel
      const titleElements = screen.getAllByText(/Test Document/);
      expect(titleElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Close functionality', () => {
    it('should have close button', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const closeButton = screen.getByRole('button', { name: /닫기/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should call closeSideBySide when close button is clicked', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const closeButton = screen.getByRole('button', { name: /닫기/i });
      fireEvent.click(closeButton);

      expect(mockCloseSideBySide).toHaveBeenCalledTimes(1);
    });

    it('should call closeSideBySide when ESC key is pressed', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockCloseSideBySide).toHaveBeenCalledTimes(1);
    });
  });

  describe('Split ratio', () => {
    it('should render divider for resizing', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const divider = screen.getByTestId('split-divider');
      expect(divider).toBeInTheDocument();
    });

    it('should apply correct split ratio to panels', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const leftPanel = screen.getByTestId('left-panel');
      const rightPanel = screen.getByTestId('right-panel');

      expect(leftPanel).toHaveStyle({ width: '50%' });
      expect(rightPanel).toHaveStyle({ width: '50%' });
    });

    it('should apply different split ratio', () => {
      (useReferenceDocStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            isSideBySideOpen: true,
            selectedDocument: mockDocument,
            splitRatio: 60,
            closeSideBySide: mockCloseSideBySide,
            setSplitRatio: mockSetSplitRatio,
          })
      );

      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const leftPanel = screen.getByTestId('left-panel');
      const rightPanel = screen.getByTestId('right-panel');

      expect(leftPanel).toHaveStyle({ width: '60%' });
      expect(rightPanel).toHaveStyle({ width: '40%' });
    });
  });

  describe('Document tabs', () => {
    it('should render document type tabs', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      expect(screen.getByRole('tab', { name: 'Feature List' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Design Doc' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'PRD' })).toBeInTheDocument();
    });

    it('should switch document content when tab is clicked', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      const designTab = screen.getByRole('tab', { name: 'Design Doc' });
      fireEvent.click(designTab);

      const previews = screen.getAllByTestId('document-preview');
      expect(previews[1].textContent).toContain('Design content');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      expect(screen.getByRole('button', { name: /닫기/i })).toHaveAttribute(
        'aria-label',
        '나란히 보기 닫기'
      );
    });

    it('should have proper role on container', () => {
      render(
        <SideBySideView currentContent="# Current Document" />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('No document selected', () => {
    it('should not render when no document is selected', () => {
      (useReferenceDocStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) =>
          selector({
            isSideBySideOpen: true,
            selectedDocument: null,
            splitRatio: 50,
            closeSideBySide: mockCloseSideBySide,
            setSplitRatio: mockSetSplitRatio,
          })
      );

      render(
        <SideBySideView currentContent="# Current Document" />
      );

      expect(screen.queryByTestId('side-by-side-view')).not.toBeInTheDocument();
    });
  });
});
