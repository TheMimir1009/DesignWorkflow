/**
 * Default References API Tests
 * TDD test suite for default reference endpoints
 * TAG-008: Default reference system API
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/index.ts';
import type { Express } from 'express';

describe('Default References API', () => {
  let app: Express;
  let testProjectId: string | null = null;

  beforeEach(async () => {
    app = createApp();

    // Create a test project first
    const response = await request(app)
      .post('/api/projects')
      .send({
        name: `Test Refs Project ${Date.now()}-${Math.random().toString(36).substring(7)}`,
        description: 'Test project for references API',
      });

    if (response.body.data && response.body.data.id) {
      testProjectId = response.body.data.id;
    } else {
      testProjectId = null;
    }
  });

  afterEach(async () => {
    // Clean up: Delete test project
    if (testProjectId) {
      try {
        await request(app).delete(`/api/projects/${testProjectId}`);
      } catch {
        // Ignore cleanup errors
      }
      testProjectId = null;
    }
  });

  describe('GET /api/projects/:projectId/default-references', () => {
    // TASK-033: Create GET endpoint
    it('should return 200 with empty array when no default references', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/default-references`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 200 with reference IDs when defaults exist', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      // First set some default references
      const referenceIds = ['doc-1', 'doc-2', 'doc-3'];
      await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/default-references`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(referenceIds);
    });

    it('should return 404 when project does not exist', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id-12345/default-references');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/projects/:projectId/default-references', () => {
    // TASK-034: Create PUT endpoint
    it('should return 200 and save default references', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      const referenceIds = ['doc-1', 'doc-2'];

      const response = await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(referenceIds);
    });

    it('should overwrite existing default references', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      // Set initial references
      await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds: ['doc-1', 'doc-2'] });

      // Overwrite with new references
      const newReferenceIds = ['doc-3', 'doc-4', 'doc-5'];
      const response = await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds: newReferenceIds });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(newReferenceIds);

      // Verify with GET
      const getResponse = await request(app)
        .get(`/api/projects/${testProjectId}/default-references`);
      expect(getResponse.body.data).toEqual(newReferenceIds);
    });

    it('should return 400 when referenceIds is not an array', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      const response = await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('array');
    });

    it('should return 400 when referenceIds is missing', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      const response = await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when project does not exist', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent-id-67890/default-references')
        .send({ referenceIds: ['doc-1'] });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle empty array to clear default references', async () => {
      if (!testProjectId) {
        throw new Error('Test project was not created');
      }

      // First set some references
      await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds: ['doc-1', 'doc-2'] });

      // Clear with empty array
      const response = await request(app)
        .put(`/api/projects/${testProjectId}/default-references`)
        .send({ referenceIds: [] });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);

      // Verify cleared
      const getResponse = await request(app)
        .get(`/api/projects/${testProjectId}/default-references`);
      expect(getResponse.body.data).toEqual([]);
    });
  });
});
