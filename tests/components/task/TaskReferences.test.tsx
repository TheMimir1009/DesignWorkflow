/**
 * TaskReferences Component Tests
 * TDD test suite for task references display and management
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskReferences } from '../../../src/components/task/TaskReferences';

describe('TaskReferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component container', () => {
      render(<TaskReferences references={[]} />);

      expect(screen.getByTestId('task-references')).toBeInTheDocument();
    });

    it('should render empty state when no references', () => {
      render(<TaskReferences references={[]} />);

      expect(screen.getByText(/no references/i)).toBeInTheDocument();
    });

    it('should render reference items', () => {
      const references = ['ref-1', 'ref-2', 'ref-3'];
      render(<TaskReferences references={references} />);

      expect(screen.getByText('ref-1')).toBeInTheDocument();
      expect(screen.getByText('ref-2')).toBeInTheDocument();
      expect(screen.getByText('ref-3')).toBeInTheDocument();
    });

    it('should render section title', () => {
      render(<TaskReferences references={[]} />);

      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('References');
    });

    it('should render reference count badge', () => {
      const references = ['ref-1', 'ref-2'];
      render(<TaskReferences references={references} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Max Display Limit', () => {
    it('should limit displayed references when maxDisplay is set', () => {
      const references = ['ref-1', 'ref-2', 'ref-3', 'ref-4', 'ref-5'];
      render(<TaskReferences references={references} maxDisplay={3} />);

      expect(screen.getByText('ref-1')).toBeInTheDocument();
      expect(screen.getByText('ref-2')).toBeInTheDocument();
      expect(screen.getByText('ref-3')).toBeInTheDocument();
      expect(screen.queryByText('ref-4')).not.toBeInTheDocument();
      expect(screen.queryByText('ref-5')).not.toBeInTheDocument();
    });

    it('should show remaining count when references exceed maxDisplay', () => {
      const references = ['ref-1', 'ref-2', 'ref-3', 'ref-4', 'ref-5'];
      render(<TaskReferences references={references} maxDisplay={3} />);

      expect(screen.getByText(/\+2 more/i)).toBeInTheDocument();
    });

    it('should not show remaining count when all references are displayed', () => {
      const references = ['ref-1', 'ref-2'];
      render(<TaskReferences references={references} maxDisplay={5} />);

      expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
    });

    it('should show all references when maxDisplay is not set', () => {
      const references = ['ref-1', 'ref-2', 'ref-3', 'ref-4', 'ref-5'];
      render(<TaskReferences references={references} />);

      expect(screen.getByText('ref-1')).toBeInTheDocument();
      expect(screen.getByText('ref-2')).toBeInTheDocument();
      expect(screen.getByText('ref-3')).toBeInTheDocument();
      expect(screen.getByText('ref-4')).toBeInTheDocument();
      expect(screen.getByText('ref-5')).toBeInTheDocument();
    });
  });

  describe('Remove Reference', () => {
    it('should render remove button for each reference when onRemove is provided', () => {
      const references = ['ref-1', 'ref-2'];
      const handleRemove = vi.fn();
      render(<TaskReferences references={references} onRemove={handleRemove} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('should not render remove button when onRemove is not provided', () => {
      const references = ['ref-1', 'ref-2'];
      render(<TaskReferences references={references} />);

      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('should call onRemove with reference id when remove button is clicked', async () => {
      const references = ['ref-1', 'ref-2'];
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      render(<TaskReferences references={references} onRemove={handleRemove} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      expect(handleRemove).toHaveBeenCalledWith('ref-1');
    });

    it('should not render remove button in readonly mode', () => {
      const references = ['ref-1', 'ref-2'];
      const handleRemove = vi.fn();
      render(<TaskReferences references={references} onRemove={handleRemove} readonly />);

      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });
  });

  describe('Add Reference', () => {
    it('should render add button when onAdd is provided', () => {
      render(<TaskReferences references={[]} onAdd={() => {}} />);

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('should not render add button when onAdd is not provided', () => {
      render(<TaskReferences references={[]} />);

      expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    });

    it('should call onAdd when add button is clicked', async () => {
      const handleAdd = vi.fn();
      const user = userEvent.setup();
      render(<TaskReferences references={[]} onAdd={handleAdd} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(handleAdd).toHaveBeenCalled();
    });

    it('should not render add button in readonly mode', () => {
      const handleAdd = vi.fn();
      render(<TaskReferences references={[]} onAdd={handleAdd} readonly />);

      expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    });
  });

  describe('Readonly Mode', () => {
    it('should display references in readonly mode', () => {
      const references = ['ref-1', 'ref-2'];
      render(<TaskReferences references={references} readonly />);

      expect(screen.getByText('ref-1')).toBeInTheDocument();
      expect(screen.getByText('ref-2')).toBeInTheDocument();
    });

    it('should not show any action buttons in readonly mode', () => {
      const references = ['ref-1'];
      render(
        <TaskReferences
          references={references}
          onAdd={() => {}}
          onRemove={() => {}}
          readonly
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Reference Item Display', () => {
    it('should render reference as link when it is a URL', () => {
      const references = ['https://example.com/doc'];
      render(<TaskReferences references={references} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/doc');
    });

    it('should open link in new tab', () => {
      const references = ['https://example.com/doc'];
      render(<TaskReferences references={references} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render non-URL references as plain text', () => {
      const references = ['local-reference-id'];
      render(<TaskReferences references={references} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText('local-reference-id')).toBeInTheDocument();
    });

    it('should truncate long reference text', () => {
      const longReference = 'https://example.com/very-long-path/that-should-be-truncated-for-display';
      render(<TaskReferences references={[longReference]} />);

      const element = screen.getByText(longReference);
      expect(element).toHaveClass('truncate');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible list structure', () => {
      const references = ['ref-1', 'ref-2'];
      render(<TaskReferences references={references} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('should have accessible remove button labels', () => {
      const references = ['ref-1'];
      render(<TaskReferences references={references} onRemove={() => {}} />);

      const removeButton = screen.getByRole('button', { name: /remove ref-1/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should have accessible add button label', () => {
      render(<TaskReferences references={[]} onAdd={() => {}} />);

      const addButton = screen.getByRole('button', { name: /add reference/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should have link icon for URL references', () => {
      const references = ['https://example.com'];
      render(<TaskReferences references={references} />);

      expect(screen.getByTestId('link-icon')).toBeInTheDocument();
    });

    it('should have document icon for non-URL references', () => {
      const references = ['local-doc'];
      render(<TaskReferences references={references} />);

      expect(screen.getByTestId('document-icon')).toBeInTheDocument();
    });
  });
});
