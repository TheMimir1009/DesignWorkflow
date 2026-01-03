/**
 * Task Service Tests
 * TDD test suite for Task API communication layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTasks,
  updateTaskStatus,
  triggerAI,
  createTask,
  updateTask,
  deleteTask,
  API_BASE_URL,
} from '../../src/services/taskService';
import type { Task, ApiResponse, CreateTaskDto, UpdateTaskDto } from '../../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

const createApiResponse = <T>(data: T, success = true, error: string | null = null): ApiResponse<T> => ({
  success,
  data,
  error,
});

describe('taskService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API_BASE_URL', () => {
    it('should be defined as http://localhost:3001', () => {
      expect(API_BASE_URL).toBe('http://localhost:3001');
    });
  });

  describe('getTasks', () => {
    it('should fetch all tasks for a project successfully', async () => {
      const mockTasks = [
        createMockTask({ id: 'task-1', title: 'Task 1' }),
        createMockTask({ id: 'task-2', title: 'Task 2' }),
      ];
      const mockResponse = createApiResponse(mockTasks);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getTasks('test-project-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/test-project-id/tasks`
      );
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks exist', async () => {
      const mockResponse = createApiResponse<Task[]>([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getTasks('empty-project-id');

      expect(result).toEqual([]);
    });

    it('should throw error when API returns unsuccessful response', async () => {
      const mockResponse = createApiResponse<Task[] | null>(null, false, 'Server error');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getTasks('test-project-id')).rejects.toThrow('Server error');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTasks('test-project-id')).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getTasks('test-project-id')).rejects.toThrow();
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const updatedTask = createMockTask({
        id: 'task-1',
        status: 'design',
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
      const mockResponse = createApiResponse(updatedTask);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateTaskStatus('task-1', 'design');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/tasks/task-1/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'design' }),
      });
      expect(result.status).toBe('design');
    });

    it('should throw error when task not found', async () => {
      const mockResponse = createApiResponse<Task | null>(null, false, 'Task not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(updateTaskStatus('non-existent-id', 'design')).rejects.toThrow('Task not found');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(updateTaskStatus('task-1', 'design')).rejects.toThrow('Network error');
    });
  });

  describe('triggerAI', () => {
    it('should trigger AI generation for a task', async () => {
      const updatedTask = createMockTask({
        id: 'task-1',
        status: 'design',
        designDocument: 'Generated design document content',
      });
      const mockResponse = createApiResponse(updatedTask);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await triggerAI('task-1', 'design');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/tasks/task-1/trigger-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetStatus: 'design' }),
      });
      expect(result.designDocument).toBe('Generated design document content');
    });

    it('should throw error when task not found', async () => {
      const mockResponse = createApiResponse<Task | null>(null, false, 'Task not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(triggerAI('non-existent-id', 'design')).rejects.toThrow('Task not found');
    });

    it('should throw error when AI generation fails', async () => {
      const mockResponse = createApiResponse<Task | null>(null, false, 'AI generation failed');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(triggerAI('task-1', 'design')).rejects.toThrow('AI generation failed');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(triggerAI('task-1', 'design')).rejects.toThrow('Network error');
    });
  });

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      const createDto: CreateTaskDto = {
        title: 'New Feature Task',
        projectId: 'test-project-id',
        featureList: 'Feature description',
        references: ['ref-1'],
      };

      const createdTask = createMockTask({
        id: 'new-task-id',
        title: 'New Feature Task',
        projectId: 'test-project-id',
        featureList: 'Feature description',
        references: ['ref-1'],
      });
      const mockResponse = createApiResponse(createdTask);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createTask(createDto);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/test-project-id/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createDto),
        }
      );
      expect(result.id).toBe('new-task-id');
      expect(result.title).toBe('New Feature Task');
    });

    it('should create task with minimal data (title and projectId only)', async () => {
      const createDto: CreateTaskDto = {
        title: 'Minimal Task',
        projectId: 'test-project-id',
      };

      const createdTask = createMockTask({
        id: 'minimal-task-id',
        title: 'Minimal Task',
        projectId: 'test-project-id',
        featureList: '',
        references: [],
      });
      const mockResponse = createApiResponse(createdTask);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createTask(createDto);

      expect(result.title).toBe('Minimal Task');
    });

    it('should throw error when project not found', async () => {
      const createDto: CreateTaskDto = {
        title: 'New Task',
        projectId: 'non-existent-project',
      };

      const mockResponse = createApiResponse<Task | null>(null, false, 'Project not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createTask(createDto)).rejects.toThrow('Project not found');
    });

    it('should throw error when fetch fails', async () => {
      const createDto: CreateTaskDto = {
        title: 'New Task',
        projectId: 'test-project-id',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createTask(createDto)).rejects.toThrow('Network error');
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
        featureList: 'Updated feature list content',
      };

      const updatedTask = createMockTask({
        id: 'task-1',
        title: 'Updated Title',
        featureList: 'Updated feature list content',
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
      const mockResponse = createApiResponse(updatedTask);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateTask('task-1', updateDto);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/tasks/task-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto),
      });
      expect(result.title).toBe('Updated Title');
      expect(result.featureList).toBe('Updated feature list content');
    });

    it('should update task references', async () => {
      const updateDto: UpdateTaskDto = {
        references: ['ref-1', 'ref-2', 'ref-3'],
      };

      const updatedTask = createMockTask({
        id: 'task-1',
        references: ['ref-1', 'ref-2', 'ref-3'],
      });
      const mockResponse = createApiResponse(updatedTask);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateTask('task-1', updateDto);

      expect(result.references).toEqual(['ref-1', 'ref-2', 'ref-3']);
    });

    it('should throw error when task not found', async () => {
      const updateDto: UpdateTaskDto = { title: 'Updated' };
      const mockResponse = createApiResponse<Task | null>(null, false, 'Task not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(updateTask('non-existent-id', updateDto)).rejects.toThrow('Task not found');
    });

    it('should throw error when fetch fails', async () => {
      const updateDto: UpdateTaskDto = { title: 'Updated' };
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(updateTask('task-1', updateDto)).rejects.toThrow('Network error');
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const mockResponse = createApiResponse({ success: true });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await deleteTask('task-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/tasks/task-1`, {
        method: 'DELETE',
      });
    });

    it('should throw error when task not found', async () => {
      const mockResponse = createApiResponse<{ success: boolean } | null>(
        null,
        false,
        'Task not found'
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(deleteTask('non-existent-id')).rejects.toThrow('Task not found');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteTask('task-1')).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(deleteTask('task-1')).rejects.toThrow();
    });
  });
});
