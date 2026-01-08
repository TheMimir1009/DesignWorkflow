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
} from '../promptBuilder.ts';

describe('promptBuilder - Document Generation', () => {
  describe('buildDesignDocumentPrompt', () => {
    it('should build prompt with Q&A responses', () => {
      const qaResponses: QAResponse[] = [
        { question: 'What is the project name?', answer: 'TaskFlow' },
        { question: 'What is the main purpose?', answer: 'Task management application' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses);

      expect(result).toContain('TaskFlow');
      expect(result).toContain('Task management application');
      expect(result).toContain('design document');
    });

    it('should include reference system context when provided', () => {
      const qaResponses: QAResponse[] = [
        { question: 'What features are needed?', answer: 'User authentication' },
      ];
      const referenceSystemIds: ReferenceSystem[] = [
        { id: 'sys-001', name: 'Auth System', description: 'JWT-based authentication' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses, referenceSystemIds);

      expect(result).toContain('Auth System');
      expect(result).toContain('JWT-based authentication');
    });

    it('should handle empty Q&A responses gracefully', () => {
      const result = buildDesignDocumentPrompt([]);

      expect(result).toContain('design document');
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

    it('should include markdown output format instruction', () => {
      const qaResponses: QAResponse[] = [
        { question: 'Test', answer: 'Test answer' },
      ];

      const result = buildDesignDocumentPrompt(qaResponses);

      expect(result.toLowerCase()).toContain('markdown');
    });
  });

  describe('buildPRDPrompt', () => {
    it('should build prompt with design document content', () => {
      const designDocContent = `# Project Overview
This is a task management application.

## Features
- User authentication
- Task CRUD operations`;

      const result = buildPRDPrompt(designDocContent);

      expect(result).toContain('task management');
      expect(result).toContain('PRD');
    });

    it('should include instructions for PRD sections', () => {
      const result = buildPRDPrompt('Simple design document');

      // PRD should have standard sections
      expect(result.toLowerCase()).toContain('requirement');
    });

    it('should handle empty design document', () => {
      const result = buildPRDPrompt('');

      expect(result).toBeDefined();
      expect(result).toContain('PRD');
    });

    it('should preserve design document structure in context', () => {
      const designDocContent = `# Title
## Section 1
Content here`;

      const result = buildPRDPrompt(designDocContent);

      expect(result).toContain('Title');
      expect(result).toContain('Section 1');
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
