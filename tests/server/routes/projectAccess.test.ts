/**
 * Project Access Routes Tests
 * TDD tests for project access control API endpoints
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../../../server/index';
import { USERS_DIR_PATH } from '../../../server/utils/userStorage';
import { setProjectAccess } from '../../../server/utils/accessStorage';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Project Access Routes', () => {
  let app: Express;
  let ownerToken: string;
  let editorToken: string;
  let viewerToken: string;
  let nonMemberToken: string;
  let ownerId: string;
  let editorId: string;
  let viewerId: string;
  let nonMemberId: string;
  let projectId: string;

  beforeEach(async () => {
    // Clean up test data
    try {
      await fs.rm(USERS_DIR_PATH, { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }

    app = createApp();

    // Create project directory
    projectId = 'test-access-project';
    await fs.mkdir(path.join(WORKSPACE_PATH, projectId), { recursive: true });

    // Create owner user
    const ownerRegister = await request(app)
      .post('/api/auth/register')
      .send({ email: 'owner@test.com', password: 'Password123', name: 'Owner' });
    ownerId = ownerRegister.body.data.id;
    await setProjectAccess(projectId, ownerId, 'owner', ownerId);
    const ownerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@test.com', password: 'Password123' });
    ownerToken = ownerLogin.body.data.token;

    // Create editor user
    const editorRegister = await request(app)
      .post('/api/auth/register')
      .send({ email: 'editor@test.com', password: 'Password123', name: 'Editor' });
    editorId = editorRegister.body.data.id;
    await setProjectAccess(projectId, editorId, 'editor', ownerId);
    const editorLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'editor@test.com', password: 'Password123' });
    editorToken = editorLogin.body.data.token;

    // Create viewer user
    const viewerRegister = await request(app)
      .post('/api/auth/register')
      .send({ email: 'viewer@test.com', password: 'Password123', name: 'Viewer' });
    viewerId = viewerRegister.body.data.id;
    await setProjectAccess(projectId, viewerId, 'viewer', ownerId);
    const viewerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@test.com', password: 'Password123' });
    viewerToken = viewerLogin.body.data.token;

    // Create non-member user (no project access)
    const nonMemberRegister = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nonmember@test.com', password: 'Password123', name: 'Non Member' });
    nonMemberId = nonMemberRegister.body.data.id;
    const nonMemberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonmember@test.com', password: 'Password123' });
    nonMemberToken = nonMemberLogin.body.data.token;
  });

  afterEach(async () => {
    try {
      await fs.rm(USERS_DIR_PATH, { recursive: true, force: true });
      await fs.rm(path.join(WORKSPACE_PATH, projectId), { recursive: true, force: true });
    } catch {
      // Directories may not exist
    }
  });

  describe('GET /api/projects/:projectId/access', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/access`);
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-member', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${nonMemberToken}`);
      expect(response.status).toBe(403);
    });

    it('should return 403 for viewer', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(response.status).toBe(403);
    });

    it('should allow editor to view access list', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
    });

    it('should allow owner to view access list', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);
    });

    it('should return access entries with correct structure', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      const accessEntry = response.body.data[0];
      expect(accessEntry).toHaveProperty('userId');
      expect(accessEntry).toHaveProperty('projectId');
      expect(accessEntry).toHaveProperty('role');
      expect(accessEntry).toHaveProperty('grantedBy');
      expect(accessEntry).toHaveProperty('grantedAt');
    });
  });

  describe('PUT /api/projects/:projectId/access', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .send({ userId: nonMemberId, role: 'viewer' });
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-member', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .send({ userId: nonMemberId, role: 'viewer' });
      expect(response.status).toBe(403);
    });

    it('should return 403 for viewer', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ userId: nonMemberId, role: 'viewer' });
      expect(response.status).toBe(403);
    });

    it('should return 403 for editor', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ userId: nonMemberId, role: 'viewer' });
      expect(response.status).toBe(403);
    });

    it('should allow owner to grant access', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: nonMemberId, role: 'editor' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(nonMemberId);
      expect(response.body.data.role).toBe('editor');
    });

    it('should allow owner to update existing access', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: viewerId, role: 'editor' });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('editor');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'editor' });

      expect(response.status).toBe(400);
    });

    it('should return 400 when role is missing', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: nonMemberId });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: nonMemberId, role: 'superadmin' });

      expect(response.status).toBe(400);
    });

    it('should prevent owner from changing their own role', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ userId: ownerId, role: 'viewer' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/projects/:projectId/access/:userId', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/access/${viewerId}`);
      expect(response.status).toBe(401);
    });

    it('should return 403 for non-owner', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/access/${viewerId}`)
        .set('Authorization', `Bearer ${editorToken}`);
      expect(response.status).toBe(403);
    });

    it('should allow owner to remove access', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/access/${viewerId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(204);

      // Verify access was removed
      const getResponse = await request(app)
        .get(`/api/projects/${projectId}/access`)
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(getResponse.body.data.find((a: { userId: string }) => a.userId === viewerId)).toBeUndefined();
    });

    it('should prevent owner from removing their own access', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/access/${ownerId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent access', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/access/non-existent-user`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
