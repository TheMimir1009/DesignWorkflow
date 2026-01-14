/**
 * QA System Type Definitions
 * Interfaces for Q&A session management and question templates
 */

/**
 * Input type for questions
 */
export type QuestionInputType = 'text' | 'textarea' | 'select' | 'multiselect';

/**
 * Question represents a single question in the Q&A system
 */
export interface Question {
  id: string;
  categoryId: string;
  order: number;
  text: string;
  helpText: string | null;
  isRequired: boolean;
  inputType: QuestionInputType;
  options: string[] | null;
}

/**
 * QA Category for organizing questions
 */
export interface QACategory {
  id: string;
  name: string;
  description: string;
  order: number;
  questionCount: number;
}

/**
 * QA Session represents a user's Q&A session for a task
 */
export interface QASession {
  id: string;
  taskId: string;
  projectId: string;
  answers: Record<string, string>;
  completedCategories: string[];
  isComplete: boolean;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * QA Store state interface
 */
export interface QAStoreState {
  questions: Question[];
  categories: QACategory[];
  currentSession: QASession | null;
  sessions: QASession[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
}

/**
 * QA Store actions interface
 */
export interface QAStoreActions {
  loadQuestions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  startSession: (taskId: string, projectId: string) => Promise<void>;
  updateAnswer: (questionId: string, answer: string) => void;
  completeSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  selectCategory: (categoryId: string | null) => void;
  getQuestionsByCategory: (categoryId: string) => Question[];
  calculateProgress: () => number;
  openModal: () => void;
  closeModal: () => void;
  clearError: () => void;
}

/**
 * Combined QA store type
 */
export type QAStore = QAStoreState & QAStoreActions;

/**
 * DTO for creating a new QA session
 */
export interface CreateQASessionDto {
  taskId: string;
  projectId: string;
}

/**
 * DTO for updating a QA session
 */
export interface UpdateQASessionDto {
  answers?: Record<string, string>;
  completedCategories?: string[];
}

/**
 * API Response for questions
 */
export interface QuestionsResponse {
  questions: Question[];
  categories: QACategory[];
}

/**
 * Question template file structure
 */
export interface QuestionTemplate {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  questions: Omit<Question, 'categoryId'>[];
}
