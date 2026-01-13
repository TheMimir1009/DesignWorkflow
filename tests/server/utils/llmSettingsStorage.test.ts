/**
 * LLM Settings Storage Tests
 * TDD test suite for LLM settings persistence
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  getLLMSettings,
  saveLLMSettings,
  updateProviderSettings,
  updateTaskStageConfig,
  deleteLLMSettings,
} from '../../../server/utils/llmSettingsStorage';
import { createDefaultProjectLLMSettings } from '../../../src/types/llm';

const TEST_PROJECT_ID = 'test-project-llm-settings';
const TEST_WORKSPACE = path.join(process.cwd(), 'workspace/projects', TEST_PROJECT_ID);

describe('LLM Settings Storage', () => {
  beforeEach(async () => {
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

  describe('getLLMSettings', () => {
    it('should return null for non-existent project', async () => {
      const settings = await getLLMSettings('non-existent-project');
      expect(settings).toBeNull();
    });

    it('should return saved settings', async () => {
      const defaultSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      await saveLLMSettings(TEST_PROJECT_ID, defaultSettings);

      const settings = await getLLMSettings(TEST_PROJECT_ID);

      expect(settings).not.toBeNull();
      expect(settings?.projectId).toBe(TEST_PROJECT_ID);
      expect(settings?.providers).toHaveLength(4);
    });
  });

  describe('saveLLMSettings', () => {
    it('should save settings to file', async () => {
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      await saveLLMSettings(TEST_PROJECT_ID, settings);

      const filePath = path.join(TEST_WORKSPACE, 'llm-settings.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const saved = JSON.parse(content);

      expect(saved.projectId).toBe(TEST_PROJECT_ID);
    });

    it('should update existing settings', async () => {
      const settings1 = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      await saveLLMSettings(TEST_PROJECT_ID, settings1);

      const settings2 = { ...settings1, updatedAt: new Date().toISOString() };
      settings2.providers[0].isEnabled = true;
      await saveLLMSettings(TEST_PROJECT_ID, settings2);

      const loaded = await getLLMSettings(TEST_PROJECT_ID);
      expect(loaded?.providers[0].isEnabled).toBe(true);
    });

    it('should encrypt API keys before saving', async () => {
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      settings.providers[0].apiKey = 'sk-test-plaintext-key';

      await saveLLMSettings(TEST_PROJECT_ID, settings);

      // Read raw file to check encryption
      const filePath = path.join(TEST_WORKSPACE, 'llm-settings.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const saved = JSON.parse(content);

      // Should be encrypted (starts with enc:v1:)
      expect(saved.providers[0].apiKey).not.toBe('sk-test-plaintext-key');
      expect(saved.providers[0].apiKey).toMatch(/^enc:v1:/);
    });
  });

  describe('updateProviderSettings', () => {
    it('should update specific provider settings', async () => {
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      await saveLLMSettings(TEST_PROJECT_ID, settings);

      await updateProviderSettings(TEST_PROJECT_ID, 'openai', {
        apiKey: 'sk-new-key',
        isEnabled: true,
      });

      const loaded = await getLLMSettings(TEST_PROJECT_ID);
      const openaiProvider = loaded?.providers.find(p => p.provider === 'openai');

      expect(openaiProvider?.isEnabled).toBe(true);
    });

    it('should create settings if not exists', async () => {
      await updateProviderSettings(TEST_PROJECT_ID, 'openai', {
        apiKey: 'sk-new-key',
        isEnabled: true,
      });

      const loaded = await getLLMSettings(TEST_PROJECT_ID);
      expect(loaded).not.toBeNull();
      expect(loaded?.providers.find(p => p.provider === 'openai')?.isEnabled).toBe(true);
    });
  });

  describe('updateTaskStageConfig', () => {
    it('should update task stage configuration', async () => {
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      await saveLLMSettings(TEST_PROJECT_ID, settings);

      await updateTaskStageConfig(TEST_PROJECT_ID, {
        designDoc: {
          provider: 'gemini',
          modelId: 'gemini-1.5-pro',
          temperature: 0.8,
          maxTokens: 4096,
          topP: 1.0,
        },
      });

      const loaded = await getLLMSettings(TEST_PROJECT_ID);

      expect(loaded?.taskStageConfig.designDoc).not.toBeNull();
      expect(loaded?.taskStageConfig.designDoc?.provider).toBe('gemini');
      expect(loaded?.taskStageConfig.designDoc?.temperature).toBe(0.8);
    });

    it('should preserve other stage configs when updating one', async () => {
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      settings.taskStageConfig.prd = {
        provider: 'openai',
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      };
      await saveLLMSettings(TEST_PROJECT_ID, settings);

      await updateTaskStageConfig(TEST_PROJECT_ID, {
        designDoc: {
          provider: 'gemini',
          modelId: 'gemini-1.5-pro',
          temperature: 0.8,
          maxTokens: 4096,
          topP: 1.0,
        },
      });

      const loaded = await getLLMSettings(TEST_PROJECT_ID);

      expect(loaded?.taskStageConfig.prd?.provider).toBe('openai');
      expect(loaded?.taskStageConfig.designDoc?.provider).toBe('gemini');
    });
  });

  describe('deleteLLMSettings', () => {
    it('should delete settings file', async () => {
      const settings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      await saveLLMSettings(TEST_PROJECT_ID, settings);

      await deleteLLMSettings(TEST_PROJECT_ID);

      const loaded = await getLLMSettings(TEST_PROJECT_ID);
      expect(loaded).toBeNull();
    });

    it('should not throw for non-existent settings', async () => {
      await expect(deleteLLMSettings('non-existent')).resolves.not.toThrow();
    });
  });
});
