/**
 * Test Suite: promptBuilder Document Generation Functions
 * TDD implementation for document generation prompts
 *
 * Requirements covered:
 * - REQ-D-001: Design Document Generation from Q&A
 * - REQ-D-002: PRD Generation from Design Document
 * - REQ-D-003: Prototype HTML Generation from PRD
 * - REQ-D-004: Feature Analysis from Feature List
 */
import { describe, it, expect } from 'vitest';
import {
  buildDesignDocumentPrompt,
  buildPRDPrompt,
  buildPrototypePrompt,
  buildFeatureAnalysisPrompt,
  buildDocumentModifyPrompt,
  type QAResponse,
  type ReferenceSystem,
  type ProjectContext,
} from '../promptBuilder.ts';

describe('promptBuilder - Document Generation', () => {
  describe('buildDesignDocumentPrompt', () => {
    it('should build prompt with Q&A responses for Game Design Document', () => {
      const qaResponses: QAResponse[] = [
        { question: 'What is the game name?', answer: 'BattleQuest' },
        { question: 'What is the core mechanic?', answer: 'Turn-based combat system' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses);

      expect(result).toContain('BattleQuest');
      expect(result).toContain('Turn-based combat system');
      expect(result).toContain('Game Design Document');
    });

    it('should include reference system context when provided', () => {
      const qaResponses: QAResponse[] = [
        { question: 'What features are needed?', answer: 'Character progression' },
      ];
      const referenceSystemIds: ReferenceSystem[] = [
        { id: 'sys-001', name: 'RPG System', description: 'Level-based progression' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses, referenceSystemIds);

      expect(result).toContain('RPG System');
      expect(result).toContain('Level-based progression');
    });

    it('should handle empty Q&A responses gracefully', () => {
      const result = buildDesignDocumentPrompt([]);

      expect(result).toContain('Game Design Document');
      expect(result).toBeDefined();
    });

    it('should format Q&A as structured content', () => {
      const qaResponses: QAResponse[] = [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses);

      expect(result).toContain('Q1');
      expect(result).toContain('A1');
      expect(result).toContain('Q2');
      expect(result).toContain('A2');
    });

    it('should include GDD-specific sections', () => {
      const qaResponses: QAResponse[] = [
        { question: 'Test', answer: 'Test answer' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses);

      // Should include game-specific sections
      expect(result).toContain('Game Overview');
      expect(result).toContain('Core Gameplay Mechanics');
      expect(result).toContain('Game Systems');
      expect(result).toContain('Balance');
    });

    it('should include markdown output format instruction', () => {
      const qaResponses: QAResponse[] = [
        { question: 'Test', answer: 'Test answer' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses);

      expect(result.toLowerCase()).toContain('markdown');
    });
  });

  describe('buildPRDPrompt', () => {
    it('should build prompt with GDD content as development specification', () => {
      const gddContent = `# Game Overview
Turn-based RPG with combat system.

## Core Mechanics
- Turn-based combat
- Character progression`;

      const result = buildPRDPrompt(gddContent);

      expect(result).toContain('Turn-based RPG');
      expect(result).toContain('PRD');
      expect(result).toContain('Development Specification');
    });

    it('should include technical PRD sections', () => {
      const result = buildPRDPrompt('Simple GDD content');

      // PRD should have development-focused sections
      expect(result).toContain('Technical Stack');
      expect(result).toContain('System Architecture');
      expect(result).toContain('API Design');
      expect(result).toContain('Database Schema');
    });

    it('should handle empty GDD content', () => {
      const result = buildPRDPrompt('');

      expect(result).toBeDefined();
      expect(result).toContain('PRD');
    });

    it('should preserve GDD structure in context', () => {
      const gddContent = `# Game Title
## Core Mechanics
Combat system here`;

      const result = buildPRDPrompt(gddContent);

      expect(result).toContain('Game Title');
      expect(result).toContain('Core Mechanics');
    });

    it('should include ProjectContext when provided', () => {
      const gddContent = '# Simple Game';
      const projectContext: ProjectContext = {
        techStack: ['React', 'Node.js', 'PostgreSQL'],
        architecture: 'Microservices with API Gateway',
        constraints: ['Must support 10K concurrent users'],
        integrations: ['Payment gateway', 'Analytics service'],
      };

      const result = buildPRDPrompt(gddContent, projectContext);

      expect(result).toContain('React');
      expect(result).toContain('Node.js');
      expect(result).toContain('PostgreSQL');
      expect(result).toContain('Microservices');
      expect(result).toContain('10K concurrent users');
      expect(result).toContain('Payment gateway');
    });

    it('should work without ProjectContext for backward compatibility', () => {
      const gddContent = '# Game Design Document';

      const result = buildPRDPrompt(gddContent);

      expect(result).toBeDefined();
      expect(result).toContain('Game Design Document');
      expect(result).toContain('PRD');
    });

    it('should focus on implementation details, not game design concepts', () => {
      const gddContent = '# Game with complex mechanics';

      const result = buildPRDPrompt(gddContent);

      expect(result).toContain('implementation');
      expect(result).toContain('technical');
      expect(result.toLowerCase()).toContain('engineer');
    });
  });

  describe('buildPrototypePrompt', () => {
    it('should build prompt with PRD content', () => {
      const prdContent = `# Product Requirements Document
## User Stories
- As a user, I want to create tasks`;

      const result = buildPrototypePrompt(prdContent);

      expect(result).toContain('create tasks');
      expect(result.toLowerCase()).toContain('prototype');
    });

    it('should specify HTML output format', () => {
      const result = buildPrototypePrompt('Simple PRD');

      expect(result.toLowerCase()).toContain('html');
    });

    it('should include styling instructions', () => {
      const result = buildPrototypePrompt('PRD content');

      // Should include CSS or styling guidance
      expect(result.toLowerCase()).toMatch(/style|css|tailwind/);
    });

    it('should request interactive prototype', () => {
      const result = buildPrototypePrompt('PRD with forms');

      // Should mention interactivity
      expect(result.toLowerCase()).toMatch(/interactive|clickable|functional/);
    });

    it('should handle complex PRD content', () => {
      const complexPRD = `# PRD
## Features
1. Authentication
2. Dashboard
3. Reporting

## Technical Requirements
- React frontend
- Node.js backend`;

      const result = buildPrototypePrompt(complexPRD);

      expect(result).toContain('Authentication');
      expect(result).toContain('Dashboard');
    });
  });

  describe('buildFeatureAnalysisPrompt', () => {
    it('should build prompt with feature list', () => {
      const featureList = ['User authentication', 'Task management', 'Notifications'];

      const result = buildFeatureAnalysisPrompt(featureList);

      expect(result).toContain('User authentication');
      expect(result).toContain('Task management');
      expect(result).toContain('Notifications');
    });

    it('should request keyword extraction', () => {
      const featureList = ['Search functionality'];

      const result = buildFeatureAnalysisPrompt(featureList);

      expect(result.toLowerCase()).toContain('keyword');
    });

    it('should handle empty feature list', () => {
      const result = buildFeatureAnalysisPrompt([]);

      expect(result).toBeDefined();
    });

    it('should request structured output', () => {
      const featureList = ['Feature 1', 'Feature 2'];

      const result = buildFeatureAnalysisPrompt(featureList);

      // Should request JSON or structured output
      expect(result.toLowerCase()).toMatch(/json|structured|format/);
    });

    it('should include categorization instructions', () => {
      const featureList = ['Login', 'Dashboard', 'API integration'];

      const result = buildFeatureAnalysisPrompt(featureList);

      expect(result.toLowerCase()).toMatch(/categor|group|classify/);
    });
  });

  describe('buildDocumentModifyPrompt', () => {
    it('should build prompt with original content and modification instructions', () => {
      const originalContent = '# Original Document\nSome content here';
      const modificationInstructions = 'Add a new section about security';

      const result = buildDocumentModifyPrompt(originalContent, modificationInstructions);

      expect(result).toContain('Original Document');
      expect(result).toContain('security');
    });

    it('should preserve document format', () => {
      const originalContent = `## Section 1
Content

## Section 2
More content`;
      const modificationInstructions = 'Update Section 1';

      const result = buildDocumentModifyPrompt(originalContent, modificationInstructions);

      expect(result).toContain('Section 1');
      expect(result).toContain('Section 2');
    });

    it('should handle empty modification instructions', () => {
      const result = buildDocumentModifyPrompt('Content', '');

      expect(result).toBeDefined();
    });

    it('should include instruction to return modified document', () => {
      const result = buildDocumentModifyPrompt('Doc', 'Change');

      expect(result.toLowerCase()).toMatch(/modify|update|change|revise/);
    });
  });
});
