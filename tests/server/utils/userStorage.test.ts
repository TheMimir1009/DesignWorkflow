/**
 * User Storage Utility Tests
 * TDD tests for user persistence operations
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from '../../../server/utils/userStorage';

// Test workspace path
const TEST_WORKSPACE_PATH = path.join(process.cwd(), 'workspace');
const TEST_USERS_DIR = path.join(TEST_WORKSPACE_PATH, 'users');

describe('userStorage', () => {
  // Clean up test data before and after each test
  beforeEach(async () => {
    // Ensure clean state
    try {
      await fs.rm(TEST_USERS_DIR, { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await fs.rm(TEST_USERS_DIR, { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users exist', async () => {
      const users = await getAllUsers();
      expect(users).toEqual([]);
    });

    it('should return all users when users exist', async () => {
      // Create test users
      await createUser({
        email: 'user1@test.com',
        password: 'Password123',
        name: 'User One',
      });
      await createUser({
        email: 'user2@test.com',
        password: 'Password456',
        name: 'User Two',
      });

      const users = await getAllUsers();
      expect(users).toHaveLength(2);
      expect(users.map(u => u.email)).toContain('user1@test.com');
      expect(users.map(u => u.email)).toContain('user2@test.com');
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const user = await getUserById('non-existent-id');
      expect(user).toBeNull();
    });

    it('should return user by id', async () => {
      const created = await createUser({
        email: 'test@test.com',
        password: 'Password123',
        name: 'Test User',
      });

      const user = await getUserById(created.id);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe('test@test.com');
    });
  });

  describe('getUserByEmail', () => {
    it('should return null for non-existent email', async () => {
      const user = await getUserByEmail('nonexistent@test.com');
      expect(user).toBeNull();
    });

    it('should return user by email', async () => {
      await createUser({
        email: 'findme@test.com',
        password: 'Password123',
        name: 'Find Me',
      });

      const user = await getUserByEmail('findme@test.com');
      expect(user).not.toBeNull();
      expect(user?.email).toBe('findme@test.com');
      expect(user?.name).toBe('Find Me');
    });

    it('should be case-insensitive for email lookup', async () => {
      await createUser({
        email: 'CaseTest@Test.com',
        password: 'Password123',
        name: 'Case Test',
      });

      const user = await getUserByEmail('casetest@test.com');
      expect(user).not.toBeNull();
      expect(user?.email).toBe('casetest@test.com');
    });
  });

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const user = await createUser({
        email: 'new@test.com',
        password: 'Password123',
        name: 'New User',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('new@test.com');
      expect(user.name).toBe('New User');
      expect(user.role).toBe('user');
      expect(user.passwordHash).not.toBe('Password123');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Verify password was hashed with bcrypt
      const isValid = await bcrypt.compare('Password123', user.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should normalize email to lowercase', async () => {
      const user = await createUser({
        email: 'UPPERCASE@TEST.COM',
        password: 'Password123',
        name: 'Upper Case',
      });

      expect(user.email).toBe('uppercase@test.com');
    });

    it('should trim whitespace from name', async () => {
      const user = await createUser({
        email: 'trim@test.com',
        password: 'Password123',
        name: '  Trimmed Name  ',
      });

      expect(user.name).toBe('Trimmed Name');
    });

    it('should persist user to storage', async () => {
      const created = await createUser({
        email: 'persist@test.com',
        password: 'Password123',
        name: 'Persist Test',
      });

      // Verify persisted by retrieving
      const retrieved = await getUserById(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.email).toBe('persist@test.com');
    });

    it('should use bcrypt salt rounds of 12', async () => {
      const user = await createUser({
        email: 'salt@test.com',
        password: 'Password123',
        name: 'Salt Test',
      });

      // bcrypt hash with 12 rounds starts with $2b$12$
      expect(user.passwordHash).toMatch(/^\$2[ab]\$12\$/);
    });
  });

  describe('updateUser', () => {
    it('should return null for non-existent user', async () => {
      const result = await updateUser('non-existent-id', { name: 'New Name' });
      expect(result).toBeNull();
    });

    it('should update user name', async () => {
      const created = await createUser({
        email: 'update@test.com',
        password: 'Password123',
        name: 'Original Name',
      });

      const updated = await updateUser(created.id, { name: 'Updated Name' });
      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.email).toBe('update@test.com');
    });

    it('should update user email', async () => {
      const created = await createUser({
        email: 'old@test.com',
        password: 'Password123',
        name: 'Email Update',
      });

      const updated = await updateUser(created.id, { email: 'new@test.com' });
      expect(updated).not.toBeNull();
      expect(updated?.email).toBe('new@test.com');
    });

    it('should hash new password when updating', async () => {
      const created = await createUser({
        email: 'pwupdate@test.com',
        password: 'OldPassword123',
        name: 'Password Update',
      });

      const updated = await updateUser(created.id, { password: 'NewPassword456' });
      expect(updated).not.toBeNull();

      // Verify new password works
      const isNewValid = await bcrypt.compare('NewPassword456', updated!.passwordHash);
      expect(isNewValid).toBe(true);

      // Verify old password doesn't work
      const isOldValid = await bcrypt.compare('OldPassword123', updated!.passwordHash);
      expect(isOldValid).toBe(false);
    });

    it('should update updatedAt timestamp', async () => {
      const created = await createUser({
        email: 'timestamp@test.com',
        password: 'Password123',
        name: 'Timestamp Test',
      });

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await updateUser(created.id, { name: 'New Name' });
      expect(updated).not.toBeNull();
      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
        new Date(created.updatedAt).getTime()
      );
    });

    it('should persist changes to storage', async () => {
      const created = await createUser({
        email: 'persistupdate@test.com',
        password: 'Password123',
        name: 'Before Update',
      });

      await updateUser(created.id, { name: 'After Update' });

      const retrieved = await getUserById(created.id);
      expect(retrieved?.name).toBe('After Update');
    });
  });

  describe('deleteUser', () => {
    it('should return false for non-existent user', async () => {
      const result = await deleteUser('non-existent-id');
      expect(result).toBe(false);
    });

    it('should delete existing user', async () => {
      const created = await createUser({
        email: 'delete@test.com',
        password: 'Password123',
        name: 'Delete Me',
      });

      const result = await deleteUser(created.id);
      expect(result).toBe(true);

      const retrieved = await getUserById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should not affect other users when deleting', async () => {
      const user1 = await createUser({
        email: 'keep1@test.com',
        password: 'Password123',
        name: 'Keep One',
      });
      const user2 = await createUser({
        email: 'delete2@test.com',
        password: 'Password123',
        name: 'Delete Two',
      });
      const user3 = await createUser({
        email: 'keep3@test.com',
        password: 'Password123',
        name: 'Keep Three',
      });

      await deleteUser(user2.id);

      const remaining = await getAllUsers();
      expect(remaining).toHaveLength(2);
      expect(remaining.map(u => u.id)).toContain(user1.id);
      expect(remaining.map(u => u.id)).toContain(user3.id);
      expect(remaining.map(u => u.id)).not.toContain(user2.id);
    });
  });
});
