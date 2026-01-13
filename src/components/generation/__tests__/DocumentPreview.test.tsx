/**
 * Test Suite: DocumentPreview Component (Generation Context)
 * TDD implementation for markdown document preview in generation workflow
 *
 * Requirements covered:
 * - REQ-UI-007: Render generated document preview
 * - REQ-UI-008: Support copy to clipboard
 * - REQ-UI-009: Support document download
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenerationDocumentPreview } from '../DocumentPreview';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('GenerationDocumentPreview', () => {
  describe('basic rendering', () => {
    it('should render markdown content', () => {
      render(<GenerationDocumentPreview content="# Hello World" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
    });

    it('should render document title when provided', () => {
      render(
        <GenerationDocumentPreview
          content="Content here"
          title="Design Document"
        />
      );
      expect(screen.getByText('Design Document')).toBeInTheDocument();
    });

    it('should show empty state message when no content', () => {
      render(<GenerationDocumentPreview content="" />);
      expect(screen.getByText(/no content|empty/i)).toBeInTheDocument();
    });
  });

  describe('markdown rendering', () => {
    it('should render headings correctly', () => {
      const markdown = `# H1
## H2
### H3`;
      render(<GenerationDocumentPreview content={markdown} />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should render code blocks with syntax highlighting', () => {
      const markdown = `\`\`\`typescript
const x: number = 1;
\`\`\``;
      render(<GenerationDocumentPreview content={markdown} />);
      expect(screen.getByText('const x: number = 1;')).toBeInTheDocument();
    });

    it('should render tables', () => {
      const markdown = `
| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
`;
      render(<GenerationDocumentPreview content={markdown} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render lists', () => {
      const markdown = `
- Item 1
- Item 2
- Item 3
`;
      render(<GenerationDocumentPreview content={markdown} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  describe('copy functionality', () => {
    it('should render copy button', () => {
      render(<GenerationDocumentPreview content="Content" />);
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('should copy content to clipboard when copy clicked', async () => {
      render(<GenerationDocumentPreview content="Copy this content" />);

      fireEvent.click(screen.getByRole('button', { name: /copy/i }));

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Copy this content');
      });
    });

    it('should show success feedback after copy', async () => {
      render(<GenerationDocumentPreview content="Content" />);

      fireEvent.click(screen.getByRole('button', { name: /copy/i }));

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('should handle copy failure gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));

      render(<GenerationDocumentPreview content="Content" />);
      fireEvent.click(screen.getByRole('button', { name: /copy/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed|error/i)).toBeInTheDocument();
      });
    });
  });

  describe('download functionality', () => {
    it('should render download button', () => {
      render(<GenerationDocumentPreview content="Content" showDownload />);
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should not render download button when showDownload is false', () => {
      render(<GenerationDocumentPreview content="Content" showDownload={false} />);
      expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
    });

    it('should trigger download when button clicked', () => {
      // Mock URL methods
      const createObjectURL = vi.fn(() => 'blob:url');
      const revokeObjectURL = vi.fn();
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;

      render(
        <GenerationDocumentPreview
          content="Content"
          showDownload
          filename="design-document.md"
        />
      );

      // Click download button - verify URL.createObjectURL is called for blob creation
      fireEvent.click(screen.getByRole('button', { name: /download/i }));

      expect(createObjectURL).toHaveBeenCalled();
    });
  });

  describe('document type display', () => {
    it('should show document type badge', () => {
      render(
        <GenerationDocumentPreview
          content="Content"
          documentType="design-document"
        />
      );
      expect(screen.getByText(/design document/i)).toBeInTheDocument();
    });

    it('should show PRD badge for PRD type', () => {
      render(
        <GenerationDocumentPreview
          content="Content"
          documentType="prd"
        />
      );
      expect(screen.getByText(/PRD/i)).toBeInTheDocument();
    });

    it('should show prototype badge for prototype type', () => {
      render(
        <GenerationDocumentPreview
          content="<html></html>"
          documentType="prototype"
        />
      );
      expect(screen.getByText(/prototype/i)).toBeInTheDocument();
    });
  });

  describe('HTML prototype preview', () => {
    it('should render HTML content in iframe when documentType is prototype', () => {
      render(
        <GenerationDocumentPreview
          content="<html><body>Hello</body></html>"
          documentType="prototype"
        />
      );
      expect(screen.getByTitle(/prototype preview/i)).toBeInTheDocument();
    });

    it('should have sandbox attribute on iframe for security', () => {
      render(
        <GenerationDocumentPreview
          content="<html></html>"
          documentType="prototype"
        />
      );
      const iframe = screen.getByTitle(/prototype preview/i);
      expect(iframe).toHaveAttribute('sandbox');
    });
  });

  describe('styling and layout', () => {
    it('should apply custom className', () => {
      render(
        <GenerationDocumentPreview
          content="Content"
          className="custom-preview"
        />
      );
      const container = screen.getByTestId('generation-document-preview');
      expect(container).toHaveClass('custom-preview');
    });

    it('should have prose styling for markdown', () => {
      render(<GenerationDocumentPreview content="Content" />);
      const previewArea = screen.getByTestId('preview-content');
      expect(previewArea).toHaveClass('prose');
    });

    it('should have max-height with scroll', () => {
      render(
        <GenerationDocumentPreview
          content="Long content"
          maxHeight="400px"
        />
      );
      const container = screen.getByTestId('generation-document-preview');
      expect(container).toHaveStyle({ maxHeight: '400px' });
    });
  });

  describe('accessibility', () => {
    it('should have appropriate aria labels', () => {
      render(
        <GenerationDocumentPreview
          content="Content"
          title="Design Document"
        />
      );
      expect(screen.getByLabelText(/design document preview/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<GenerationDocumentPreview content="Content" />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      copyButton.focus();
      expect(copyButton).toHaveFocus();
    });
  });
});
