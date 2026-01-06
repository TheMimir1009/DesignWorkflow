/**
 * Template Parser Utilities
 * Functions for parsing and substituting template variables
 */
import type { TemplateVariable } from '../types';

/**
 * Regular expression to match template variables in {{variable_name}} format
 * Matches alphanumeric characters and underscores
 */
const VARIABLE_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

/**
 * Parse template content to extract all unique variable names
 * @param content - Template content with {{variable}} placeholders
 * @returns Array of unique variable names
 */
export function parseTemplateVariables(content: string): string[] {
  if (!content) {
    return [];
  }

  const variables = new Set<string>();
  let match: RegExpExecArray | null;

  // Reset regex state
  VARIABLE_PATTERN.lastIndex = 0;

  while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Extract variable names in order of appearance (preserving first occurrence order)
 * @param content - Template content with {{variable}} placeholders
 * @returns Array of variable names in order of first appearance
 */
export function extractVariableNames(content: string): string[] {
  if (!content) {
    return [];
  }

  const seen = new Set<string>();
  const ordered: string[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  VARIABLE_PATTERN.lastIndex = 0;

  while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
    const varName = match[1];
    if (!seen.has(varName)) {
      seen.add(varName);
      ordered.push(varName);
    }
  }

  return ordered;
}

/**
 * Substitute variables in template content with provided values
 * Variables without values are left as placeholders
 * @param content - Template content with {{variable}} placeholders
 * @param values - Record of variable names to values
 * @returns Content with variables substituted
 */
export function substituteVariables(
  content: string,
  values: Record<string, string>
): string {
  if (!content) {
    return content;
  }

  return content.replace(VARIABLE_PATTERN, (match, varName) => {
    if (varName in values) {
      return values[varName];
    }
    // Leave placeholder if value not provided
    return match;
  });
}

/**
 * Validation result for variable values
 */
export interface ValidationResult {
  /** Whether all validations passed */
  isValid: boolean;
  /** List of required variable names that are missing values */
  missingRequired: string[];
  /** List of select variable names with invalid selection values */
  invalidSelections: string[];
}

/**
 * Validate variable values against variable definitions
 * @param variables - Template variable definitions
 * @param values - Values to validate
 * @returns Validation result with details
 */
export function validateVariableValues(
  variables: TemplateVariable[],
  values: Record<string, string>
): ValidationResult {
  const missingRequired: string[] = [];
  const invalidSelections: string[] = [];

  for (const variable of variables) {
    const value = values[variable.name];
    const hasValue = value !== undefined && value !== null && value !== '';
    const hasDefault = variable.defaultValue !== null && variable.defaultValue !== '';

    // Check required fields
    if (variable.required && !hasValue && !hasDefault) {
      missingRequired.push(variable.name);
    }

    // Check select field values
    if (
      variable.type === 'select' &&
      variable.options &&
      hasValue &&
      !variable.options.includes(value)
    ) {
      invalidSelections.push(variable.name);
    }
  }

  return {
    isValid: missingRequired.length === 0 && invalidSelections.length === 0,
    missingRequired,
    invalidSelections,
  };
}

/**
 * Generate variable suggestions from content
 * Creates basic variable definitions from parsed variable names
 * @param content - Template content with {{variable}} placeholders
 * @returns Array of suggested variable definitions
 */
export function suggestVariables(content: string): TemplateVariable[] {
  const variableNames = extractVariableNames(content);

  return variableNames.map((name) => ({
    name,
    description: formatVariableName(name),
    defaultValue: null,
    required: true,
    type: 'text' as const,
    options: null,
  }));
}

/**
 * Format variable name for display (convert snake_case to Title Case)
 * @param name - Variable name in snake_case
 * @returns Formatted name in Title Case
 */
function formatVariableName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if content contains any template variables
 * @param content - Content to check
 * @returns true if content contains variables
 */
export function hasVariables(content: string): boolean {
  if (!content) {
    return false;
  }
  VARIABLE_PATTERN.lastIndex = 0;
  return VARIABLE_PATTERN.test(content);
}

/**
 * Escape variable syntax to prevent substitution
 * Converts {{variable}} to \{\{variable\}\}
 * @param content - Content with variables to escape
 * @returns Content with escaped variable syntax
 */
export function escapeVariables(content: string): string {
  return content.replace(VARIABLE_PATTERN, '\\{\\{$1\\}\\}');
}
