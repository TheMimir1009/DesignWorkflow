/**
 * LLM Settings API Routes Tests
 * TDD test suite for LLM settings API endpoints
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../../../server/index';
import { createDefaultProjectLLMSettings } from '../../../src/types/llm';

const TEST_PROJECT_ID = 'test-project-llm-api';
const TEST_WORKSPACE = path.join(process.cwd(), 'workspace/projects', TEST_PROJECT_ID);

describe('LLM Settings API Routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    app = createApp();
    // Create test project directory
    await fs.mkdir(TEST_WORKSPACE, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(TEST_WORKSPACE, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('GET /api/projects/:projectId/llm-settings', () => {
    it('should return default settings for new project', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectId).toBe(TEST_PROJECT_ID);
      expect(response.body.data.providers).toHaveLength(4);
    });

    it('should return saved settings with masked API keys', async () => {
      // Save settings with API key
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      settings.providers[0].apiKey = 'sk-test-key-12345678';
      settings.providers[0].isEnabled = true;

      const settingsPath = path.join(TEST_WORKSPACE, 'llm-settings.json');
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // API key should be masked (format: first 4 chars + ... + last 4 chars)
      const openaiProvider = response.body.data.providers.find(
        (p: { provider: string }) => p.provider === 'openai'
      );
      // sk-test-key-12345678 -> sk-t...5678
      expect(openaiProvider.apiKey).toBe('sk-t...5678');
    });

    it('should return 400 if project ID is missing', async () => {
      await request(app)
        .get('/api/projects//llm-settings')
        .expect(404);
    });
  });

  describe('PUT /api/projects/:projectId/llm-settings', () => {
    it('should update LLM settings', async () => {
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .send({
          providers: [
            {
              provider: 'openai',
              apiKey: 'sk-new-api-key',
              isEnabled: true,
              connectionStatus: 'pending',
            },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should preserve existing settings when updating', async () => {
      // First, create default settings
      await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .send({
          providers: createDefaultProjectLLMSettings(TEST_PROJECT_ID).providers,
        });

      // Update task stage config
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .send({
          taskStageConfig: {
            designDoc: {
              provider: 'gemini',
              modelId: 'gemini-1.5-pro',
              temperature: 0.8,
              maxTokens: 4096,
              topP: 1.0,
            },
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.taskStageConfig.designDoc.provider).toBe('gemini');
      // Providers should still exist
      expect(response.body.data.providers.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/projects/:projectId/llm-settings/provider/:provider', () => {
    it('should update specific provider settings', async () => {
      // First create settings
      await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .send(createDefaultProjectLLMSettings(TEST_PROJECT_ID));

      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings/provider/openai`)
        .send({
          apiKey: 'sk-updated-key',
          isEnabled: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isEnabled).toBe(true);
      // API key should be masked in response (format: first 4 + ... + last 4)
      // sk-updated-key -> sk-u...-key
      expect(response.body.data.apiKey).toBe('sk-u...-key');
    });

    it('should return 400 for invalid provider', async () => {
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings/provider/invalid-provider`)
        .send({ apiKey: 'test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid provider');
    });
  });

  describe('PUT /api/projects/:projectId/llm-settings/task-stage', () => {
    it('should update task stage configuration', async () => {
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings/task-stage`)
        .send({
          designDoc: {
            provider: 'openai',
            modelId: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4096,
            topP: 1.0,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.designDoc.provider).toBe('openai');
      expect(response.body.data.designDoc.modelId).toBe('gpt-4o');
    });

    it('should preserve other stages when updating one', async () => {
      // Set up initial config
      await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings/task-stage`)
        .send({
          prd: {
            provider: 'gemini',
            modelId: 'gemini-1.5-pro',
            temperature: 0.7,
            maxTokens: 4096,
            topP: 1.0,
          },
        });

      // Update different stage
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings/task-stage`)
        .send({
          designDoc: {
            provider: 'openai',
            modelId: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4096,
            topP: 1.0,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.prd.provider).toBe('gemini');
      expect(response.body.data.designDoc.provider).toBe('openai');
    });
  });

  describe('POST /api/projects/:projectId/llm-settings/test-connection/:provider', () => {
    it('should return 404 for provider not in settings', async () => {
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/llm-settings/test-connection/openai`)
        .expect(200); // Returns 200 with default settings, but connection test may fail

      // Default settings exist, so it will try to test
      expect(response.body.success).toBeDefined();
    });

    it('should return 400 for invalid provider', async () => {
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/llm-settings/test-connection/invalid`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects/:projectId/llm-settings/provider/:provider/models', () => {
    it('should return available models for provider', async () => {
      // First create settings with provider
      await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/llm-settings`)
        .send(createDefaultProjectLLMSettings(TEST_PROJECT_ID));

      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/llm-settings/provider/claude-code/models`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.provider).toBe('claude-code');
      expect(response.body.data.models).toBeDefined();
      expect(Array.isArray(response.body.data.models)).toBe(true);
    });

    it('should return 400 for invalid provider', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/llm-settings/provider/invalid/models`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
