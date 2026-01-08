/**
 * Test Suite: promptBuilder
 * TDD implementation for dynamic prompt construction
 *
 * Requirements covered:
 * - REQ-S-002: Dynamic prompt composition
 * - Reference system context injection
 * - Template-based prompt generation
 */
import { describe, it, expect } from 'vitest';
import {
  buildPrompt,
  buildGeneratePrompt,
  buildReviewPrompt,
  buildOptimizePrompt,
  buildDocumentPrompt,
  buildAnalyzePrompt,
  type PromptContext,
  type GeneratePromptOptions,
} from '../promptBuilder.ts';

describe('promptBuilder', () => {
  describe('buildPrompt', () => {
    it('should build a basic prompt with task description', () => {
      const context: PromptContext = {
        task: 'Create a button component',
      };

      const result = buildPrompt(context);

      expect(result).toContain('Create a button component');
    });

    it('should include system context when provided', () => {
      const context: PromptContext = {
        task: 'Create a component',
        systemContext: 'This project uses React 19 with TypeScript',
      };

      const result = buildPrompt(context);

      expect(result).toContain('This project uses React 19 with TypeScript');
      expect(result).toContain('Create a component');
    });

    it('should include reference documents when provided', () => {
      const context: PromptContext = {
        task: 'Implement feature',
        references: [
          { type: 'system', name: 'Auth System', content: 'JWT-based authentication' },
          { type: 'design', name: 'UI Spec', content: 'Material Design guidelines' },
        ],
      };

      const result = buildPrompt(context);

      expect(result).toContain('Auth System');
      expect(result).toContain('JWT-based authentication');
      expect(result).toContain('UI Spec');
      expect(result).toContain('Material Design guidelines');
    });

    it('should include constraints when provided', () => {
      const context: PromptContext = {
        task: 'Create component',
        constraints: ['No external dependencies', 'Must be accessible'],
      };

      const result = buildPrompt(context);

      expect(result).toContain('No external dependencies');
      expect(result).toContain('Must be accessible');
    });

    it('should include output format instructions when provided', () => {
      const context: PromptContext = {
        task: 'Generate code',
        outputFormat: 'typescript',
      };

      const result = buildPrompt(context);

      expect(result).toContain('typescript');
    });

    it('should combine all context elements properly', () => {
      const context: PromptContext = {
        task: 'Build auth module',
        systemContext: 'Express.js backend',
        references: [{ type: 'system', name: 'Security', content: 'OWASP guidelines' }],
        constraints: ['Use bcrypt for passwords'],
        outputFormat: 'typescript',
      };

      const result = buildPrompt(context);

      expect(result).toContain('Build auth module');
      expect(result).toContain('Express.js backend');
      expect(result).toContain('Security');
      expect(result).toContain('OWASP guidelines');
      expect(result).toContain('Use bcrypt for passwords');
      expect(result).toContain('typescript');
    });
  });

  describe('buildGeneratePrompt', () => {
    it('should build code generation prompt', () => {
      const options: GeneratePromptOptions = {
        type: 'code',
        description: 'Create a user service class',
        language: 'typescript',
      };

      const result = buildGeneratePrompt(options);

      expect(result).toContain('Create a user service class');
      expect(result).toContain('typescript');
      expect(result).toContain('code');
    });

    it('should build component generation prompt', () => {
      const options: GeneratePromptOptions = {
        type: 'component',
        description: 'Create a modal dialog',
        language: 'tsx',
        framework: 'react',
      };

      const result = buildGeneratePrompt(options);

      expect(result).toContain('Create a modal dialog');
      expect(result).toContain('react');
      expect(result).toContain('component');
    });

    it('should include additional context in generation prompt', () => {
      const options: GeneratePromptOptions = {
        type: 'code',
        description: 'Create API endpoint',
        language: 'typescript',
        additionalContext: 'Use Express.js routing patterns',
      };

      const result = buildGeneratePrompt(options);

      expect(result).toContain('Use Express.js routing patterns');
    });
  });

  describe('buildReviewPrompt', () => {
    it('should build code review prompt', () => {
      const code = 'function add(a, b) { return a + b; }';
      const options = { language: 'javascript' };

      const result = buildReviewPrompt(code, options);

      expect(result).toContain(code);
      expect(result).toContain('review');
      expect(result).toContain('javascript');
    });

    it('should include focus areas when provided', () => {
      const code = 'const data = fetch(url);';
      const options = {
        language: 'typescript',
        focusAreas: ['security', 'performance'],
      };

      const result = buildReviewPrompt(code, options);

      expect(result).toContain('security');
      expect(result).toContain('performance');
    });
  });

  describe('buildOptimizePrompt', () => {
    it('should build optimization prompt', () => {
      const code = 'for (let i = 0; i < arr.length; i++) {}';
      const options = { language: 'javascript' };

      const result = buildOptimizePrompt(code, options);

      expect(result).toContain(code);
      expect(result).toContain('optimize');
    });

    it('should include optimization targets', () => {
      const code = 'const result = data.map().filter().reduce();';
      const options = {
        language: 'javascript',
        targets: ['performance', 'readability'],
      };

      const result = buildOptimizePrompt(code, options);

      expect(result).toContain('performance');
      expect(result).toContain('readability');
    });
  });

  describe('buildDocumentPrompt', () => {
    it('should build documentation prompt', () => {
      const code = 'export class UserService {}';
      const options = { language: 'typescript' };

      const result = buildDocumentPrompt(code, options);

      expect(result).toContain(code);
      expect(result).toContain('document');
    });

    it('should include documentation style', () => {
      const code = 'function calculate() {}';
      const options = {
        language: 'typescript',
        style: 'jsdoc',
      };

      const result = buildDocumentPrompt(code, options);

      expect(result).toContain('jsdoc');
    });
  });

  describe('buildAnalyzePrompt', () => {
    it('should build analysis prompt', () => {
      const code = 'class ComplexService {}';
      const options = { language: 'typescript' };

      const result = buildAnalyzePrompt(code, options);

      expect(result).toContain(code);
      expect(result).toContain('analyze');
    });

    it('should include analysis aspects', () => {
      const code = 'const app = express();';
      const options = {
        language: 'javascript',
        aspects: ['architecture', 'dependencies', 'complexity'],
      };

      const result = buildAnalyzePrompt(code, options);

      expect(result).toContain('architecture');
      expect(result).toContain('dependencies');
      expect(result).toContain('complexity');
    });
  });
});
