/**
 * SystemPreview Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemPreview } from '../../../src/components/system/SystemPreview';
import type { SystemDocument } from '../../../src/types';

describe('SystemPreview', () => {
  const mockDocument: SystemDocument = {
    id: 'system-1',
    projectId: 'project-1',
    name: 'Combat System',
    category: 'Core Mechanics',
    tags: ['combat', 'action', 'rpg'],
    content: '# Combat System\n\nThis is a **bold** statement.\n\n## Overview\n\nThe combat system uses `action points`.',
    dependencies: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const defaultProps = {
    systemDoc: mockDocument,
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<SystemPreview {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('system-preview-modal')).not.toBeInTheDocument();
    });

    it('should not render when systemDoc is null', () => {
      render(<SystemPreview {...defaultProps} systemDoc={null} />);

      expect(screen.queryByTestId('system-preview-modal')).not.toBeInTheDocument();
    });

    it('should render modal when open with document', () => {
      render(<SystemPreview {...defaultProps} />);

      expect(screen.getByTestId('system-preview-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display document name and category', () => {
      render(<SystemPreview {...defaultProps} />);

      // Document name appears in title (h2) and markdown content (h1)
      expect(screen.getAllByText('Combat System').length).toBeGreaterThanOrEqual(1);
      // Category appears in header
      expect(screen.getByText('Core Mechanics')).toBeInTheDocument();
    });

    it('should display tags', () => {
      render(<SystemPreview {...defaultProps} />);

      expect(screen.getByText('combat')).toBeInTheDocument();
      expect(screen.getByText('action')).toBeInTheDocument();
      expect(screen.getByText('rpg')).toBeInTheDocument();
    });

    it('should not display tags section when no tags', () => {
      const docWithoutTags = { ...mockDocument, tags: [] };
      render(<SystemPreview {...defaultProps} systemDoc={docWithoutTags} />);

      expect(screen.queryByText('combat')).not.toBeInTheDocument();
    });

    it('should display "No content" when content is empty', () => {
      const docWithoutContent = { ...mockDocument, content: '' };
      render(<SystemPreview {...defaultProps} systemDoc={docWithoutContent} />);

      expect(screen.getByText('No content')).toBeInTheDocument();
    });

    it('should render markdown content', () => {
      render(<SystemPreview {...defaultProps} />);

      // Check that markdown content is rendered (bold text)
      expect(screen.getByText('bold')).toBeInTheDocument();
      // Check inline code
      expect(screen.getByText('action points')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button clicked', async () => {
      render(<SystemPreview {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close preview/i });
      await userEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when footer close button clicked', async () => {
      render(<SystemPreview {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /^close$/i });
      await userEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', async () => {
      render(<SystemPreview {...defaultProps} />);

      const backdrop = screen.getByTestId('system-preview-modal');
      await userEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when dialog content clicked', async () => {
      render(<SystemPreview {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      await userEvent.click(dialog);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key pressed', () => {
      render(<SystemPreview {...defaultProps} />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<SystemPreview {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have labeled title', () => {
      render(<SystemPreview {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');

      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeTruthy();
    });
  });
});
