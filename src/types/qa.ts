/**
<<<<<<< HEAD
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
=======
 * Q&A System Type Definitions
 * Types for the Form-based Q&A system that collects design intent
 */

/**
 * Category types for Q&A templates
 * Maps to JSON template files in workspace/templates/questions/
 */
export type QACategory = 'game_mechanic' | 'economy' | 'growth';

/**
 * Input types for questions
 */
export type QAInputType = 'text' | 'textarea' | 'select' | 'multiselect';

/**
 * Individual question in a template
 */
export interface Question {
  /** Unique identifier for the question */
  id: string;
  /** Display order within the template */
  order: number;
  /** Question text displayed to user */
  text: string;
  /** Helper description for the question */
  description: string | null;
  /** Type of input field */
  inputType: QAInputType;
  /** Whether the question must be answered */
  required: boolean;
  /** Placeholder text for input fields */
  placeholder: string | null;
  /** Maximum character length for text inputs */
  maxLength: number | null;
  /** Options for select/multiselect types */
>>>>>>> main
  options: string[] | null;
}

/**
<<<<<<< HEAD
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
=======
 * Question template for a category
 */
export interface QuestionTemplate {
  /** Template identifier (same as category) */
  id: string;
  /** Category this template belongs to */
  category: QACategory;
  /** Human-readable category name */
  categoryName: string;
  /** Description of the category */
  categoryDescription: string;
  /** Template version */
  version: string;
  /** List of questions in this template */
  questions: Question[];
}

/**
 * Status of a Q&A session
 */
export type QASessionStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Answer to a single question in a session
 */
export interface QASessionAnswer {
  /** ID of the question being answered */
  questionId: string;
  /** The answer provided by the user */
  answer: string;
  /** ISO timestamp when the answer was provided */
  answeredAt: string;
}

/**
 * Q&A Session representing a user's progress through questions
 */
export interface QASession {
  /** Unique session identifier */
  id: string;
  /** Associated task ID */
  taskId: string;
  /** Category of questions being answered */
  category: QACategory;
  /** Current status of the session */
  status: QASessionStatus;
  /** Current step/question index (0-based) */
  currentStep: number;
  /** Answers collected so far */
  answers: QASessionAnswer[];
  /** ISO timestamp when session started */
  startedAt: string;
  /** ISO timestamp when session completed (null if not completed) */
  completedAt: string | null;
}

/**
 * Result returned when Q&A session completes
 */
export interface QACompletionResult {
  /** Session ID */
  sessionId: string;
  /** Associated task ID */
  taskId: string;
  /** Category that was completed */
  category: QACategory;
  /** All answers from the session */
  answers: QASessionAnswer[];
  /** ISO timestamp of completion */
  completedAt: string;
  /** Summary text for the session */
  summary: string;
}

/**
 * Request body for starting a new Q&A session
 */
export interface StartQASessionRequest {
  taskId: string;
  category: QACategory;
}

/**
 * Request body for saving Q&A answers
 */
export interface SaveQAAnswersRequest {
  sessionId: string;
  answers: QASessionAnswer[];
  currentStep: number;
}

/**
 * Request body for completing Q&A and triggering design generation
 */
export interface CompleteQARequest {
  sessionId: string;
}

/**
 * API response for Q&A operations
 */
export interface QAApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
>>>>>>> main
}
