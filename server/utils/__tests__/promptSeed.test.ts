/**
 * Tests for prompt seed functionality
 * RED phase: Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import type { PromptCategory } from '../../src/types/index.ts';

// Test workspace directory
const TEST_WORKSPACE_DIR = path.join(process.cwd(), 'workspace-test-prompts-seed');

const originalCwd = process.cwd();

async function cleanTestWorkspace() {
  try {
    await fs.rm(TEST_WORKSPACE_DIR, { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
}

function mockCwd() {
  process.cwd = () => TEST_WORKSPACE_DIR;
}

function restoreCwd() {
  process.cwd = () => originalCwd;
}

describe('promptSeed', () => {
  beforeEach(async () => {
    await cleanTestWorkspace();
    mockCwd();
  });

  afterEach(async () => {
    await cleanTestWorkspace();
    restoreCwd();
  });

  describe('seedDefaultPrompts', () => {
    it('should seed default prompts when none exist', async () => {
      const { seedDefaultPrompts } = await import('../promptSeed.ts');
      const { getAllPrompts } = await import('../promptStorage.ts');

      await seedDefaultPrompts();

      const prompts = await getAllPrompts();

      // Should have at least the core prompt templates
      expect(prompts.length).toBeGreaterThan(0);

      // Check for expected prompts
      const designDocPrompt = prompts.find(p => p.name === 'Design Document Generator');
      expect(designDocPrompt).toBeDefined();
      expect(designDocPrompt?.category).toBe('document-generation');

      const prdPrompt = prompts.find(p => p.name === 'PRD Generator');
      expect(prdPrompt).toBeDefined();
      expect(prdPrompt?.category).toBe('document-generation');

      const prototypePrompt = prompts.find(p => p.name === 'Prototype Generator');
      expect(prototypePrompt).toBeDefined();
      expect(prototypePrompt?.category).toBe('document-generation');
    });

    it('should not duplicate prompts when run multiple times', async () => {
      const { seedDefaultPrompts } = await import('../promptSeed.ts');
      const { getAllPrompts } = await import('../promptStorage.ts');

      await seedDefaultPrompts();
      const count1 = (await getAllPrompts()).length;

      await seedDefaultPrompts();
      const count2 = (await getAllPrompts()).length;

      expect(count1).toBe(count2);
    });

    it('should include variables for prompts that need them', async () => {
      const { seedDefaultPrompts } = await import('../promptSeed.ts');
      const { getAllPrompts } = await import('../promptStorage.ts');

      await seedDefaultPrompts();

      const prompts = await getAllPrompts();

      // Find a prompt that should have variables
      const promptWithVars = prompts.find(p => p.variables.length > 0);
      expect(promptWithVars).toBeDefined();

      // Check variable structure
      const variable = promptWithVars?.variables[0];
      expect(variable).toHaveProperty('name');
      expect(variable).toHaveProperty('type');
      expect(variable).toHaveProperty('description');
      expect(variable).toHaveProperty('required');
      expect(variable).toHaveProperty('example');
    });

    it('should categorize prompts correctly', async () => {
      const { seedDefaultPrompts } = await import('../promptSeed.ts');
      const { getAllPrompts } = await import('../promptStorage.ts');

      await seedDefaultPrompts();

      const prompts = await getAllPrompts();

      // Check document-generation category
      const docPrompts = prompts.filter(p => p.category === 'document-generation');
      expect(docPrompts.length).toBeGreaterThan(0);

      // Check code-operation category
      const codePrompts = prompts.filter(p => p.category === 'code-operation');
      expect(codePrompts.length).toBeGreaterThan(0);

      // Check analysis category
      const analysisPrompts = prompts.filter(p => p.category === 'analysis');
      expect(analysisPrompts.length).toBeGreaterThan(0);
    });
  });

  describe('getDefaultPromptTemplates', () => {
    it('should return array of default prompt templates', async () => {
      const { getDefaultPromptTemplates } = await import('../promptSeed.ts');

      const templates = getDefaultPromptTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      // Check template structure
      const template = templates[0];
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('content');
      expect(template).toHaveProperty('variables');
    });

    it('should include all required prompt templates', async () => {
      const { getDefaultPromptTemplates } = await import('../promptSeed.ts');

      const templates = getDefaultPromptTemplates();
      const names = templates.map(t => t.name);

      // Check for core templates
      expect(names).toContain('Design Document Generator');
      expect(names).toContain('PRD Generator');
      expect(names).toContain('Prototype Generator');
      expect(names).toContain('Code Generator');
      expect(names).toContain('Code Review');
      expect(names).toContain('Code Optimization');
      expect(names).toContain('Documentation Generator');
    });
  });

  describe('isPromptSeeded', () => {
    it('should return false when no prompts exist', async () => {
      const { isPromptSeeded } = await import('../promptSeed.ts');

      const isSeeded = await isPromptSeeded();
      expect(isSeeded).toBe(false);
    });

    it('should return true after seeding', async () => {
      const { seedDefaultPrompts, isPromptSeeded } = await import('../promptSeed.ts');

      await seedDefaultPrompts();

      const isSeeded = await isPromptSeeded();
      expect(isSeeded).toBe(true);
    });
  });
});
