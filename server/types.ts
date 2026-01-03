/**
 * Server-side Type Definitions
 * DTOs and helper types for API operations
 */

/**
 * CreateProjectDto - Request body for creating a new project
 * @property name - Required, 1-100 characters
 * @property description - Optional, 0-500 characters
 * @property techStack - Optional array of technology strings
 * @property categories - Optional array of category strings
 * @property defaultReferences - Optional array of reference strings
 */
export interface CreateProjectDto {
  name: string;
  description?: string;
  techStack?: string[];
  categories?: string[];
  defaultReferences?: string[];
}

/**
 * UpdateProjectDto - Request body for updating a project
 * All fields are optional, only provided fields will be updated
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  techStack?: string[];
  categories?: string[];
  defaultReferences?: string[];
}

/**
 * DeleteProjectResponse - Response body for delete operation
 */
export interface DeleteProjectResponse {
  deleted: boolean;
}

/**
 * Validation result for field validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * CreateSystemDocumentDto - Request body for creating a new system document
 * @property name - Required, 1-100 characters
 * @property category - Required, 1-50 characters
 * @property tags - Optional array of tag strings
 * @property content - Optional markdown content
 * @property dependencies - Optional array of system document IDs
 */
export interface CreateSystemDocumentDto {
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

/**
 * UpdateSystemDocumentDto - Request body for updating a system document
 * All fields are optional, only provided fields will be updated
 */
export interface UpdateSystemDocumentDto {
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

/**
 * DeleteSystemDocumentResponse - Response body for delete operation
 */
export interface DeleteSystemDocumentResponse {
  deleted: boolean;
}
