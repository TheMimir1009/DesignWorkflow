/**
 * Validation Utilities
 * Input validation functions for API requests
 */
import type { ValidationResult } from '../types.ts';

/**
 * Name validation constraints
 */
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 100;

/**
 * Description validation constraints
 */
const DESCRIPTION_MAX_LENGTH = 500;

/**
 * Validate project name
 * @param name - Name value to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateName(name: unknown): ValidationResult {
  if (name === undefined || name === null) {
    return { valid: false, error: 'name is required' };
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'name must be a string' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < NAME_MIN_LENGTH) {
    return { valid: false, error: 'name cannot be empty' };
  }

  if (name.length > NAME_MAX_LENGTH) {
    return { valid: false, error: `name must be ${NAME_MAX_LENGTH} characters or less` };
  }

  return { valid: true };
}

/**
 * Validate project description
 * @param description - Description value to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateDescription(description: unknown): ValidationResult {
  // Description is optional
  if (description === undefined || description === null) {
    return { valid: true };
  }

  if (typeof description !== 'string') {
    return { valid: false, error: 'description must be a string' };
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { valid: false, error: `description must be ${DESCRIPTION_MAX_LENGTH} characters or less` };
  }

  return { valid: true };
}

/**
 * Category validation constraints
 */
const CATEGORY_MIN_LENGTH = 1;
const CATEGORY_MAX_LENGTH = 50;

/**
 * Validate system document category
 * @param category - Category value to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateCategory(category: unknown): ValidationResult {
  if (category === undefined || category === null) {
    return { valid: false, error: 'category is required' };
  }

  if (typeof category !== 'string') {
    return { valid: false, error: 'category must be a string' };
  }

  const trimmedCategory = category.trim();

  if (trimmedCategory.length < CATEGORY_MIN_LENGTH) {
    return { valid: false, error: 'category cannot be empty' };
  }

  if (category.length > CATEGORY_MAX_LENGTH) {
    return { valid: false, error: `category must be ${CATEGORY_MAX_LENGTH} characters or less` };
  }

  return { valid: true };
}
