/**
 * Task Store Tests
 * TDD test suite for Task Zustand state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { Task } from '../../src/types';

// Mock the taskService module
vi.mock('../../src/services/taskService', () => ({
  getTasks: vi.fn(),
  updateTaskStatus: vi.fn(),
  triggerAI: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

// Import after mocking
import * as taskService from '../../src/services/taskService';
import { useTaskStore } from '../../src/store/taskStore';

// Test data factories
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-task-id',
  projectId: 'test-project-id',
  title: 'Test Task',
  status: 'featurelist',
  featureList: 'Test feature list content',
  designDocument: null,
  prd: null,
  prototype: null,
  references: [],
  qaAnswers: [],
  revisions: [],
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('taskStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      generatingTasks: new Set(),
      isLoading: false,
      error: null,
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteConfirmOpen: false,
      selectedTask: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTaskStore.getState();

      expect(state.tasks).toEqual([]);
      expect(state.generatingTasks).toBeInstanceOf(Set);
      expect(state.generatingTasks.size).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchTasks', () => {
    it('should fetch and set tasks successfully', async () => {
      const mockTasks = [
        createMockTask({ id: 'task-1', title: 'Task 1' }),
        createMockTask({ id: 'task-2', title: 'Task 2' }),
      ];
      vi.mocked(taskService.getTasks).mockResolvedValueOnce(mockTasks);

      await act(async () => {
        await useTaskStore.getState().fetchTasks('test-project-id');
      });

      const state = useTaskStore.getState();
      expect(state.tasks).toEqual(mockTasks);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      vi.mocked(taskService.getTasks).mockImplementation(() => {
        expect(useTaskStore.getState().isLoading).toBe(true);
        return Promise.resolve([]);
      });

      await act(async () => {
        await useTaskStore.getState().fetchTasks('test-project-id');
      });

      expect(useTaskStore.getState().isLoading).toBe(false);
    });

    it('should set error state when fetch fails', async () => {
      vi.mocked(taskService.getTasks).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useTaskStore.getState().fetchTasks('test-project-id');
      });

      const state = useTaskStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error on successful fetch', async () => {
      useTaskStore.setState({ error: 'Previous error' });
      vi.mocked(taskService.getTasks).mockResolvedValueOnce([]);

      await act(async () => {
        await useTaskStore.getState().fetchTasks('test-project-id');
      });

      expect(useTaskStore.getState().error).toBeNull();
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status optimistically', async () => {
      const mockTask = createMockTask({ id: 'task-1', status: 'featurelist' });
      useTaskStore.setState({ tasks: [mockTask] });

      const updatedTask = createMockTask({ id: 'task-1', status: 'design' });
      vi.mocked(taskService.updateTaskStatus).mockResolvedValueOnce(updatedTask);

      await act(async () => {
        await useTaskStore.getState().updateTaskStatus('task-1', 'design');
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].status).toBe('design');
    });

    it('should rollback on API failure', async () => {
      const mockTask = createMockTask({ id: 'task-1', status: 'featurelist' });
      useTaskStore.setState({ tasks: [mockTask] });

      vi.mocked(taskService.updateTaskStatus).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        await useTaskStore.getState().updateTaskStatus('task-1', 'design');
      });

      const state = useTaskStore.getState();
      // Should rollback to original status
      expect(state.tasks[0].status).toBe('featurelist');
      expect(state.error).toBe('Update failed');
    });

    it('should not update if task not found', async () => {
      useTaskStore.setState({ tasks: [] });

      await act(async () => {
        await useTaskStore.getState().updateTaskStatus('non-existent-id', 'design');
      });

      expect(taskService.updateTaskStatus).not.toHaveBeenCalled();
    });
  });

  describe('getTasksByStatus', () => {
    it('should return tasks filtered by status', () => {
      const tasks = [
        createMockTask({ id: 'task-1', status: 'featurelist' }),
        createMockTask({ id: 'task-2', status: 'design' }),
        createMockTask({ id: 'task-3', status: 'featurelist' }),
      ];
      useTaskStore.setState({ tasks });

      const result = useTaskStore.getState().getTasksByStatus('featurelist');

      expect(result).toHaveLength(2);
      expect(result.every(t => t.status === 'featurelist')).toBe(true);
    });

    it('should return empty array when no tasks match', () => {
      const tasks = [
        createMockTask({ id: 'task-1', status: 'featurelist' }),
      ];
      useTaskStore.setState({ tasks });

      const result = useTaskStore.getState().getTasksByStatus('design');

      expect(result).toEqual([]);
    });
  });

  describe('setGenerating', () => {
    it('should add task to generatingTasks set', () => {
      act(() => {
        useTaskStore.getState().setGenerating('task-1', true);
      });

      expect(useTaskStore.getState().generatingTasks.has('task-1')).toBe(true);
    });

    it('should remove task from generatingTasks set', () => {
      useTaskStore.setState({ generatingTasks: new Set(['task-1']) });

      act(() => {
        useTaskStore.getState().setGenerating('task-1', false);
      });

      expect(useTaskStore.getState().generatingTasks.has('task-1')).toBe(false);
    });

    it('should not modify set when removing non-existent task', () => {
      useTaskStore.setState({ generatingTasks: new Set(['task-1']) });

      act(() => {
        useTaskStore.getState().setGenerating('task-2', false);
      });

      const state = useTaskStore.getState();
      expect(state.generatingTasks.has('task-1')).toBe(true);
      expect(state.generatingTasks.size).toBe(1);
    });
  });

  describe('isGenerating', () => {
    it('should return true when task is generating', () => {
      useTaskStore.setState({ generatingTasks: new Set(['task-1']) });

      expect(useTaskStore.getState().isGenerating('task-1')).toBe(true);
    });

    it('should return false when task is not generating', () => {
      useTaskStore.setState({ generatingTasks: new Set(['task-1']) });

      expect(useTaskStore.getState().isGenerating('task-2')).toBe(false);
    });

    it('should return false when no tasks are generating', () => {
      expect(useTaskStore.getState().isGenerating('task-1')).toBe(false);
    });
  });

  describe('triggerAIGeneration', () => {
    it('should trigger AI generation and update task', async () => {
      const mockTask = createMockTask({ id: 'task-1', status: 'featurelist' });
      useTaskStore.setState({ tasks: [mockTask] });

      const updatedTask = createMockTask({
        id: 'task-1',
        status: 'design',
        designDocument: 'Generated content',
      });
      vi.mocked(taskService.triggerAI).mockResolvedValueOnce(updatedTask);

      await act(async () => {
        await useTaskStore.getState().triggerAIGeneration('task-1', 'design');
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].status).toBe('design');
      expect(state.tasks[0].designDocument).toBe('Generated content');
      expect(state.generatingTasks.has('task-1')).toBe(false);
    });

    it('should set generating state during AI generation', async () => {
      const mockTask = createMockTask({ id: 'task-1', status: 'featurelist' });
      useTaskStore.setState({ tasks: [mockTask] });

      let wasGenerating = false;
      vi.mocked(taskService.triggerAI).mockImplementation(async () => {
        wasGenerating = useTaskStore.getState().generatingTasks.has('task-1');
        return createMockTask({ id: 'task-1', status: 'design' });
      });

      await act(async () => {
        await useTaskStore.getState().triggerAIGeneration('task-1', 'design');
      });

      expect(wasGenerating).toBe(true);
      expect(useTaskStore.getState().generatingTasks.has('task-1')).toBe(false);
    });

    it('should handle AI generation failure', async () => {
      const mockTask = createMockTask({ id: 'task-1', status: 'featurelist' });
      useTaskStore.setState({ tasks: [mockTask] });

      vi.mocked(taskService.triggerAI).mockRejectedValueOnce(new Error('AI generation failed'));

      await act(async () => {
        await useTaskStore.getState().triggerAIGeneration('task-1', 'design');
      });

      const state = useTaskStore.getState();
      expect(state.error).toBe('AI generation failed');
      expect(state.generatingTasks.has('task-1')).toBe(false);
      // Status should remain unchanged on failure
      expect(state.tasks[0].status).toBe('featurelist');
    });

    it('should not trigger AI for non-existent task', async () => {
      useTaskStore.setState({ tasks: [] });

      await act(async () => {
        await useTaskStore.getState().triggerAIGeneration('non-existent-id', 'design');
      });

      expect(taskService.triggerAI).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      useTaskStore.setState({ error: 'Some error' });

      act(() => {
        useTaskStore.getState().clearError();
      });

      expect(useTaskStore.getState().error).toBeNull();
    });
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const newTask = createMockTask({
        id: 'new-task-id',
        projectId: 'test-project-id',
        title: 'New Task',
      });
      vi.mocked(taskService.createTask).mockResolvedValueOnce(newTask);

      await act(async () => {
        await useTaskStore.getState().createTask({
          title: 'New Task',
          projectId: 'test-project-id',
        });
      });

      const state = useTaskStore.getState();
      expect(state.tasks).toContainEqual(newTask);
      expect(state.error).toBeNull();
    });

    it('should add task to existing tasks', async () => {
      const existingTask = createMockTask({ id: 'existing-task', title: 'Existing' });
      useTaskStore.setState({ tasks: [existingTask] });

      const newTask = createMockTask({ id: 'new-task', title: 'New Task' });
      vi.mocked(taskService.createTask).mockResolvedValueOnce(newTask);

      await act(async () => {
        await useTaskStore.getState().createTask({
          title: 'New Task',
          projectId: 'test-project-id',
        });
      });

      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(2);
      expect(state.tasks).toContainEqual(existingTask);
      expect(state.tasks).toContainEqual(newTask);
    });

    it('should set error when create fails', async () => {
      vi.mocked(taskService.createTask).mockRejectedValueOnce(new Error('Create failed'));

      await act(async () => {
        await useTaskStore.getState().createTask({
          title: 'New Task',
          projectId: 'test-project-id',
        });
      });

      const state = useTaskStore.getState();
      expect(state.error).toBe('Create failed');
    });
  });

  describe('updateTaskContent', () => {
    it('should update task content successfully', async () => {
      const mockTask = createMockTask({ id: 'task-1', title: 'Original Title' });
      useTaskStore.setState({ tasks: [mockTask] });

      const updatedTask = createMockTask({
        id: 'task-1',
        title: 'Updated Title',
        featureList: 'Updated feature list',
      });
      vi.mocked(taskService.updateTask).mockResolvedValueOnce(updatedTask);

      await act(async () => {
        await useTaskStore.getState().updateTaskContent('task-1', {
          title: 'Updated Title',
          featureList: 'Updated feature list',
        });
      });

      const state = useTaskStore.getState();
      expect(state.tasks[0].title).toBe('Updated Title');
      expect(state.tasks[0].featureList).toBe('Updated feature list');
    });

    it('should set error when update fails', async () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ tasks: [mockTask] });

      vi.mocked(taskService.updateTask).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        await useTaskStore.getState().updateTaskContent('task-1', { title: 'New Title' });
      });

      const state = useTaskStore.getState();
      expect(state.error).toBe('Update failed');
    });

    it('should not update if task not found', async () => {
      useTaskStore.setState({ tasks: [] });

      await act(async () => {
        await useTaskStore.getState().updateTaskContent('non-existent', { title: 'New' });
      });

      expect(taskService.updateTask).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const task1 = createMockTask({ id: 'task-1', title: 'Task 1' });
      const task2 = createMockTask({ id: 'task-2', title: 'Task 2' });
      useTaskStore.setState({ tasks: [task1, task2] });

      vi.mocked(taskService.deleteTask).mockResolvedValueOnce();

      await act(async () => {
        await useTaskStore.getState().deleteTask('task-1');
      });

      const state = useTaskStore.getState();
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('task-2');
    });

    it('should perform optimistic delete', async () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ tasks: [mockTask] });

      let tasksAfterOptimistic: Task[] = [];
      vi.mocked(taskService.deleteTask).mockImplementation(async () => {
        tasksAfterOptimistic = useTaskStore.getState().tasks;
      });

      await act(async () => {
        await useTaskStore.getState().deleteTask('task-1');
      });

      // Task should be removed immediately (optimistic update)
      expect(tasksAfterOptimistic).toHaveLength(0);
    });

    it('should rollback on delete failure', async () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ tasks: [mockTask] });

      vi.mocked(taskService.deleteTask).mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        await useTaskStore.getState().deleteTask('task-1');
      });

      const state = useTaskStore.getState();
      // Task should be restored after failure
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].id).toBe('task-1');
      expect(state.error).toBe('Delete failed');
    });

    it('should not delete if task not found', async () => {
      useTaskStore.setState({ tasks: [] });

      await act(async () => {
        await useTaskStore.getState().deleteTask('non-existent');
      });

      expect(taskService.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('modal state management', () => {
    it('should have initial modal state closed', () => {
      const state = useTaskStore.getState();

      expect(state.isCreateModalOpen).toBe(false);
      expect(state.isEditModalOpen).toBe(false);
      expect(state.isDeleteConfirmOpen).toBe(false);
      expect(state.selectedTask).toBeNull();
    });

    it('should open create modal', () => {
      act(() => {
        useTaskStore.getState().openCreateModal();
      });

      const state = useTaskStore.getState();
      expect(state.isCreateModalOpen).toBe(true);
    });

    it('should close create modal', () => {
      useTaskStore.setState({ isCreateModalOpen: true });

      act(() => {
        useTaskStore.getState().closeCreateModal();
      });

      const state = useTaskStore.getState();
      expect(state.isCreateModalOpen).toBe(false);
    });

    it('should open edit modal with selected task', () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ tasks: [mockTask] });

      act(() => {
        useTaskStore.getState().openEditModal(mockTask);
      });

      const state = useTaskStore.getState();
      expect(state.isEditModalOpen).toBe(true);
      expect(state.selectedTask).toEqual(mockTask);
    });

    it('should close edit modal and clear selected task', () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ isEditModalOpen: true, selectedTask: mockTask });

      act(() => {
        useTaskStore.getState().closeEditModal();
      });

      const state = useTaskStore.getState();
      expect(state.isEditModalOpen).toBe(false);
      expect(state.selectedTask).toBeNull();
    });

    it('should open delete confirm with selected task', () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ tasks: [mockTask] });

      act(() => {
        useTaskStore.getState().openDeleteConfirm(mockTask);
      });

      const state = useTaskStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(true);
      expect(state.selectedTask).toEqual(mockTask);
    });

    it('should close delete confirm and clear selected task', () => {
      const mockTask = createMockTask({ id: 'task-1' });
      useTaskStore.setState({ isDeleteConfirmOpen: true, selectedTask: mockTask });

      act(() => {
        useTaskStore.getState().closeDeleteConfirm();
      });

      const state = useTaskStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(false);
      expect(state.selectedTask).toBeNull();
    });
  });
});
