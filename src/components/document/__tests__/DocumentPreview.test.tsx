/**
 * DocumentPreview Component Tests
 * TAG-DOC-001: Read-only markdown rendering component
 *
 * Test Cases:
 * - TC-DOC-001: Renders markdown content correctly
 * - TC-DOC-002: Handles empty content gracefully
 * - TC-DOC-003: Renders GFM features (tables, checkboxes)
 * - TC-DOC-004: Handles malformed markdown without crashing
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentPreview } from '../DocumentPreview';

describe('DocumentPreview', () => {
  describe('TC-DOC-001: Renders markdown content correctly', () => {
    it('should render basic markdown text', () => {
      render(<DocumentPreview content="Hello World" />);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render headings correctly', () => {
      const markdown = `# Heading 1

## Heading 2`;
      render(<DocumentPreview content={markdown} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2');
    });

    it('should render bold and italic text', () => {
      render(<DocumentPreview content="**bold** and *italic*" />);
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('should render links', () => {
      render(<DocumentPreview content="[Link Text](https://example.com)" />);
      const link = screen.getByRole('link', { name: 'Link Text' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should render code blocks', () => {
      const codeBlock = `\`\`\`javascript
const x = 1;
\`\`\``;
      render(<DocumentPreview content={codeBlock} />);
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('should render bullet lists', () => {
      const listMarkdown = `- Item 1
- Item 2
- Item 3`;
      render(<DocumentPreview content={listMarkdown} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  describe('TC-DOC-002: Handles empty content gracefully', () => {
    it('should render without crashing when content is empty string', () => {
      render(<DocumentPreview content="" />);
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    it('should render whitespace-only content gracefully', () => {
      render(<DocumentPreview content="   \n\n   " />);
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });
  });

  describe('TC-DOC-003: Renders GFM features', () => {
    it('should render tables', () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
      render(<DocumentPreview content={tableMarkdown} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header + 2 data rows
    });

    it('should render task list checkboxes', () => {
      const taskListMarkdown = `
- [x] Completed task
- [ ] Incomplete task
`;
      render(<DocumentPreview content={taskListMarkdown} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should render strikethrough text', () => {
      render(<DocumentPreview content="~~strikethrough~~" />);
      const strikethrough = screen.getByText('strikethrough');
      expect(strikethrough.tagName).toBe('DEL');
    });

    it('should render autolinked URLs', () => {
      render(<DocumentPreview content="Visit https://example.com for more info" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('TC-DOC-004: Handles malformed markdown without crashing', () => {
    it('should handle unclosed code blocks', () => {
      render(<DocumentPreview content="```javascript\nconst x = 1;" />);
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    it('should handle unmatched brackets', () => {
      render(<DocumentPreview content="[Broken link(https://example.com" />);
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    it('should handle deeply nested lists', () => {
      const deepList = `
- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
`;
      render(<DocumentPreview content={deepList} />);
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<DocumentPreview content="<script>alert('xss')</script>" />);
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
      // Script should not be rendered as executable HTML
      expect(screen.queryByRole('script')).not.toBeInTheDocument();
    });
  });

  describe('Props and styling', () => {
    it('should apply custom className', () => {
      render(<DocumentPreview content="Test" className="custom-class" />);
      const preview = screen.getByTestId('document-preview');
      expect(preview).toHaveClass('custom-class');
    });

    it('should have prose styling by default', () => {
      render(<DocumentPreview content="Test" />);
      const preview = screen.getByTestId('document-preview');
      expect(preview).toHaveClass('prose');
    });
  });
});
