/**
 * documentVersions.test.ts
 * Unit tests for document versions API routes
 *
 * Test Coverage:
 * - POST /api/tasks/:taskId/versions - Create a new version
 * - GET /api/tasks/:taskId/versions - Get all versions for a task
 * - GET /api/tasks/:taskId/versions/:versionId - Get a specific version
 * - POST /api/tasks/:taskId/versions/:versionId/restore - Restore a version
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { documentVersionsRouter } from '../../../server/routes/documentVersions';
import { getVersions } from '../../../server/utils/versionStorage';
import { v4 as uuidv4 } from 'uuid';

describe('documentVersions API Routes', () => {
  let app: Express;

  const createTestIds = () => ({
    testProjectId: `test-project-${uuidv4()}`,
    testTaskId: `test-task-${uuidv4()}`
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Mount the router at /api/tasks/:taskId/versions
    // Express will handle the :taskId parameter in the router
    app.use('/api/tasks', documentVersionsRouter);
  });

  describe('POST /api/tasks/:taskId/versions', () => {
    it('should create a new version successfully', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Test content',
          author: 'test-user',
          changeDescription: 'Initial version'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.taskId).toBe(testTaskId);
      expect(response.body.data.content).toBe('Test content');
      expect(response.body.data.author).toBe('test-user');
      expect(response.body.data.versionNumber).toBe(1);
    });

    it('should return 400 if content is missing', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          author: 'test-user'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('content');
    });

    it('should return 400 if author is missing', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Test content'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('author');
    });

    it('should increment version number for subsequent versions', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Create first version
      await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Version 1',
          author: 'user1'
        });

      // Create second version
      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Version 2',
          author: 'user1'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.versionNumber).toBe(2);
    });

    it('should support parent version ID', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Create first version
      const firstResponse = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Parent version',
          author: 'user1'
        });

      const parentVersionId = firstResponse.body.data.id;

      // Create child version
      const childResponse = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Child version',
          author: 'user1',
          parentVersionId
        });

      expect(childResponse.status).toBe(201);
      expect(childResponse.body.data.parentVersionId).toBe(parentVersionId);
    });
  });

  describe('GET /api/tasks/:taskId/versions', () => {
    it('should return empty array for task with no versions', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const response = await request(app)
        .get(`/api/tasks/${testTaskId}/versions`)
        .query({ projectId: testProjectId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all versions for a task', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Create multiple versions
      await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({ projectId: testProjectId, content: 'V1', author: 'user1' });

      await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({ projectId: testProjectId, content: 'V2', author: 'user1' });

      await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({ projectId: testProjectId, content: 'V3', author: 'user1' });

      const response = await request(app)
        .get(`/api/tasks/${testTaskId}/versions`)
        .query({ projectId: testProjectId });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].versionNumber).toBe(1);
      expect(response.body.data[1].versionNumber).toBe(2);
      expect(response.body.data[2].versionNumber).toBe(3);
    });
  });

  describe('GET /api/tasks/:taskId/versions/:versionId', () => {
    it('should return 404 for non-existent version', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const response = await request(app)
        .get(`/api/tasks/${testTaskId}/versions/non-existent-id`)
        .query({ projectId: testProjectId });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return specific version by ID', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const createResponse = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Test content',
          author: 'test-user',
          changeDescription: 'Test version'
        });

      const versionId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/tasks/${testTaskId}/versions/${versionId}`)
        .query({ projectId: testProjectId });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(versionId);
      expect(response.body.data.content).toBe('Test content');
      expect(response.body.data.changeDescription).toBe('Test version');
    });
  });

  describe('POST /api/tasks/:taskId/versions/:versionId/restore', () => {
    it('should return 404 for non-existent version', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions/non-existent-id/restore`)
        .send({ projectId: testProjectId });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should restore to a specific version', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Create first version
      const v1Response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Version 1',
          author: 'user1'
        });

      const v1Id = v1Response.body.data.id;

      // Create second version
      await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Version 2',
          author: 'user1',
          parentVersionId: v1Id
        });

      // Restore to first version
      const restoreResponse = await request(app)
        .post(`/api/tasks/${testTaskId}/versions/${v1Id}/restore`)
        .send({ projectId: testProjectId });

      expect(restoreResponse.status).toBe(201);
      expect(restoreResponse.body.data.content).toBe('Version 1');
      expect(restoreResponse.body.data.changeDescription).toContain('Restored from version 1');
    });

    it('should create new version when restoring', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Create first version
      const v1Response = await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Original',
          author: 'user1'
        });

      const v1Id = v1Response.body.data.id;

      // Create second version
      await request(app)
        .post(`/api/tasks/${testTaskId}/versions`)
        .send({
          projectId: testProjectId,
          content: 'Modified',
          author: 'user1',
          parentVersionId: v1Id
        });

      // Restore to first version
      await request(app)
        .post(`/api/tasks/${testTaskId}/versions/${v1Id}/restore`)
        .send({ projectId: testProjectId });

      // Verify we now have 3 versions
      const versions = await getVersions(testProjectId, testTaskId);
      expect(versions).toHaveLength(3);
    });
  });
});
