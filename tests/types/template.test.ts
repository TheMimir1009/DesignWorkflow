/**
 * Template Type Definitions Tests
 * TDD test suite for template-related type definitions
 * SPEC-TEMPLATE-001: Template System Types
 */
import { describe, it, expect } from 'vitest';
import type {
  Template,
  TemplateVariable,
  TemplateCategory,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '../../src/types/index.ts';

describe('Template Type Definitions', () => {
  describe('TemplateCategory', () => {
    it('should accept valid category values', () => {
      const qaCategory: TemplateCategory = 'qa-questions';
      const docCategory: TemplateCategory = 'document-structure';
      const promptCategory: TemplateCategory = 'prompts';

      expect(qaCategory).toBe('qa-questions');
      expect(docCategory).toBe('document-structure');
      expect(promptCategory).toBe('prompts');
    });
  });

  describe('TemplateVariable', () => {
    it('should define required variable properties', () => {
      const variable: TemplateVariable = {
        name: 'project_name',
        description: 'Name of the project',
        defaultValue: 'My Project',
        required: true,
        type: 'text',
        options: null,
      };

      expect(variable.name).toBe('project_name');
      expect(variable.description).toBe('Name of the project');
      expect(variable.defaultValue).toBe('My Project');
      expect(variable.required).toBe(true);
      expect(variable.type).toBe('text');
      expect(variable.options).toBeNull();
    });

    it('should support select type with options', () => {
      const variable: TemplateVariable = {
        name: 'difficulty',
        description: 'Game difficulty level',
        defaultValue: 'normal',
        required: true,
        type: 'select',
        options: ['easy', 'normal', 'hard'],
      };

      expect(variable.type).toBe('select');
      expect(variable.options).toEqual(['easy', 'normal', 'hard']);
    });

    it('should support textarea type', () => {
      const variable: TemplateVariable = {
        name: 'description',
        description: 'Detailed description',
        defaultValue: null,
        required: false,
        type: 'textarea',
        options: null,
      };

      expect(variable.type).toBe('textarea');
      expect(variable.defaultValue).toBeNull();
      expect(variable.required).toBe(false);
    });

    it('should support number type', () => {
      const variable: TemplateVariable = {
        name: 'max_players',
        description: 'Maximum number of players',
        defaultValue: '4',
        required: true,
        type: 'number',
        options: null,
      };

      expect(variable.type).toBe('number');
    });
  });

  describe('Template', () => {
    it('should define all required template properties', () => {
      const template: Template = {
        id: 'template-001',
        name: 'Game Design Document',
        category: 'document-structure',
        description: 'Standard game design document template',
        content: '# {{project_name}}\n\n## Overview\n\n{{description}}',
        variables: [
          {
            name: 'project_name',
            description: 'Name of the project',
            defaultValue: null,
            required: true,
            type: 'text',
            options: null,
          },
          {
            name: 'description',
            description: 'Project description',
            defaultValue: null,
            required: false,
            type: 'textarea',
            options: null,
          },
        ],
        isDefault: false,
        projectId: 'project-001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(template.id).toBe('template-001');
      expect(template.name).toBe('Game Design Document');
      expect(template.category).toBe('document-structure');
      expect(template.description).toBe('Standard game design document template');
      expect(template.content).toContain('{{project_name}}');
      expect(template.variables).toHaveLength(2);
      expect(template.isDefault).toBe(false);
      expect(template.projectId).toBe('project-001');
      expect(template.createdAt).toBeDefined();
      expect(template.updatedAt).toBeDefined();
    });

    it('should allow null projectId for global templates', () => {
      const globalTemplate: Template = {
        id: 'global-template-001',
        name: 'Global Template',
        category: 'prompts',
        description: 'A global template',
        content: 'Template content',
        variables: [],
        isDefault: true,
        projectId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      expect(globalTemplate.projectId).toBeNull();
      expect(globalTemplate.isDefault).toBe(true);
    });
  });

  describe('CreateTemplateDto', () => {
    it('should define required fields for template creation', () => {
      const dto: CreateTemplateDto = {
        name: 'New Template',
        category: 'qa-questions',
        description: 'A new template',
        content: 'Template content with {{variable}}',
        variables: [
          {
            name: 'variable',
            description: 'A variable',
            defaultValue: null,
            required: true,
            type: 'text',
            options: null,
          },
        ],
      };

      expect(dto.name).toBe('New Template');
      expect(dto.category).toBe('qa-questions');
      expect(dto.description).toBe('A new template');
      expect(dto.content).toContain('{{variable}}');
      expect(dto.variables).toHaveLength(1);
    });

    it('should allow optional fields', () => {
      const minimalDto: CreateTemplateDto = {
        name: 'Minimal Template',
        category: 'prompts',
      };

      expect(minimalDto.name).toBe('Minimal Template');
      expect(minimalDto.category).toBe('prompts');
      expect(minimalDto.description).toBeUndefined();
      expect(minimalDto.content).toBeUndefined();
      expect(minimalDto.variables).toBeUndefined();
    });
  });

  describe('UpdateTemplateDto', () => {
    it('should make all fields optional', () => {
      const dto: UpdateTemplateDto = {
        name: 'Updated Name',
      };

      expect(dto.name).toBe('Updated Name');
      expect(dto.category).toBeUndefined();
      expect(dto.description).toBeUndefined();
    });

    it('should allow updating multiple fields', () => {
      const dto: UpdateTemplateDto = {
        name: 'Updated Name',
        content: 'Updated content',
        variables: [],
      };

      expect(dto.name).toBe('Updated Name');
      expect(dto.content).toBe('Updated content');
      expect(dto.variables).toEqual([]);
    });
  });
});
