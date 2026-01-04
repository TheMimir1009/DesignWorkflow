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

// Template system types
// Template category for categorizing templates
export type TemplateCategory = 'qa-questions' | 'document-structure' | 'prompts';

// Variable type for template variables
export type TemplateVariableType = 'text' | 'textarea' | 'select' | 'number';

// Template variable definition
export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue: string | null;
  required: boolean;
  type: TemplateVariableType;
  options: string[] | null;
}

// Template represents a reusable document template
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Template state for Zustand store
export interface TemplateState {
  templates: Template[];
  selectedTemplateId: string | null;
  selectedCategory: TemplateCategory | null;
  isLoading: boolean;
  error: string | null;
}

// Template DTOs for API operations
export interface CreateTemplateDto {
  name: string;
  category: TemplateCategory;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
}

export interface UpdateTemplateDto {
  name?: string;
  category?: TemplateCategory;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
}

// Template apply request
export interface ApplyTemplateRequest {
  variableValues: Record<string, string>;
}

// Template apply response
export interface ApplyTemplateResponse {
  content: string;
  appliedAt: string;
}
