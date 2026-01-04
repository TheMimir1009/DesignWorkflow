/**
 * Template Parser Tests
 * TDD test suite for template variable parsing and substitution
 */
import { describe, it, expect } from 'vitest';
import {
  parseTemplateVariables,
  substituteVariables,
  validateVariableValues,
  extractVariableNames,
} from '../../src/utils/templateParser.ts';
import type { TemplateVariable } from '../../src/types/index.ts';

describe('Template Parser', () => {
  describe('parseTemplateVariables', () => {
    it('should parse single variable', () => {
      const content = 'Hello, {{name}}!';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(1);
      expect(variables[0]).toBe('name');
    });

    it('should parse multiple variables', () => {
      const content = '{{greeting}}, {{name}}! Welcome to {{place}}.';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(3);
      expect(variables).toContain('greeting');
      expect(variables).toContain('name');
      expect(variables).toContain('place');
    });

    it('should return unique variables', () => {
      const content = '{{name}} said hello to {{name}}';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(1);
      expect(variables[0]).toBe('name');
    });

    it('should handle underscores in variable names', () => {
      const content = '{{first_name}} {{last_name}}';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(2);
      expect(variables).toContain('first_name');
      expect(variables).toContain('last_name');
    });

    it('should handle numbers in variable names', () => {
      const content = '{{option1}} or {{option2}}';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(2);
      expect(variables).toContain('option1');
      expect(variables).toContain('option2');
    });

    it('should return empty array for content with no variables', () => {
      const content = 'Plain text without variables';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(0);
    });

    it('should handle empty content', () => {
      const variables = parseTemplateVariables('');
      expect(variables).toHaveLength(0);
    });

    it('should ignore malformed variable syntax', () => {
      const content = '{{valid}} {invalid} {{ spaced }} {{}}';
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(1);
      expect(variables[0]).toBe('valid');
    });

    it('should handle multiline content', () => {
      const content = `# {{title}}

## Introduction

{{introduction}}

## Body

{{body}}
`;
      const variables = parseTemplateVariables(content);

      expect(variables).toHaveLength(3);
      expect(variables).toContain('title');
      expect(variables).toContain('introduction');
      expect(variables).toContain('body');
    });
  });

  describe('substituteVariables', () => {
    it('should substitute single variable', () => {
      const content = 'Hello, {{name}}!';
      const values = { name: 'World' };
      const result = substituteVariables(content, values);

      expect(result).toBe('Hello, World!');
    });

    it('should substitute multiple variables', () => {
      const content = '{{greeting}}, {{name}}!';
      const values = { greeting: 'Hello', name: 'World' };
      const result = substituteVariables(content, values);

      expect(result).toBe('Hello, World!');
    });

    it('should substitute same variable multiple times', () => {
      const content = '{{name}} met {{name}} twin.';
      const values = { name: 'John' };
      const result = substituteVariables(content, values);

      expect(result).toBe('John met John twin.');
    });

    it('should leave undefined variables as placeholders', () => {
      const content = 'Hello, {{name}}!';
      const values = {};
      const result = substituteVariables(content, values);

      expect(result).toBe('Hello, {{name}}!');
    });

    it('should handle empty string values', () => {
      const content = 'Hello, {{name}}!';
      const values = { name: '' };
      const result = substituteVariables(content, values);

      expect(result).toBe('Hello, !');
    });

    it('should handle multiline values', () => {
      const content = '# {{title}}\n\n{{content}}';
      const values = {
        title: 'My Document',
        content: 'Line 1\nLine 2\nLine 3',
      };
      const result = substituteVariables(content, values);

      expect(result).toBe('# My Document\n\nLine 1\nLine 2\nLine 3');
    });

    it('should handle special characters in values', () => {
      const content = 'Code: {{code}}';
      const values = { code: 'const x = 1 + 2;' };
      const result = substituteVariables(content, values);

      expect(result).toBe('Code: const x = 1 + 2;');
    });

    it('should handle markdown in values', () => {
      const content = '{{markdown}}';
      const values = { markdown: '**bold** and *italic*' };
      const result = substituteVariables(content, values);

      expect(result).toBe('**bold** and *italic*');
    });
  });

  describe('validateVariableValues', () => {
    const variables: TemplateVariable[] = [
      {
        name: 'required_text',
        description: 'Required text field',
        defaultValue: null,
        required: true,
        type: 'text',
        options: null,
      },
      {
        name: 'optional_text',
        description: 'Optional text field',
        defaultValue: 'default value',
        required: false,
        type: 'text',
        options: null,
      },
      {
        name: 'required_select',
        description: 'Required select field',
        defaultValue: null,
        required: true,
        type: 'select',
        options: ['option1', 'option2', 'option3'],
      },
    ];

    it('should return valid when all required values provided', () => {
      const values = {
        required_text: 'value',
        required_select: 'option1',
      };
      const result = validateVariableValues(variables, values);

      expect(result.isValid).toBe(true);
      expect(result.missingRequired).toHaveLength(0);
      expect(result.invalidSelections).toHaveLength(0);
    });

    it('should return invalid when required value missing', () => {
      const values = {
        required_select: 'option1',
      };
      const result = validateVariableValues(variables, values);

      expect(result.isValid).toBe(false);
      expect(result.missingRequired).toContain('required_text');
    });

    it('should return invalid when required value is empty string', () => {
      const values = {
        required_text: '',
        required_select: 'option1',
      };
      const result = validateVariableValues(variables, values);

      expect(result.isValid).toBe(false);
      expect(result.missingRequired).toContain('required_text');
    });

    it('should return invalid when select value not in options', () => {
      const values = {
        required_text: 'value',
        required_select: 'invalid_option',
      };
      const result = validateVariableValues(variables, values);

      expect(result.isValid).toBe(false);
      expect(result.invalidSelections).toContain('required_select');
    });

    it('should allow optional values to be missing', () => {
      const values = {
        required_text: 'value',
        required_select: 'option1',
      };
      const result = validateVariableValues(variables, values);

      expect(result.isValid).toBe(true);
    });

    it('should use default value for required check if available', () => {
      const varsWithDefault: TemplateVariable[] = [
        {
          name: 'with_default',
          description: 'Has default',
          defaultValue: 'my default',
          required: true,
          type: 'text',
          options: null,
        },
      ];
      const values = {};
      const result = validateVariableValues(varsWithDefault, values);

      expect(result.isValid).toBe(true);
    });
  });

  describe('extractVariableNames', () => {
    it('should extract variable names in order of appearance', () => {
      const content = 'First {{b}}, then {{a}}, finally {{c}}.';
      const names = extractVariableNames(content);

      expect(names).toEqual(['b', 'a', 'c']);
    });

    it('should preserve order with duplicates removed', () => {
      const content = '{{a}} {{b}} {{a}} {{c}}';
      const names = extractVariableNames(content);

      expect(names).toEqual(['a', 'b', 'c']);
    });
  });
});
