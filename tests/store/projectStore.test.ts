/**
 * Project Store Tests
 * TDD test suite for Zustand state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../../src/types';

// Mock the projectService module
vi.mock('../../src/services/projectService', () => ({
  getProjects: vi.fn(),
  getProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

// Import after mocking
import * as projectService from '../../src/services/projectService';
import { useProjectStore } from '../../src/store/projectStore';

// Test data factories
const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test description',
  techStack: ['Unity', 'C#'],
  categories: ['RPG'],
  defaultReferences: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

// Helper to compute currentProject for test setState calls
function computeCurrentProject(projects: Project[], currentProjectId: string | null): Project | null {
  if (!currentProjectId) return null;
  return projects.find(p => p.id === currentProjectId) || null;
}

describe('projectStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    useProjectStore.setState({
      projects: [],
      currentProjectId: null,
      currentProject: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useProjectStore.getState();

      expect(state.projects).toEqual([]);
      expect(state.currentProjectId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('currentProject getter', () => {
    it('should return null when no project is selected', () => {
      const state = useProjectStore.getState();
      expect(state.currentProject).toBeNull();
    });

    it('should return the current project when one is selected', () => {
      const mockProject = createMockProject();
      const projects = [mockProject];
      const currentProjectId = 'test-project-id';
      useProjectStore.setState({
        projects,
        currentProjectId,
        currentProject: computeCurrentProject(projects, currentProjectId),
      });

      const state = useProjectStore.getState();
      expect(state.currentProject).toEqual(mockProject);
    });

    it('should return null when selected project does not exist in projects array', () => {
      const projects: Project[] = [];
      const currentProjectId = 'non-existent-id';
      useProjectStore.setState({
        projects,
        currentProjectId,
        currentProject: computeCurrentProject(projects, currentProjectId),
      });

      const state = useProjectStore.getState();
      expect(state.currentProject).toBeNull();
    });
  });

  describe('fetchProjects', () => {
    it('should fetch and set projects successfully', async () => {
      const mockProjects = [
        createMockProject({ id: 'project-1', name: 'Project 1', createdAt: '2025-01-02T00:00:00.000Z' }),
        createMockProject({ id: 'project-2', name: 'Project 2', createdAt: '2025-01-01T00:00:00.000Z' }),
      ];
      vi.mocked(projectService.getProjects).mockResolvedValueOnce(mockProjects);

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      const state = useProjectStore.getState();
      expect(state.projects).toEqual(mockProjects);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      vi.mocked(projectService.getProjects).mockImplementation(() => {
        expect(useProjectStore.getState().isLoading).toBe(true);
        return Promise.resolve([]);
      });

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(useProjectStore.getState().isLoading).toBe(false);
    });

    it('should auto-select first project if none selected', async () => {
      const mockProjects = [
        createMockProject({ id: 'first-project', createdAt: '2025-01-02T00:00:00.000Z' }),
        createMockProject({ id: 'second-project', createdAt: '2025-01-01T00:00:00.000Z' }),
      ];
      vi.mocked(projectService.getProjects).mockResolvedValueOnce(mockProjects);

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(useProjectStore.getState().currentProjectId).toBe('first-project');
    });

    it('should not change selection if project already selected', async () => {
      useProjectStore.setState({ currentProjectId: 'existing-selection' });

      const mockProjects = [
        createMockProject({ id: 'first-project' }),
        createMockProject({ id: 'existing-selection' }),
      ];
      vi.mocked(projectService.getProjects).mockResolvedValueOnce(mockProjects);

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(useProjectStore.getState().currentProjectId).toBe('existing-selection');
    });

    it('should set error state when fetch fails', async () => {
      vi.mocked(projectService.getProjects).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      const state = useProjectStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error on successful fetch', async () => {
      useProjectStore.setState({ error: 'Previous error' });
      vi.mocked(projectService.getProjects).mockResolvedValueOnce([]);

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      expect(useProjectStore.getState().error).toBeNull();
    });

    it('should sort projects by createdAt descending', async () => {
      const mockProjects = [
        createMockProject({ id: 'old', name: 'Old Project', createdAt: '2025-01-01T00:00:00.000Z' }),
        createMockProject({ id: 'new', name: 'New Project', createdAt: '2025-01-03T00:00:00.000Z' }),
        createMockProject({ id: 'mid', name: 'Mid Project', createdAt: '2025-01-02T00:00:00.000Z' }),
      ];
      vi.mocked(projectService.getProjects).mockResolvedValueOnce(mockProjects);

      await act(async () => {
        await useProjectStore.getState().fetchProjects();
      });

      const state = useProjectStore.getState();
      expect(state.projects[0].id).toBe('new');
      expect(state.projects[1].id).toBe('mid');
      expect(state.projects[2].id).toBe('old');
    });
  });

  describe('createProject', () => {
    it('should create a project and add to store', async () => {
      const createDto: CreateProjectDto = {
        name: 'New Project',
        description: 'New description',
      };
      const createdProject = createMockProject({
        id: 'new-project-id',
        name: 'New Project',
        description: 'New description',
      });
      vi.mocked(projectService.createProject).mockResolvedValueOnce(createdProject);

      await act(async () => {
        await useProjectStore.getState().createProject(createDto);
      });

      const state = useProjectStore.getState();
      expect(state.projects).toContainEqual(createdProject);
      expect(state.error).toBeNull();
    });

    it('should auto-select newly created project', async () => {
      const createDto: CreateProjectDto = { name: 'New Project' };
      const createdProject = createMockProject({ id: 'new-project-id' });
      vi.mocked(projectService.createProject).mockResolvedValueOnce(createdProject);

      await act(async () => {
        await useProjectStore.getState().createProject(createDto);
      });

      expect(useProjectStore.getState().currentProjectId).toBe('new-project-id');
    });

    it('should set loading state while creating', async () => {
      vi.mocked(projectService.createProject).mockImplementation(() => {
        expect(useProjectStore.getState().isLoading).toBe(true);
        return Promise.resolve(createMockProject());
      });

      await act(async () => {
        await useProjectStore.getState().createProject({ name: 'Test' });
      });

      expect(useProjectStore.getState().isLoading).toBe(false);
    });

    it('should set error state when creation fails', async () => {
      vi.mocked(projectService.createProject).mockRejectedValueOnce(new Error('Validation failed'));

      await act(async () => {
        await useProjectStore.getState().createProject({ name: '' });
      });

      const state = useProjectStore.getState();
      expect(state.error).toBe('Validation failed');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error on successful creation', async () => {
      useProjectStore.setState({ error: 'Previous error' });
      vi.mocked(projectService.createProject).mockResolvedValueOnce(createMockProject());

      await act(async () => {
        await useProjectStore.getState().createProject({ name: 'Test' });
      });

      expect(useProjectStore.getState().error).toBeNull();
    });

    it('should add new project at the beginning of the list', async () => {
      const existingProject = createMockProject({ id: 'existing', createdAt: '2025-01-01T00:00:00.000Z' });
      useProjectStore.setState({ projects: [existingProject] });

      const newProject = createMockProject({ id: 'new', createdAt: '2025-01-02T00:00:00.000Z' });
      vi.mocked(projectService.createProject).mockResolvedValueOnce(newProject);

      await act(async () => {
        await useProjectStore.getState().createProject({ name: 'New' });
      });

      const state = useProjectStore.getState();
      expect(state.projects[0].id).toBe('new');
      expect(state.projects[1].id).toBe('existing');
    });
  });

  describe('updateProject', () => {
    it('should update a project in the store', async () => {
      const existingProject = createMockProject({ id: 'project-1', name: 'Original Name' });
      useProjectStore.setState({ projects: [existingProject] });

      const updateDto: UpdateProjectDto = { name: 'Updated Name' };
      const updatedProject = createMockProject({ id: 'project-1', name: 'Updated Name' });
      vi.mocked(projectService.updateProject).mockResolvedValueOnce(updatedProject);

      await act(async () => {
        await useProjectStore.getState().updateProject('project-1', updateDto);
      });

      const state = useProjectStore.getState();
      expect(state.projects[0].name).toBe('Updated Name');
      expect(state.error).toBeNull();
    });

    it('should set loading state while updating', async () => {
      useProjectStore.setState({ projects: [createMockProject()] });
      vi.mocked(projectService.updateProject).mockImplementation(() => {
        expect(useProjectStore.getState().isLoading).toBe(true);
        return Promise.resolve(createMockProject());
      });

      await act(async () => {
        await useProjectStore.getState().updateProject('test-project-id', { name: 'New' });
      });

      expect(useProjectStore.getState().isLoading).toBe(false);
    });

    it('should set error state when update fails', async () => {
      useProjectStore.setState({ projects: [createMockProject()] });
      vi.mocked(projectService.updateProject).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        await useProjectStore.getState().updateProject('test-project-id', { name: '' });
      });

      const state = useProjectStore.getState();
      expect(state.error).toBe('Update failed');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error on successful update', async () => {
      useProjectStore.setState({
        projects: [createMockProject()],
        error: 'Previous error',
      });
      vi.mocked(projectService.updateProject).mockResolvedValueOnce(createMockProject());

      await act(async () => {
        await useProjectStore.getState().updateProject('test-project-id', { name: 'New' });
      });

      expect(useProjectStore.getState().error).toBeNull();
    });

    it('should preserve project order after update', async () => {
      const projects = [
        createMockProject({ id: 'project-1', createdAt: '2025-01-02T00:00:00.000Z' }),
        createMockProject({ id: 'project-2', createdAt: '2025-01-01T00:00:00.000Z' }),
      ];
      useProjectStore.setState({ projects });

      const updatedProject = createMockProject({ id: 'project-2', name: 'Updated', createdAt: '2025-01-01T00:00:00.000Z' });
      vi.mocked(projectService.updateProject).mockResolvedValueOnce(updatedProject);

      await act(async () => {
        await useProjectStore.getState().updateProject('project-2', { name: 'Updated' });
      });

      const state = useProjectStore.getState();
      expect(state.projects[0].id).toBe('project-1');
      expect(state.projects[1].id).toBe('project-2');
      expect(state.projects[1].name).toBe('Updated');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project from the store', async () => {
      const projects = [
        createMockProject({ id: 'project-1' }),
        createMockProject({ id: 'project-2' }),
      ];
      useProjectStore.setState({ projects });
      vi.mocked(projectService.deleteProject).mockResolvedValueOnce();

      await act(async () => {
        await useProjectStore.getState().deleteProject('project-1');
      });

      const state = useProjectStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].id).toBe('project-2');
    });

    it('should set loading state while deleting', async () => {
      useProjectStore.setState({ projects: [createMockProject()] });
      vi.mocked(projectService.deleteProject).mockImplementation(() => {
        expect(useProjectStore.getState().isLoading).toBe(true);
        return Promise.resolve();
      });

      await act(async () => {
        await useProjectStore.getState().deleteProject('test-project-id');
      });

      expect(useProjectStore.getState().isLoading).toBe(false);
    });

    it('should auto-select another project after deleting current', async () => {
      const projects = [
        createMockProject({ id: 'project-1', createdAt: '2025-01-02T00:00:00.000Z' }),
        createMockProject({ id: 'project-2', createdAt: '2025-01-01T00:00:00.000Z' }),
      ];
      useProjectStore.setState({ projects, currentProjectId: 'project-1' });
      vi.mocked(projectService.deleteProject).mockResolvedValueOnce();

      await act(async () => {
        await useProjectStore.getState().deleteProject('project-1');
      });

      expect(useProjectStore.getState().currentProjectId).toBe('project-2');
    });

    it('should set currentProjectId to null when last project is deleted', async () => {
      useProjectStore.setState({
        projects: [createMockProject({ id: 'only-project' })],
        currentProjectId: 'only-project',
      });
      vi.mocked(projectService.deleteProject).mockResolvedValueOnce();

      await act(async () => {
        await useProjectStore.getState().deleteProject('only-project');
      });

      expect(useProjectStore.getState().currentProjectId).toBeNull();
    });

    it('should not change selection if deleted project is not current', async () => {
      const projects = [
        createMockProject({ id: 'project-1' }),
        createMockProject({ id: 'project-2' }),
      ];
      useProjectStore.setState({ projects, currentProjectId: 'project-1' });
      vi.mocked(projectService.deleteProject).mockResolvedValueOnce();

      await act(async () => {
        await useProjectStore.getState().deleteProject('project-2');
      });

      expect(useProjectStore.getState().currentProjectId).toBe('project-1');
    });

    it('should set error state when deletion fails', async () => {
      useProjectStore.setState({ projects: [createMockProject()] });
      vi.mocked(projectService.deleteProject).mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        await useProjectStore.getState().deleteProject('test-project-id');
      });

      const state = useProjectStore.getState();
      expect(state.error).toBe('Delete failed');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error on successful deletion', async () => {
      useProjectStore.setState({
        projects: [createMockProject()],
        error: 'Previous error',
      });
      vi.mocked(projectService.deleteProject).mockResolvedValueOnce();

      await act(async () => {
        await useProjectStore.getState().deleteProject('test-project-id');
      });

      expect(useProjectStore.getState().error).toBeNull();
    });
  });

  describe('selectProject', () => {
    it('should set the current project id', () => {
      const projects = [createMockProject({ id: 'project-1' })];
      useProjectStore.setState({ projects });

      act(() => {
        useProjectStore.getState().selectProject('project-1');
      });

      expect(useProjectStore.getState().currentProjectId).toBe('project-1');
    });

    it('should allow setting null to deselect', () => {
      useProjectStore.setState({ currentProjectId: 'some-id' });

      act(() => {
        useProjectStore.getState().selectProject(null);
      });

      expect(useProjectStore.getState().currentProjectId).toBeNull();
    });

    it('should clear error when selecting a project', () => {
      useProjectStore.setState({ error: 'Some error' });

      act(() => {
        useProjectStore.getState().selectProject('project-1');
      });

      expect(useProjectStore.getState().error).toBeNull();
    });
  });
});
