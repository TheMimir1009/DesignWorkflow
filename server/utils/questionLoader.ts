/**
 * Question Loader Utility
 * Loads Q&A templates from JSON files in workspace/templates/questions/
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { QACategory, QuestionTemplate, Question } from '../../src/types/qa';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to question templates directory
 */
export const TEMPLATES_DIR = path.resolve(__dirname, '../../workspace/templates/questions');

/**
 * Category definitions with display names and descriptions
 */
export interface CategoryDefinition {
  id: QACategory;
  name: string;
  description: string;
}

/**
 * Available categories
 */
const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'economy',
    name: 'Economy System',
    description: 'In-game economy, currencies, resources, and trade systems',
  },
  {
    id: 'game_mechanic',
    name: 'Game Mechanics',
    description: 'Core gameplay mechanics and systems that define the player experience',
  },
  {
    id: 'growth',
    name: 'Growth & Progression',
    description: 'Player progression, leveling, unlocks, and long-term engagement systems',
  },
];

/**
 * Map category to JSON file name
 */
const CATEGORY_FILE_MAP: Record<QACategory, string> = {
  game_mechanic: 'game_mechanic.json',
  economy: 'economy.json',
  growth: 'growth.json',
};

/**
 * Raw JSON structure from template files
 */
interface RawTemplateJson {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  questions: RawQuestionJson[];
}

interface RawQuestionJson {
  id: string;
  order: number;
  text: string;
  helpText: string | null;
  isRequired: boolean;
  inputType: string;
  options: string[] | null;
}

/**
 * Transform raw JSON to QuestionTemplate format
 */
function transformTemplate(raw: RawTemplateJson, category: QACategory): QuestionTemplate {
  return {
    id: category,
    category: category,
    categoryName: raw.categoryName,
    categoryDescription: raw.categoryDescription,
    version: '1.0.0',
    questions: raw.questions.map((q) => transformQuestion(q)),
  };
}

/**
 * Transform raw question JSON to Question format
 */
function transformQuestion(raw: RawQuestionJson): Question {
  return {
    id: raw.id,
    order: raw.order,
    text: raw.text,
    description: raw.helpText,
    inputType: raw.inputType as Question['inputType'],
    required: raw.isRequired,
    placeholder: null,
    maxLength: raw.inputType === 'textarea' ? 2000 : null,
    options: raw.options,
  };
}

/**
 * Load a question template for a specific category
 * Returns fallback questions if template file is not found
 */
export async function loadQuestionTemplate(category: QACategory): Promise<QuestionTemplate> {
  const fileName = CATEGORY_FILE_MAP[category];

  if (!fileName) {
    console.warn(`Unknown category: ${category}, using fallback questions`);
    return getFallbackQuestions(category);
  }

  const filePath = path.join(TEMPLATES_DIR, fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const rawTemplate: RawTemplateJson = JSON.parse(content);
    return transformTemplate(rawTemplate, category);
  } catch (error) {
    console.warn(`Failed to load template for ${category}, using fallback:`, error);
    return getFallbackQuestions(category);
  }
}

/**
 * Load all available question templates
 * Returns templates sorted alphabetically by category
 */
export async function loadAllTemplates(): Promise<QuestionTemplate[]> {
  const categories: QACategory[] = ['economy', 'game_mechanic', 'growth'];
  const templates = await Promise.all(
    categories.map((category) => loadQuestionTemplate(category))
  );

  // Sort by category alphabetically
  return templates.sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Get list of available categories
 */
export function getAvailableCategories(): CategoryDefinition[] {
  return [...CATEGORY_DEFINITIONS];
}

/**
 * Get fallback questions for a category
 * Used when template file is missing or invalid
 */
export function getFallbackQuestions(category: QACategory): QuestionTemplate {
  const categoryDef = CATEGORY_DEFINITIONS.find((c) => c.id === category);
  const categoryName = categoryDef?.name || 'Unknown Category';
  const categoryDescription = categoryDef?.description || 'Design questions';

  const baseQuestions: Question[] = [
    {
      id: `${category}-fallback-1`,
      order: 1,
      text: 'What is the main goal of this system?',
      description: 'Describe the primary objective and purpose',
      inputType: 'textarea',
      required: true,
      placeholder: 'Describe the main goal...',
      maxLength: 2000,
      options: null,
    },
    {
      id: `${category}-fallback-2`,
      order: 2,
      text: 'Who is the target audience?',
      description: 'Define the intended users or players',
      inputType: 'textarea',
      required: true,
      placeholder: 'Describe the target audience...',
      maxLength: 2000,
      options: null,
    },
    {
      id: `${category}-fallback-3`,
      order: 3,
      text: 'What are the key features?',
      description: 'List the most important features',
      inputType: 'textarea',
      required: true,
      placeholder: 'List key features...',
      maxLength: 2000,
      options: null,
    },
  ];

  return {
    id: category,
    category: category,
    categoryName: categoryName,
    categoryDescription: categoryDescription,
    version: '1.0.0-fallback',
    questions: baseQuestions,
  };
}
