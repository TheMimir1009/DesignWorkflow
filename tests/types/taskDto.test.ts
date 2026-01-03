/**
 * Task DTO Type Tests
 * TDD test suite for Task Create/Update DTO interfaces
 */
import { describe, it, expect } from 'vitest';
import type {
  CreateTaskDto,
  UpdateTaskDto,
  TaskModalState,
} from '../../src/types';

describe('Task DTOs', () => {
  describe('CreateTaskDto', () => {
    it('should accept valid create task data with required fields', () => {
      const dto: CreateTaskDto = {
        title: 'New Feature Task',
        projectId: 'project-123',
      };

      expect(dto.title).toBe('New Feature Task');
      expect(dto.projectId).toBe('project-123');
    });

    it('should accept create task data with optional featureList', () => {
      const dto: CreateTaskDto = {
        title: 'New Feature Task',
        projectId: 'project-123',
        featureList: 'Feature description in markdown',
      };

      expect(dto.featureList).toBe('Feature description in markdown');
    });

    it('should accept create task data with optional references', () => {
      const dto: CreateTaskDto = {
        title: 'New Feature Task',
        projectId: 'project-123',
        references: ['ref-1', 'ref-2'],
      };

      expect(dto.references).toEqual(['ref-1', 'ref-2']);
    });
  });

  describe('UpdateTaskDto', () => {
    it('should accept partial task update with title only', () => {
      const dto: UpdateTaskDto = {
        title: 'Updated Title',
      };

      expect(dto.title).toBe('Updated Title');
    });

    it('should accept partial task update with featureList only', () => {
      const dto: UpdateTaskDto = {
        featureList: 'Updated feature list content',
      };

      expect(dto.featureList).toBe('Updated feature list content');
    });

    it('should accept partial task update with references only', () => {
      const dto: UpdateTaskDto = {
        references: ['new-ref-1', 'new-ref-2'],
      };

      expect(dto.references).toEqual(['new-ref-1', 'new-ref-2']);
    });

    it('should accept partial task update with multiple fields', () => {
      const dto: UpdateTaskDto = {
        title: 'Updated Title',
        featureList: 'Updated feature list',
        designDocument: 'Updated design document',
        references: ['ref-1'],
      };

      expect(dto.title).toBe('Updated Title');
      expect(dto.featureList).toBe('Updated feature list');
      expect(dto.designDocument).toBe('Updated design document');
      expect(dto.references).toEqual(['ref-1']);
    });

    it('should accept empty update object', () => {
      const dto: UpdateTaskDto = {};

      expect(Object.keys(dto).length).toBe(0);
    });
  });

  describe('TaskModalState', () => {
    it('should have correct initial closed state', () => {
      const state: TaskModalState = {
        isCreateModalOpen: false,
        isEditModalOpen: false,
        isDeleteConfirmOpen: false,
        selectedTask: null,
      };

      expect(state.isCreateModalOpen).toBe(false);
      expect(state.isEditModalOpen).toBe(false);
      expect(state.isDeleteConfirmOpen).toBe(false);
      expect(state.selectedTask).toBeNull();
    });

    it('should allow create modal open state', () => {
      const state: TaskModalState = {
        isCreateModalOpen: true,
        isEditModalOpen: false,
        isDeleteConfirmOpen: false,
        selectedTask: null,
      };

      expect(state.isCreateModalOpen).toBe(true);
    });

    it('should allow edit modal with selected task', () => {
      const mockTask = {
        id: 'task-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'featurelist' as const,
        featureList: 'Feature content',
        designDocument: null,
        prd: null,
        prototype: null,
        references: [],
        qaAnswers: [],
        revisions: [],
        isArchived: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const state: TaskModalState = {
        isCreateModalOpen: false,
        isEditModalOpen: true,
        isDeleteConfirmOpen: false,
        selectedTask: mockTask,
      };

      expect(state.isEditModalOpen).toBe(true);
      expect(state.selectedTask).toEqual(mockTask);
    });

    it('should allow delete confirm with selected task', () => {
      const mockTask = {
        id: 'task-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'featurelist' as const,
        featureList: 'Feature content',
        designDocument: null,
        prd: null,
        prototype: null,
        references: [],
        qaAnswers: [],
        revisions: [],
        isArchived: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const state: TaskModalState = {
        isCreateModalOpen: false,
        isEditModalOpen: false,
        isDeleteConfirmOpen: true,
        selectedTask: mockTask,
      };

      expect(state.isDeleteConfirmOpen).toBe(true);
      expect(state.selectedTask).toEqual(mockTask);
    });
  });
});
