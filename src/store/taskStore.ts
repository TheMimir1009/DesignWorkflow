/**
 * Task Store - Zustand State Management
 * Centralized state management for tasks with optimistic updates and AI generation
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../types';
import * as taskService from '../services/taskService';

/**
 * Task store state interface
 */
export interface TaskStoreState {
  tasks: Task[];
  generatingTasks: Set<string>;
  isLoading: boolean;
  error: string | null;
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  selectedTask: Task | null;
}

/**
 * Task store actions interface
 */
export interface TaskStoreActions {
  fetchTasks: (projectId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
  setGenerating: (taskId: string, isGenerating: boolean) => void;
  isGenerating: (taskId: string) => boolean;
  triggerAIGeneration: (taskId: string, targetStatus: TaskStatus) => Promise<void>;
  clearError: () => void;
  // CRUD actions
  createTask: (data: CreateTaskDto) => Promise<void>;
  updateTaskContent: (taskId: string, data: UpdateTaskDto) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // Modal actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (task: Task) => void;
  closeDeleteConfirm: () => void;
}

/**
 * Combined task store type
 */
export type TaskStore = TaskStoreState & TaskStoreActions;

/**
 * Task store with Zustand
 */
export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      generatingTasks: new Set<string>(),
      isLoading: false,
      error: null,
      // Modal state
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteConfirmOpen: false,
      selectedTask: null,

      // Actions
      fetchTasks: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchTasks/start');
        try {
          const tasks = await taskService.getTasks(projectId);
          set({
            tasks,
            isLoading: false,
            error: null,
          }, false, 'fetchTasks/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'fetchTasks/error');
        }
      },

      updateTaskStatus: async (taskId: string, newStatus: TaskStatus) => {
        const { tasks } = get();
        const taskIndex = tasks.findIndex((t) => t.id === taskId);

        if (taskIndex === -1) {
          return; // Task not found, do nothing
        }

        const originalTask = tasks[taskIndex];
        const originalStatus = originalTask.status;

        // Optimistic update
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = { ...originalTask, status: newStatus };
        set({ tasks: updatedTasks }, false, 'updateTaskStatus/optimistic');

        try {
          const updatedTask = await taskService.updateTaskStatus(taskId, newStatus);
          const currentTasks = get().tasks;
          const newTasks = currentTasks.map((t) =>
            t.id === taskId ? updatedTask : t
          );
          set({ tasks: newTasks, error: null }, false, 'updateTaskStatus/success');
        } catch (error) {
          // Rollback on failure
          const currentTasks = get().tasks;
          const rollbackTasks = currentTasks.map((t) =>
            t.id === taskId ? { ...t, status: originalStatus } : t
          );
          set({
            tasks: rollbackTasks,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateTaskStatus/rollback');
        }
      },

      getTasksByStatus: (status: TaskStatus) => {
        return get().tasks.filter((task) => task.status === status);
      },

      setGenerating: (taskId: string, isGenerating: boolean) => {
        const { generatingTasks } = get();
        const newSet = new Set(generatingTasks);

        if (isGenerating) {
          newSet.add(taskId);
        } else {
          newSet.delete(taskId);
        }

        set({ generatingTasks: newSet }, false, 'setGenerating');
      },

      isGenerating: (taskId: string) => {
        return get().generatingTasks.has(taskId);
      },

      triggerAIGeneration: async (taskId: string, targetStatus: TaskStatus) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);

        if (!task) {
          return; // Task not found, do nothing
        }

        // Set generating state
        get().setGenerating(taskId, true);

        try {
          const updatedTask = await taskService.triggerAI(taskId, targetStatus);

          // Update task with generated content
          const currentTasks = get().tasks;
          const newTasks = currentTasks.map((t) =>
            t.id === taskId ? updatedTask : t
          );
          set({ tasks: newTasks, error: null }, false, 'triggerAIGeneration/success');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'triggerAIGeneration/error');
        } finally {
          // Clear generating state
          get().setGenerating(taskId, false);
        }
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      // CRUD actions
      createTask: async (data: CreateTaskDto) => {
        try {
          const newTask = await taskService.createTask(data);
          const { tasks } = get();
          set({ tasks: [...tasks, newTask], error: null }, false, 'createTask/success');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createTask/error');
        }
      },

      updateTaskContent: async (taskId: string, data: UpdateTaskDto) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);

        if (!task) {
          return; // Task not found, do nothing
        }

        try {
          const updatedTask = await taskService.updateTask(taskId, data);
          const currentTasks = get().tasks;
          const newTasks = currentTasks.map((t) =>
            t.id === taskId ? updatedTask : t
          );
          set({ tasks: newTasks, error: null }, false, 'updateTaskContent/success');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateTaskContent/error');
        }
      },

      deleteTask: async (taskId: string) => {
        const { tasks } = get();
        const taskIndex = tasks.findIndex((t) => t.id === taskId);

        if (taskIndex === -1) {
          return; // Task not found, do nothing
        }

        const originalTask = tasks[taskIndex];

        // Optimistic delete
        const filteredTasks = tasks.filter((t) => t.id !== taskId);
        set({ tasks: filteredTasks }, false, 'deleteTask/optimistic');

        try {
          await taskService.deleteTask(taskId);
          set({ error: null }, false, 'deleteTask/success');
        } catch (error) {
          // Rollback on failure
          const currentTasks = get().tasks;
          set({
            tasks: [...currentTasks.slice(0, taskIndex), originalTask, ...currentTasks.slice(taskIndex)],
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deleteTask/rollback');
        }
      },

      // Modal actions
      openCreateModal: () => {
        set({ isCreateModalOpen: true }, false, 'openCreateModal');
      },

      closeCreateModal: () => {
        set({ isCreateModalOpen: false }, false, 'closeCreateModal');
      },

      openEditModal: (task: Task) => {
        set({ isEditModalOpen: true, selectedTask: task }, false, 'openEditModal');
      },

      closeEditModal: () => {
        set({ isEditModalOpen: false, selectedTask: null }, false, 'closeEditModal');
      },

      openDeleteConfirm: (task: Task) => {
        set({ isDeleteConfirmOpen: true, selectedTask: task }, false, 'openDeleteConfirm');
      },

      closeDeleteConfirm: () => {
        set({ isDeleteConfirmOpen: false, selectedTask: null }, false, 'closeDeleteConfirm');
      },
    }),
    { name: 'TaskStore' }
  )
);
