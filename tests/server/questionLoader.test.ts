/**
 * Question Loader Utility Tests
 * TDD tests for loading Q&A templates from JSON files
 */
import { describe, it, expect } from 'vitest';
import {
  loadQuestionTemplate,
  loadAllTemplates,
  getAvailableCategories,
  getFallbackQuestions,
  TEMPLATES_DIR,
} from '../../server/utils/questionLoader';
import type { QACategory, Question } from '../../src/types/qa';

describe('Question Loader Utility', () => {
  describe('loadQuestionTemplate', () => {
    it('should load game_mechanic template', async () => {
      const template = await loadQuestionTemplate('game_mechanic');

      expect(template).toBeDefined();
      expect(template.id).toBe('game_mechanic');
      expect(template.category).toBe('game_mechanic');
      expect(template.categoryName).toBe('Game Mechanics');
      expect(template.questions).toBeInstanceOf(Array);
      expect(template.questions.length).toBeGreaterThan(0);
    });

    it('should load economy template', async () => {
      const template = await loadQuestionTemplate('economy');

      expect(template).toBeDefined();
      expect(template.id).toBe('economy');
      expect(template.category).toBe('economy');
      expect(template.categoryName).toBe('Economy System');
    });

    it('should load growth template', async () => {
      const template = await loadQuestionTemplate('growth');

      expect(template).toBeDefined();
      expect(template.id).toBe('growth');
      expect(template.category).toBe('growth');
      expect(template.categoryName).toBe('Growth & Progression');
    });

    it('should return fallback questions for invalid category', async () => {
      const template = await loadQuestionTemplate('invalid_category' as QACategory);

      expect(template).toBeDefined();
      expect(template.questions).toBeInstanceOf(Array);
      expect(template.questions.length).toBeGreaterThan(0);
    });

    it('should transform JSON structure to QuestionTemplate format', async () => {
      const template = await loadQuestionTemplate('game_mechanic');

      expect(template.version).toBeDefined();
      template.questions.forEach((question: Question) => {
        expect(question.id).toBeDefined();
        expect(question.order).toBeTypeOf('number');
        expect(question.text).toBeDefined();
        expect(question.inputType).toBeDefined();
        expect(typeof question.required).toBe('boolean');
      });
    });
  });

  describe('loadAllTemplates', () => {
    it('should load all available templates', async () => {
      const templates = await loadAllTemplates();

      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBe(3);

      const categories = templates.map((t) => t.category);
      expect(categories).toContain('game_mechanic');
      expect(categories).toContain('economy');
      expect(categories).toContain('growth');
    });

    it('should return templates sorted by category name', async () => {
      const templates = await loadAllTemplates();

      // Templates should be in alphabetical order by category
      const sortedCategories = templates.map((t) => t.category);
      const expectedOrder = ['economy', 'game_mechanic', 'growth'];
      expect(sortedCategories).toEqual(expectedOrder);
    });
  });

  describe('getAvailableCategories', () => {
    it('should return all category definitions', () => {
      const categories = getAvailableCategories();

      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBe(3);

      const ids = categories.map((c) => c.id);
      expect(ids).toContain('game_mechanic');
      expect(ids).toContain('economy');
      expect(ids).toContain('growth');
    });

    it('should include display names and descriptions', () => {
      const categories = getAvailableCategories();

      categories.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
      });
    });
  });

  describe('getFallbackQuestions', () => {
    it('should return default questions', () => {
      const template = getFallbackQuestions('game_mechanic');

      expect(template).toBeDefined();
      expect(template.id).toBe('game_mechanic');
      expect(template.questions).toBeInstanceOf(Array);
      expect(template.questions.length).toBeGreaterThanOrEqual(3);
    });

    it('should include required base questions', () => {
      const template = getFallbackQuestions('economy');

      const requiredQuestions = template.questions.filter((q) => q.required);
      expect(requiredQuestions.length).toBeGreaterThan(0);
    });
  });

  describe('TEMPLATES_DIR', () => {
    it('should point to correct directory', () => {
      expect(TEMPLATES_DIR).toContain('workspace');
      expect(TEMPLATES_DIR).toContain('templates');
      expect(TEMPLATES_DIR).toContain('questions');
    });
  });
});
