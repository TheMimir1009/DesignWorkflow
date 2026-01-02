/**
 * Header Component Tests
 * TDD RED Phase: Define expected behavior through failing tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../../src/components/layout/Header';
import { useProjectStore } from '../../../src/store/projectStore';
import type { Project } from '../../../src/types';

// Mock the store
vi.mock('../../../src/store/projectStore', () => ({
  useProjectStore: vi.fn(),
}));

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project Alpha',
    description: 'First project',
    techStack: ['Unity'],
    categories: ['System'],
    defaultReferences: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Project Beta',
    description: 'Second project',
    techStack: ['Unreal'],
    categories: ['Content'],
    defaultReferences: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

describe('Header', () => {
  const mockSelectProject = vi.fn();
  const mockCreateProject = vi.fn();
  const mockUpdateProject = vi.fn();
  const mockDeleteProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateProject.mockResolvedValue(undefined);
    mockUpdateProject.mockResolvedValue(undefined);
    mockDeleteProject.mockResolvedValue(undefined);
    (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      projects: mockProjects,
      currentProject: mockProjects[0],
      selectProject: mockSelectProject,
      createProject: mockCreateProject,
      updateProject: mockUpdateProject,
      deleteProject: mockDeleteProject,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render header with logo', () => {
      render(<Header />);

      expect(screen.getByText(/AI Workflow Kanban/i)).toBeInTheDocument();
    });

    it('should render project selector', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /project alpha/i })).toBeInTheDocument();
    });

    it('should render settings button', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('Project Selector Integration', () => {
    it('should open dropdown when clicking selector', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should show new project button in dropdown', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));

      expect(screen.getByRole('button', { name: /새 프로젝트/i })).toBeInTheDocument();
    });
  });

  describe('Create Modal Integration', () => {
    it('should open create modal when clicking new project button', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.click(screen.getByRole('button', { name: /새 프로젝트/i }));

      expect(screen.getByText(/새 프로젝트 만들기/i)).toBeInTheDocument();
    });

    it('should close create modal when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.click(screen.getByRole('button', { name: /새 프로젝트/i }));

      expect(screen.getByText(/새 프로젝트 만들기/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /취소/i }));

      await waitFor(() => {
        expect(screen.queryByText(/새 프로젝트 만들기/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Settings Modal Integration', () => {
    it('should open settings modal when clicking settings button', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      expect(screen.getByText(/프로젝트 설정/i)).toBeInTheDocument();
    });

    it('should close settings modal when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      expect(screen.getByText(/프로젝트 설정/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /취소/i }));

      await waitFor(() => {
        expect(screen.queryByText(/프로젝트 설정/i)).not.toBeInTheDocument();
      });
    });

    it('should not open settings modal if no project is selected', async () => {
      (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        projects: mockProjects,
        currentProject: null,
        selectProject: mockSelectProject,
        createProject: mockCreateProject,
        updateProject: mockUpdateProject,
        deleteProject: mockDeleteProject,
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      render(<Header />);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      // Modal should not be shown
      expect(screen.queryByText(/프로젝트 설정/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have banner role for header', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
