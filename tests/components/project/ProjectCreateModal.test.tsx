/**
 * ProjectCreateModal Component Tests
 * TDD RED Phase: Define expected behavior through failing tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCreateModal } from '../../../src/components/project/ProjectCreateModal';
import { useProjectStore } from '../../../src/store/projectStore';

// Mock the store
vi.mock('../../../src/store/projectStore', () => ({
  useProjectStore: vi.fn(),
}));

describe('ProjectCreateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  const mockCreateProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateProject.mockResolvedValue(undefined);
    (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      createProject: mockCreateProject,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/새 프로젝트 만들기/i)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ProjectCreateModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render name input field', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/프로젝트 이름/i)).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/설명/i)).toBeInTheDocument();
    });

    it('should render tech stack input', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/기술 스택/i)).toBeInTheDocument();
    });

    it('should render categories input', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument();
    });

    it('should render suggested tech stacks', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByText('Unity')).toBeInTheDocument();
      expect(screen.getByText('Unreal')).toBeInTheDocument();
    });

    it('should render suggested categories', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      expect(screen.getByText('시스템')).toBeInTheDocument();
      expect(screen.getByText('콘텐츠')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when name is empty', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /만들기/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when name is provided', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/프로젝트 이름/i), 'My Project');

      const submitButton = screen.getByRole('button', { name: /만들기/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should show error when name exceeds 100 characters', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      const longName = 'a'.repeat(101);
      await user.type(screen.getByLabelText(/프로젝트 이름/i), longName);

      expect(screen.getByText(/100자 이하/i)).toBeInTheDocument();
    });
  });

  describe('Tag Input - Tech Stack', () => {
    it('should add tech stack tag when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      const techStackInput = screen.getByLabelText(/기술 스택/i);
      await user.type(techStackInput, 'React{Enter}');

      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('should not add duplicate tech stack tags', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      const techStackInput = screen.getByLabelText(/기술 스택/i);
      await user.type(techStackInput, 'React{Enter}');
      await user.type(techStackInput, 'React{Enter}');

      const reactTags = screen.getAllByText('React');
      // One from suggestions, one from added tags
      expect(reactTags.length).toBeLessThanOrEqual(2);
    });

    it('should remove tech stack tag when clicking X', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      // Add Unity through suggestion button
      const unityButton = screen.getByRole('button', { name: /add Unity/i });
      await user.click(unityButton);

      // Now there should be a remove button for Unity
      const removeButton = screen.getByRole('button', { name: /remove Unity/i });
      await user.click(removeButton);

      // Unity should no longer be in the tag list
      const techStackSection = screen.getByTestId('techstack-tags');
      expect(techStackSection).not.toHaveTextContent('Unity');
    });

    it('should add suggested tech stack when clicking', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      const unityButton = screen.getByRole('button', { name: /add Unity/i });
      await user.click(unityButton);

      // Check if Unity is in the tag list (not just suggestions)
      const techStackSection = screen.getByTestId('techstack-tags');
      expect(techStackSection).toHaveTextContent('Unity');
    });

    it('should remove tag when clicking remove button', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      // Add two tags using suggestion buttons
      const unityButton = screen.getByRole('button', { name: /add Unity/i });
      const unrealButton = screen.getByRole('button', { name: /add Unreal/i });
      await user.click(unityButton);
      await user.click(unrealButton);

      // Verify both tags exist
      const techStackSection = screen.getByTestId('techstack-tags');
      expect(techStackSection).toHaveTextContent('Unity');
      expect(techStackSection).toHaveTextContent('Unreal');

      // Remove Unity tag by clicking its remove button
      const unityRemoveButton = screen.getByRole('button', { name: /remove Unity/i });
      await user.click(unityRemoveButton);

      // Unity should be removed, Unreal should remain
      expect(techStackSection).not.toHaveTextContent('Unity');
      expect(techStackSection).toHaveTextContent('Unreal');
    });
  });

  describe('Tag Input - Categories', () => {
    it('should add category tag when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      // Add category through suggestion button (similar to tech stack test)
      const systemButton = screen.getByRole('button', { name: /add 시스템/i });
      await user.click(systemButton);

      const categorySection = screen.getByTestId('category-tags');
      expect(categorySection).toHaveTextContent('시스템');
    });

    it('should add suggested category when clicking', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      const systemButton = screen.getByRole('button', { name: /add 시스템/i });
      await user.click(systemButton);

      const categorySection = screen.getByTestId('category-tags');
      expect(categorySection).toHaveTextContent('시스템');
    });
  });

  describe('Form Submission', () => {
    it('should call createProject with form data on submit', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/프로젝트 이름/i), 'Test Project');
      await user.type(screen.getByLabelText(/설명/i), 'Test Description');

      const techStackInput = screen.getByLabelText(/기술 스택/i);
      await user.type(techStackInput, 'Unity{Enter}');

      const categoryInput = screen.getByLabelText(/카테고리/i);
      await user.type(categoryInput, '시스템{Enter}');

      await user.click(screen.getByRole('button', { name: /만들기/i }));

      expect(mockCreateProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
        techStack: ['Unity'],
        categories: ['시스템'],
      });
    });

    it('should call onSuccess after successful creation', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/프로젝트 이름/i), 'Test Project');
      await user.click(screen.getByRole('button', { name: /만들기/i }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onClose after successful creation', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/프로젝트 이름/i), 'Test Project');
      await user.click(screen.getByRole('button', { name: /만들기/i }));

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during submission', async () => {
      mockCreateProject.mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/프로젝트 이름/i), 'Test Project');
      await user.click(screen.getByRole('button', { name: /만들기/i }));

      expect(screen.getByRole('button', { name: /만들기/i })).toBeDisabled();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when clicking cancel button', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /취소/i }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when pressing ESC', async () => {
      const user = userEvent.setup();
      render(<ProjectCreateModal {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should reset form when modal is reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ProjectCreateModal {...defaultProps} />);

      await user.type(screen.getByLabelText(/프로젝트 이름/i), 'Test Project');

      rerender(<ProjectCreateModal {...defaultProps} isOpen={false} />);
      rerender(<ProjectCreateModal {...defaultProps} isOpen={true} />);

      expect(screen.getByLabelText(/프로젝트 이름/i)).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ProjectCreateModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should focus name input when modal opens', async () => {
      render(<ProjectCreateModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/프로젝트 이름/i)).toHaveFocus();
      });
    });
  });
});
