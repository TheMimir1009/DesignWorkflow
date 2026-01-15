/**
 * 타입 정의 테스트
 * DesignWorkflow 핵심 엔티티 타입 검증
 */

import { describe, it, expect } from 'vitest';
import type {
  EntityId,
  Timestamps,
  BaseEntity,
  UserRole,
  User,
  TaskStatus,
  Task,
  Project,
  FileMetadata,
  NotificationType,
  Notification,
} from './index.js';

describe('Core Entity Types', () => {
  describe('EntityId', () => {
    it('should accept valid UUID format', () => {
      const validId: EntityId = '550e8400-e29b-41d4-a716-446655440000';
      expect(validId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should reject invalid format', () => {
      const invalidId = 'not-a-uuid';
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(invalidId).not.toMatch(isUUID);
    });
  });

  describe('Timestamps', () => {
    it('should have readonly createdAt and updatedAt', () => {
      const timestamps: Timestamps = {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      expect(timestamps.createdAt).toBeInstanceOf(Date);
      expect(timestamps.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('BaseEntity', () => {
    it('should extend Timestamps with id', () => {
      const entity: BaseEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entity.id).toBeDefined();
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('UserRole', () => {
    it('should accept valid user roles', () => {
      const admin: UserRole = 'admin';
      const editor: UserRole = 'editor';
      const viewer: UserRole = 'viewer';

      expect(admin).toBe('admin');
      expect(editor).toBe('editor');
      expect(viewer).toBe('viewer');
    });
  });

  describe('User', () => {
    it('should have required user properties', () => {
      const user: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('admin');
    });
  });

  describe('TaskStatus', () => {
    it('should accept valid task statuses', () => {
      const pending: TaskStatus = 'pending';
      const inProgress: TaskStatus = 'in_progress';
      const completed: TaskStatus = 'completed';
      const blocked: TaskStatus = 'blocked';

      expect(pending).toBe('pending');
      expect(inProgress).toBe('in_progress');
      expect(completed).toBe('completed');
      expect(blocked).toBe('blocked');
    });
  });

  describe('Task', () => {
    it('should have required task properties', () => {
      const task: Task = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe('pending');
    });

    it('should have optional assigneeId and dueDate', () => {
      const taskWithOptional: Task = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        assigneeId: '550e8400-e29b-41d4-a716-446655440001',
        dueDate: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(taskWithOptional.assigneeId).toBeDefined();
      expect(taskWithOptional.dueDate).toBeInstanceOf(Date);
    });
  });

  describe('Project', () => {
    it('should have required project properties', () => {
      const ownerId = '550e8400-e29b-41d4-a716-446655440000';
      const members: readonly EntityId[] = [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ];

      const project: Project = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Test Project',
        description: 'Test Project Description',
        ownerId,
        members,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('Test Project Description');
      expect(project.ownerId).toBe(ownerId);
      expect(project.members).toEqual(members);
    });
  });

  describe('FileMetadata', () => {
    it('should have file metadata properties', () => {
      const metadata: FileMetadata = {
        name: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
        path: '/uploads/test.txt',
      };

      expect(metadata.name).toBe('test.txt');
      expect(metadata.size).toBe(1024);
      expect(metadata.mimeType).toBe('text/plain');
      expect(metadata.path).toBe('/uploads/test.txt');
    });
  });

  describe('NotificationType', () => {
    it('should accept valid notification types', () => {
      const info: NotificationType = 'info';
      const success: NotificationType = 'success';
      const warning: NotificationType = 'warning';
      const error: NotificationType = 'error';

      expect(info).toBe('info');
      expect(success).toBe('success');
      expect(warning).toBe('warning');
      expect(error).toBe('error');
    });
  });

  describe('Notification', () => {
    it('should have required notification properties', () => {
      const notification: Notification = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.id).toBeDefined();
      expect(notification.type).toBe('info');
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('This is a test notification');
      expect(notification.userId).toBeDefined();
      expect(notification.read).toBe(false);
    });
  });
});
