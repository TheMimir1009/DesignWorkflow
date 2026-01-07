/**
 * AI Workflow Kanban Type Definitions
 * Core interfaces for the game design pipeline workflow system
 */

// Task status representing Kanban columns
export type TaskStatus = 'featurelist' | 'design' | 'prd' | 'prototype';

// Question categories for Q&A system
export type QACategory = 'game-mechanic' | 'economy' | 'growth' | 'narrative' | 'ux';

// Project represents a game project
export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  categories: string[];
  defaultReferences: string[];
  createdAt: string;
  updatedAt: string;
}

// System Document represents existing design documents
export interface SystemDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

// Task represents a Kanban card
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  featureList: string;
  designDocument: string | null;
  prd: string | null;
  prototype: string | null;
  references: string[];
  qaAnswers: QAAnswer[];
  revisions: Revision[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Feature List structure
export interface FeatureList {
  id: string;
  taskId: string;
  content: string;
  extractedKeywords: string[];
  suggestedReferences: string[];
  createdAt: string;
  updatedAt: string;
}

// Design Document structure
export interface DesignDocument {
  id: string;
  taskId: string;
  content: string;
  version: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Q&A Answer structure
export interface QAAnswer {
  questionId: string;
  category: QACategory;
  question: string;
  answer: string;
  answeredAt: string;
}

// Revision history for document changes
export interface Revision {
  id: string;
  documentType: 'featurelist' | 'design' | 'prd' | 'prototype';
  content: string;
  feedback: string | null;
  version: number;
  createdAt: string;
}

// PRD structure
export interface PRD {
  id: string;
  taskId: string;
  content: string;
  version: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Prototype structure
export interface Prototype {
  id: string;
  taskId: string;
  description: string;
  files: string[];
  status: 'in-progress' | 'completed' | 'needs-revision';
  createdAt: string;
  updatedAt: string;
}

// Archive entry for completed tasks
export interface Archive {
  id: string;
  taskId: string;
  projectId: string;
  task: Task;
  archivedAt: string;
}

// Question template for Q&A system
export interface QuestionTemplate {
  id: string;
  category: QACategory;
  questions: Question[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Individual question in template
export interface Question {
  id: string;
  order: number;
  text: string;
  helpText: string | null;
  isRequired: boolean;
  inputType: 'text' | 'textarea' | 'select' | 'multiselect';
  options: string[] | null;
}

// Store state types for Zustand
export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SystemDocumentState {
  documents: SystemDocument[];
  selectedDocumentIds: string[];
  isLoading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// AI generation request types
export interface GenerateDesignRequest {
  taskId: string;
  featureList: string;
  qaAnswers: QAAnswer[];
  referenceDocuments: SystemDocument[];
}

export interface GeneratePRDRequest {
  taskId: string;
  designDocument: string;
  referenceDocuments: SystemDocument[];
}

export interface GeneratePrototypeRequest {
  taskId: string;
  prd: string;
  techStack: string[];
}

// Drag and drop types for Kanban
export interface DragItem {
  taskId: string;
  sourceStatus: TaskStatus;
}

export interface DropResult {
  taskId: string;
  sourceStatus: TaskStatus;
  targetStatus: TaskStatus;
}

// Project DTOs for API operations
export interface CreateProjectDto {
  name: string;
  description?: string;
  techStack?: string[];
  categories?: string[];
  defaultReferences?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  techStack?: string[];
  categories?: string[];
  defaultReferences?: string[];
}

// Task DTOs for API operations
export interface CreateTaskDto {
  title: string;
  projectId: string;
  featureList?: string;
  references?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  featureList?: string;
  designDocument?: string | null;
  prd?: string | null;
  prototype?: string | null;
  references?: string[];
}

// Task Modal State for UI components
export interface TaskModalState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  selectedTask: Task | null;
}

// =============================================================================
// Template System Types (SPEC-TEMPLATE-001)
// =============================================================================

// Template categories for organizing templates
export type TemplateCategory = 'qa-questions' | 'document-structure' | 'prompts';

// Template variable input types
export type TemplateVariableType = 'text' | 'textarea' | 'select' | 'number';

// Template variable definition for dynamic content
export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue: string | null;
  required: boolean;
  type: TemplateVariableType;
  options: string[] | null; // For select type
}

// Main Template interface
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string; // JSON string for Q&A, Markdown for documents
  variables: TemplateVariable[];
  isDefault: boolean;
  projectId: string | null; // null = global template
  createdAt: string;
  updatedAt: string;
}

// Template Store State
export interface TemplateState {
  templates: Template[];
  selectedTemplateId: string | null;
  selectedCategory: TemplateCategory | null;
  isLoading: boolean;
  error: string | null;
}

// DTOs for API operations
export interface CreateTemplateDto {
  name: string;
  category: TemplateCategory;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
  projectId?: string | null;
}

export interface UpdateTemplateDto {
  name?: string;
  category?: TemplateCategory;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
}

// Template application context for applying templates
export interface TemplateApplicationContext {
  templateId: string;
  variableValues: Record<string, string>;
  targetType: 'qa-form' | 'document' | 'prompt';
}

// Request/Response types for template application API
export interface ApplyTemplateRequest {
  variableValues: Record<string, string>;
}

export interface ApplyTemplateResponse {
  content: string;
  appliedVariables: Record<string, string>;
}

// =============================================================================
// Authentication Types (SPEC-AUTH-001)
// =============================================================================

/**
 * User role in the system
 */
export type UserRole = 'admin' | 'user';

/**
 * Project access role
 */
export type ProjectRole = 'owner' | 'editor' | 'viewer';

/**
 * User without sensitive data
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Registration DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

/**
 * Login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: SafeUser;
  token: string;
}

/**
 * Project access entry
 */
export interface ProjectAccess {
  userId: string;
  projectId: string;
  role: ProjectRole;
  grantedBy: string;
  grantedAt: string;
}
