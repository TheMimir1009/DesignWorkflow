/**
 * ProjectSettingsModal Component Tests
 * TDD RED Phase: Define expected behavior through failing tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSettingsModal } from '../../../src/components/project/ProjectSettingsModal';
import { useProjectStore } from '../../../src/store/projectStore';
import type { Project } from '../../../src/types';

// Mock the store
vi.mock('../../../src/store/projectStore', () => ({
  useProjectStore: vi.fn(),
}));

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'Test Description',
  techStack: ['Unity', 'TypeScript'],
  categories: ['System', 'Content'],
  defaultReferences: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ProjectSettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    projectId: '1',
  };

  const mockUpdateProject = vi.fn();
  const mockDeleteProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProject.mockResolvedValue(undefined);
    mockDeleteProject.mockResolvedValue(undefined);
    (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      projects: [mockProject],
      currentProject: mockProject,
      updateProject: mockUpdateProject,
      deleteProject: mockDeleteProject,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ProjectSettingsModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/프로젝트 설정/i)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ProjectSettingsModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<ProjectSettingsModal {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /기본 정보/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /기술 스택/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /카테고리/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /위험 영역/i })).toBeInTheDocument();
    });
  });

  describe('Basic Info Tab', () => {
    it('should show project name and description', () => {
      render(<ProjectSettingsModal {...defaultProps} />);

      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });

    it('should update name when typing', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project');

      expect(nameInput).toHaveValue('Updated Project');
    });

    it('should enable save button when changes are made', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /저장/i });
      expect(saveButton).toBeDisabled();

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project');

      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Tech Stack Tab', () => {
    it('should show tech stack tab content when clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /기술 스택/i }));

      // Check for remove buttons which indicate tags are displayed
      expect(screen.getByRole('button', { name: /remove Unity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove TypeScript/i })).toBeInTheDocument();
    });

    it('should add tech stack when using suggestion button', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /기술 스택/i }));
      await user.click(screen.getByRole('button', { name: /add React/i }));

      // Check that the tag now has a remove button
      expect(screen.getByRole('button', { name: /remove React/i })).toBeInTheDocument();
    });

    it('should remove tech stack when clicking X', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /기술 스택/i }));
      await user.click(screen.getByRole('button', { name: /remove Unity/i }));

      // Remove button should no longer exist for Unity
      expect(screen.queryByRole('button', { name: /remove Unity/i })).not.toBeInTheDocument();
    });
  });

  describe('Categories Tab', () => {
    it('should show categories tab content when clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /카테고리/i }));

      // Check for remove buttons which indicate categories are displayed
      expect(screen.getByRole('button', { name: /remove System/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove Content/i })).toBeInTheDocument();
    });

    it('should add category when using suggestion button', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /카테고리/i }));
      await user.click(screen.getByRole('button', { name: /add UI/i }));

      // Check that the category now has a remove button
      expect(screen.getByRole('button', { name: /remove UI/i })).toBeInTheDocument();
    });
  });

  describe('Danger Zone Tab', () => {
    it('should show danger zone when clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /위험 영역/i }));

      // Should show the delete button
      expect(screen.getByRole('button', { name: /프로젝트 삭제/i })).toBeInTheDocument();
      // Should show the warning text
      expect(screen.getByText(/되돌릴 수 없습니다/i)).toBeInTheDocument();
    });

    it('should show delete confirmation dialog when clicking delete', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /위험 영역/i }));
      await user.click(screen.getByRole('button', { name: /프로젝트 삭제/i }));

      expect(screen.getByText(/정말로 삭제하시겠습니까/i)).toBeInTheDocument();
    });

    it('should require typing project name to confirm delete', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /위험 영역/i }));
      await user.click(screen.getByRole('button', { name: /프로젝트 삭제/i }));

      const confirmButton = screen.getByRole('button', { name: /삭제 확인/i });
      expect(confirmButton).toBeDisabled();

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test Project');

      expect(confirmButton).not.toBeDisabled();
    });

    it('should call deleteProject when confirmed', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /위험 영역/i }));
      await user.click(screen.getByRole('button', { name: /프로젝트 삭제/i }));

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test Project');
      await user.click(screen.getByRole('button', { name: /삭제 확인/i }));

      expect(mockDeleteProject).toHaveBeenCalledWith('1');
    });
  });

  describe('Save Changes', () => {
    it('should call updateProject when saving', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project');

      await user.click(screen.getByRole('button', { name: /저장/i }));

      expect(mockUpdateProject).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Project',
      }));
    });

    it('should call onClose after successful save', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project');

      await user.click(screen.getByRole('button', { name: /저장/i }));

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when pressing ESC', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking cancel button', async () => {
      const user = userEvent.setup();
      render(<ProjectSettingsModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /취소/i }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ProjectSettingsModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have tablist for tabs', () => {
      render(<ProjectSettingsModal {...defaultProps} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });
});
