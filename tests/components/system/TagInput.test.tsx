/**
 * TagInput Component Tests
 * TDD test suite for tag input functionality
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '../../../src/components/common/TagInput';

describe('TagInput', () => {
  const defaultProps = {
    tags: [],
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render empty state with placeholder', () => {
      render(<TagInput {...defaultProps} placeholder="Add tags..." />);

      expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument();
    });

    it('should render existing tags', () => {
      render(<TagInput {...defaultProps} tags={['combat', 'action']} />);

      expect(screen.getByText('combat')).toBeInTheDocument();
      expect(screen.getByText('action')).toBeInTheDocument();
    });

    it('should render remove button for each tag', () => {
      render(<TagInput {...defaultProps} tags={['combat']} />);

      const removeButton = screen.getByRole('button', { name: /remove combat/i });
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('adding tags', () => {
    it('should add tag on Enter key', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'newtag{Enter}');

      expect(onChange).toHaveBeenCalledWith(['newtag']);
    });

    it('should trim whitespace from new tags', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '  spacedtag  {Enter}');

      expect(onChange).toHaveBeenCalledWith(['spacedtag']);
    });

    it('should not add empty tags', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '   {Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not add duplicate tags', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={['existing']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'existing{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should clear input after adding tag', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'newtag{Enter}');

      expect(input).toHaveValue('');
    });
  });

  describe('removing tags', () => {
    it('should remove tag when X button is clicked', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={['combat', 'action']} onChange={onChange} />);

      const removeButton = screen.getByRole('button', { name: /remove combat/i });
      await userEvent.click(removeButton);

      expect(onChange).toHaveBeenCalledWith(['action']);
    });

    it('should remove last tag on Backspace when input is empty', async () => {
      const onChange = vi.fn();
      render(<TagInput tags={['combat', 'action']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.click(input);
      await userEvent.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith(['combat']);
    });
  });

  describe('suggestions', () => {
    it('should show suggestions when typing', async () => {
      render(
        <TagInput
          tags={[]}
          onChange={vi.fn()}
          suggestions={['combat', 'combo', 'economy']}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'com');

      expect(screen.getByText('combat')).toBeInTheDocument();
      expect(screen.getByText('combo')).toBeInTheDocument();
      expect(screen.queryByText('economy')).not.toBeInTheDocument();
    });

    it('should add tag when clicking suggestion', async () => {
      const onChange = vi.fn();
      render(
        <TagInput
          tags={[]}
          onChange={onChange}
          suggestions={['combat', 'combo']}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'com');

      const suggestion = screen.getByText('combat');
      await userEvent.click(suggestion);

      expect(onChange).toHaveBeenCalledWith(['combat']);
    });

    it('should not show suggestions that are already selected', async () => {
      render(
        <TagInput
          tags={['combat']}
          onChange={vi.fn()}
          suggestions={['combat', 'combo']}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'com');

      expect(screen.queryByRole('option', { name: 'combat' })).not.toBeInTheDocument();
      expect(screen.getByText('combo')).toBeInTheDocument();
    });
  });
});
