/**
 * User Management Routes Tests
 * TDD tests for user CRUD API endpoints
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import fs from 'fs/promises';
import { createApp } from '../../../server/index';
import { USERS_DIR_PATH } from '../../../server/utils/userStorage';

describe('User Management Routes', () => {
  let app: Express;
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let normalUserId: string;

  beforeEach(async () => {
    // Clean up test data
    try {
      await fs.rm(USERS_DIR_PATH, { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
    app = createApp();

    // Create admin user
    const adminRegister = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123',
        name: 'Admin User',
      });
    adminUserId = adminRegister.body.data.id;

    // Manually update admin role (in real app this would be done differently)
    // For now, create a helper to make user admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123',
      });
    adminToken = adminLogin.body.data.token;

    // Make this user admin by using a special endpoint or direct storage update
    await request(app)
      .post('/api/users/make-admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: adminUserId });

    // Re-login to get updated token with admin role
    const adminReLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123',
      });
    adminToken = adminReLogin.body.data.token;

    // Create normal user
    const userRegister = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@test.com',
        password: 'UserPass123',
        name: 'Normal User',
      });
    normalUserId = userRegister.body.data.id;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'UserPass123',
      });
    userToken = userLogin.body.data.token;
  });

  afterEach(async () => {
    try {
      await fs.rm(USERS_DIR_PATH, { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
  });

  describe('GET /api/users', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });

    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      // Should not expose passwordHash
      response.body.data.forEach((user: { passwordHash?: string }) => {
        expect(user.passwordHash).toBeUndefined();
      });
    });
  });

  describe('PUT /api/users/:userId', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/users/${normalUserId}`)
        .send({ name: 'Updated Name' });
      expect(response.status).toBe(401);
    });

    it('should allow user to update their own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated User Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated User Name');
      expect(response.body.data.passwordHash).toBeUndefined();
    });

    it('should allow user to update their own email', async () => {
      const response = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'newemail@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('newemail@test.com');
    });

    it('should allow user to update their own password', async () => {
      const response = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: 'NewPassword456' });

      expect(response.status).toBe(200);

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'NewPassword456',
        });
      expect(loginResponse.status).toBe(200);
    });

    it('should forbid user from updating another user profile', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(403);
    });

    it('should allow admin to update any user', async () => {
      const response = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Admin Updated Name');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
    });

    it('should validate password strength on update', async () => {
      const response = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: 'weak' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/users/:userId', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/users/${normalUserId}`);
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });

    it('should allow admin to delete users', async () => {
      const response = await request(app)
        .delete(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify user is deleted
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'UserPass123',
        });
      expect(loginResponse.status).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });
  });
});
