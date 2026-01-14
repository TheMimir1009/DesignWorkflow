/**
 * Tests for promptStorage utility
 * RED phase: Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  PromptTemplate,
  PromptVariable,
  PromptCategory,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '../../src/types/index.ts';

// Test workspace directory
const TEST_WORKSPACE_DIR = path.join(process.cwd(), 'workspace-test-prompts');
const TEST_PROMPTS_PATH = path.join(TEST_WORKSPACE_DIR, 'templates/prompts');

// Mock the workspace path before importing
const originalCwd = process.cwd();

async function cleanTestWorkspace() {
  try {
    await fs.rm(TEST_WORKSPACE_DIR, { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
}

// Mock process.cwd to return test directory
function mockCwd() {
  process.cwd = () => TEST_WORKSPACE_DIR;
}

// Restore original cwd
function restoreCwd() {
  process.cwd = () => originalCwd;
}

describe('promptStorage', () => {
  beforeEach(async () => {
    await cleanTestWorkspace();
    mockCwd();
  });

  afterEach(async () => {
    await cleanTestWorkspace();
    restoreCwd();
  });

  describe('getAllPrompts', () => {
    it('should return empty array when no prompts exist', async () => {
      const { getAllPrompts } = await import('../promptStorage.ts');
      const prompts = await getAllPrompts();
      expect(prompts).toEqual([]);
    });

    it('should return all prompts sorted by createdAt descending', async () => {
      const { createPrompt, getAllPrompts } = await import('../promptStorage.ts');

      const dto1: CreatePromptTemplateDto = {
        name: 'First Prompt',
        category: 'document-generation',
        description: 'Test prompt 1',
        content: 'Content 1',
        variables: [],
      };
      const dto2: CreatePromptTemplateDto = {
        name: 'Second Prompt',
        category: 'code-operation',
        description: 'Test prompt 2',
        content: 'Content 2',
        variables: [],
      };

      await createPrompt(uuidv4(), dto1);
      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      await createPrompt(uuidv4(), dto2);

      const prompts = await getAllPrompts();
      expect(prompts).toHaveLength(2);
      expect(prompts[0].name).toBe('Second Prompt'); // Newest first
      expect(prompts[1].name).toBe('First Prompt');
    });

    it('should filter prompts by category', async () => {
      const { createPrompt, getAllPrompts } = await import('../promptStorage.ts');

      const dto1: CreatePromptTemplateDto = {
        name: 'Doc Prompt',
        category: 'document-generation',
        description: 'Test',
        content: 'Content',
        variables: [],
      };
      const dto2: CreatePromptTemplateDto = {
        name: 'Code Prompt',
        category: 'code-operation',
        description: 'Test',
        content: 'Content',
        variables: [],
      };

      await createPrompt(uuidv4(), dto1);
      await createPrompt(uuidv4(), dto2);

      const docPrompts = await getAllPrompts('document-generation');
      expect(docPrompts).toHaveLength(1);
      expect(docPrompts[0].name).toBe('Doc Prompt');
    });
  });

  describe('getPromptById', () => {
    it('should return null for non-existent prompt', async () => {
      const { getPromptById } = await import('../promptStorage.ts');
      const prompt = await getPromptById('non-existent-id');
      expect(prompt).toBeNull();
    });

    it('should return prompt with content when found', async () => {
      const { createPrompt, getPromptById } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Test Prompt',
        category: 'analysis',
        description: 'Test description',
        content: 'Test content with {{variable}} placeholder',
        variables: [
          {
            name: 'variable',
            type: 'string',
            description: 'A variable',
            required: true,
            example: 'example value',
          },
        ],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);

      const prompt = await getPromptById(promptId);
      expect(prompt).not.toBeNull();
      expect(prompt?.id).toBe(promptId);
      expect(prompt?.content).toBe(dto.content);
      expect(prompt?.variables).toEqual(dto.variables);
    });
  });

  describe('createPrompt', () => {
    it('should create a new prompt with default values', async () => {
      const { createPrompt, getPromptById } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'New Prompt',
        category: 'utility',
        description: 'A new prompt',
        content: 'Prompt content',
        variables: [],
      };

      const promptId = uuidv4();
      const created = await createPrompt(promptId, dto);

      expect(created.id).toBe(promptId);
      expect(created.name).toBe(dto.name);
      expect(created.category).toBe(dto.category);
      expect(created.content).toBe(dto.content);
      expect(created.defaultContent).toBe(dto.content);
      expect(created.isModified).toBe(false);
      expect(created.version).toBe(1);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();

      const retrieved = await getPromptById(promptId);
      expect(retrieved).toEqual(created);
    });

    it('should trim whitespace from name and description', async () => {
      const { createPrompt } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: '  Whitespace Prompt  ',
        category: 'analysis',
        description: '  Description with spaces  ',
        content: 'Content',
        variables: [],
      };

      const created = await createPrompt(uuidv4(), dto);
      expect(created.name).toBe('Whitespace Prompt');
      expect(created.description).toBe('Description with spaces');
    });
  });

  describe('updatePrompt', () => {
    it('should update existing prompt', async () => {
      const { createPrompt, updatePrompt, getPromptById } = await import('../promptStorage.ts');

      const createDto: CreatePromptTemplateDto = {
        name: 'Original Name',
        category: 'document-generation',
        description: 'Original description',
        content: 'Original content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, createDto);

      const updateDto: UpdatePromptTemplateDto = {
        name: 'Updated Name',
        content: 'Updated content',
      };

      const updated = await updatePrompt(promptId, updateDto);

      expect(updated.name).toBe('Updated Name');
      expect(updated.content).toBe('Updated content');
      expect(updated.description).toBe('Original description'); // Unchanged
      expect(updated.isModified).toBe(true);
      expect(updated.version).toBe(2); // Version incremented

      const retrieved = await getPromptById(promptId);
      expect(retrieved).toEqual(updated);
    });

    it('should throw error when updating non-existent prompt', async () => {
      const { updatePrompt } = await import('../promptStorage.ts');

      await expect(
        updatePrompt('non-existent', { name: 'New Name' })
      ).rejects.toThrow('Prompt not found');
    });
  });

  describe('resetPrompt', () => {
    it('should reset prompt to default content', async () => {
      const { createPrompt, updatePrompt, resetPrompt, getPromptById } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Test Prompt',
        category: 'utility',
        description: 'Test',
        content: 'Original content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);

      // Modify the prompt
      await updatePrompt(promptId, { content: 'Modified content' });

      // Reset to default
      const reset = await resetPrompt(promptId);

      expect(reset.content).toBe('Original content');
      expect(reset.isModified).toBe(false);

      const retrieved = await getPromptById(promptId);
      expect(retrieved?.content).toBe('Original content');
    });

    it('should create version snapshot before reset', async () => {
      const { createPrompt, updatePrompt, resetPrompt, getPromptVersions } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Test Prompt',
        category: 'utility',
        description: 'Test',
        content: 'Original',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);
      await updatePrompt(promptId, { content: 'Modified v1' });
      await updatePrompt(promptId, { content: 'Modified v2' });

      await resetPrompt(promptId);

      const versions = await getPromptVersions(promptId);
      expect(versions.length).toBeGreaterThan(0);
      expect(versions[versions.length - 1].content).toBe('Modified v2');
    });
  });

  describe('deletePrompt', () => {
    it('should delete prompt and its versions', async () => {
      const { createPrompt, deletePrompt, getPromptById, getAllPrompts } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'To Delete',
        category: 'analysis',
        description: 'Test',
        content: 'Content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);

      await deletePrompt(promptId);

      const retrieved = await getPromptById(promptId);
      expect(retrieved).toBeNull();

      const all = await getAllPrompts();
      expect(all).toHaveLength(0);
    });
  });

  describe('getPromptVersions', () => {
    it('should return version history for a prompt', async () => {
      const { createPrompt, updatePrompt, getPromptVersions } = await import('../promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Versioned Prompt',
        category: 'utility',
        description: 'Test',
        content: 'v1',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);

      await updatePrompt(promptId, { content: 'v2' });
      await updatePrompt(promptId, { content: 'v3' });

      const versions = await getPromptVersions(promptId);

      // Should have 2 versions (v1 saved on first update, v2 saved on second update)
      expect(versions.length).toBeGreaterThanOrEqual(2);
      expect(versions[0].version).toBe(1);
      expect(versions[0].content).toBe('v1');
      if (versions.length > 1) {
        expect(versions[1].version).toBe(2);
        expect(versions[1].content).toBe('v2');
      }
    });
  });

  describe('validatePromptVariables', () => {
    it('should pass validation when all required variables have values', async () => {
      const { validatePromptVariables } = await import('../promptStorage.ts');

      const variables: PromptVariable[] = [
        {
          name: 'requiredVar',
          type: 'string',
          description: 'Required variable',
          required: true,
          example: 'value',
        },
        {
          name: 'optionalVar',
          type: 'string',
          description: 'Optional variable',
          required: false,
          example: 'value',
        },
      ];

      const values = {
        requiredVar: 'provided',
      };

      const result = validatePromptVariables(variables, values);
      expect(result.isValid).toBe(true);
      expect(result.missingVariables).toEqual([]);
    });

    it('should fail validation when required variables are missing', async () => {
      const { validatePromptVariables } = await import('../promptStorage.ts');

      const variables: PromptVariable[] = [
        {
          name: 'requiredVar1',
          type: 'string',
          description: 'Required variable 1',
          required: true,
          example: 'value1',
        },
        {
          name: 'requiredVar2',
          type: 'string',
          description: 'Required variable 2',
          required: true,
          example: 'value2',
        },
      ];

      const values = {
        requiredVar1: 'provided',
        // requiredVar2 is missing
      };

      const result = validatePromptVariables(variables, values);
      expect(result.isValid).toBe(false);
      expect(result.missingVariables).toEqual(['requiredVar2']);
    });

    it('should validate array type variables', async () => {
      const { validatePromptVariables } = await import('../promptStorage.ts');

      const variables: PromptVariable[] = [
        {
          name: 'arrayVar',
          type: 'array',
          description: 'Array variable',
          required: true,
          example: '["item1", "item2"]',
        },
      ];

      // Valid JSON array
      const validValues = { arrayVar: '["item1", "item2"]' };
      const validResult = validatePromptVariables(variables, validValues);
      expect(validResult.isValid).toBe(true);

      // Invalid JSON
      const invalidValues = { arrayVar: 'not an array' };
      const invalidResult = validatePromptVariables(variables, invalidValues);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should validate object type variables', async () => {
      const { validatePromptVariables } = await import('../promptStorage.ts');

      const variables: PromptVariable[] = [
        {
          name: 'objectVar',
          type: 'object',
          description: 'Object variable',
          required: true,
          example: '{"key": "value"}',
        },
      ];

      // Valid JSON object
      const validValues = { objectVar: '{"key": "value"}' };
      const validResult = validatePromptVariables(variables, validValues);
      expect(validResult.isValid).toBe(true);

      // Invalid JSON
      const invalidValues = { objectVar: 'not an object' };
      const invalidResult = validatePromptVariables(variables, invalidValues);
      expect(invalidResult.isValid).toBe(false);
    });
  });
});
