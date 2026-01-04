/**
 * Template Storage Utilities
 * File system operations for template persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { Template, TemplateCategory, TemplateVariable } from '../../src/types/index.ts';

/**
 * Base path for templates storage
 */
export const TEMPLATES_PATH = path.join(process.cwd(), 'workspace/templates');

/**
 * Valid template categories
 */
export const VALID_CATEGORIES: TemplateCategory[] = ['qa-questions', 'document-structure', 'prompts'];

/**
 * Get templates.json path
 * @returns Path to templates.json
 */
export function getTemplatesJsonPath(): string {
  return path.join(TEMPLATES_PATH, 'templates.json');
}

/**
 * Get content file path for a template
 * @param templateId - Template UUID
 * @returns Path to the content markdown file
 */
export function getTemplateContentPath(templateId: string): string {
  return path.join(TEMPLATES_PATH, `${templateId}.md`);
}

/**
 * Ensure templates directory exists
 */
async function ensureTemplatesDir(): Promise<void> {
  await fs.mkdir(TEMPLATES_PATH, { recursive: true });
}

/**
 * Read templates metadata from templates.json
 * @returns Array of template metadata (without content)
 */
async function readTemplatesJson(): Promise<Omit<Template, 'content'>[]> {
  try {
    await ensureTemplatesDir();
    const content = await fs.readFile(getTemplatesJsonPath(), 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Write templates metadata to templates.json
 * @param templates - Array of template metadata
 */
async function writeTemplatesJson(templates: Omit<Template, 'content'>[]): Promise<void> {
  await ensureTemplatesDir();
  await fs.writeFile(getTemplatesJsonPath(), JSON.stringify(templates, null, 2), 'utf-8');
}

/**
 * Read content from a template's markdown file
 * @param templateId - Template UUID
 * @returns Content string or empty string if file doesn't exist
 */
async function readTemplateContent(templateId: string): Promise<string> {
  try {
    return await fs.readFile(getTemplateContentPath(templateId), 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Write content to a template's markdown file
 * @param templateId - Template UUID
 * @param content - Markdown content to write
 */
async function writeTemplateContent(templateId: string, content: string): Promise<void> {
  await ensureTemplatesDir();
  await fs.writeFile(getTemplateContentPath(templateId), content, 'utf-8');
}

/**
 * Delete a template's markdown file
 * @param templateId - Template UUID
 */
async function deleteTemplateContent(templateId: string): Promise<void> {
  try {
    await fs.unlink(getTemplateContentPath(templateId));
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Get all templates
 * @param category - Optional category filter
 * @param projectId - Optional project ID filter
 * @returns Array of templates sorted by createdAt descending (newest first)
 */
export async function getAllTemplates(
  category?: TemplateCategory,
  projectId?: string
): Promise<Template[]> {
  const templatesMetadata = await readTemplatesJson();

  // Load content for each template
  let templates: Template[] = await Promise.all(
    templatesMetadata.map(async (metadata) => ({
      ...metadata,
      content: await readTemplateContent(metadata.id),
    }))
  );

  // Apply filters
  if (category) {
    templates = templates.filter(t => t.category === category);
  }

  if (projectId) {
    templates = templates.filter(t => t.projectId === projectId);
  }

  // Sort by createdAt descending (newest first)
  return templates.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single template by ID
 * @param templateId - Template UUID
 * @returns Template if found, null otherwise
 */
export async function getTemplateById(templateId: string): Promise<Template | null> {
  const templatesMetadata = await readTemplatesJson();
  const metadata = templatesMetadata.find(t => t.id === templateId);

  if (!metadata) {
    return null;
  }

  return {
    ...metadata,
    content: await readTemplateContent(templateId),
  };
}

/**
 * Create template DTO
 */
export interface CreateTemplateDto {
  name: string;
  category: TemplateCategory;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
  projectId?: string | null;
}

/**
 * Create a new template
 * @param templateId - Generated UUID for the new template
 * @param data - Template creation data
 * @returns Created template
 */
export async function createTemplate(
  templateId: string,
  data: CreateTemplateDto
): Promise<Template> {
  const now = new Date().toISOString();

  const template: Template = {
    id: templateId,
    name: data.name.trim(),
    category: data.category,
    description: data.description?.trim() ?? '',
    content: data.content ?? '',
    variables: data.variables ?? [],
    isDefault: false,
    projectId: data.projectId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  // Read existing templates and add new one
  const templates = await readTemplatesJson();
  const metadataToStore = {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    variables: template.variables,
    isDefault: template.isDefault,
    projectId: template.projectId,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
  templates.push(metadataToStore);

  // Write metadata and content
  await writeTemplatesJson(templates);
  await writeTemplateContent(templateId, template.content);

  return template;
}

/**
 * Update template DTO
 */
export interface UpdateTemplateDto {
  name?: string;
  category?: TemplateCategory;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
}

/**
 * Update an existing template
 * @param templateId - Template UUID
 * @param data - Template update data
 * @returns Updated template
 */
export async function updateTemplate(
  templateId: string,
  data: UpdateTemplateDto
): Promise<Template> {
  const existing = await getTemplateById(templateId);

  if (!existing) {
    throw new Error('Template not found');
  }

  const updated: Template = {
    ...existing,
    name: data.name !== undefined ? data.name.trim() : existing.name,
    category: data.category ?? existing.category,
    description: data.description !== undefined ? data.description.trim() : existing.description,
    content: data.content ?? existing.content,
    variables: data.variables ?? existing.variables,
    updatedAt: new Date().toISOString(),
  };

  // Update metadata in templates.json
  const templates = await readTemplatesJson();
  const index = templates.findIndex(t => t.id === templateId);

  if (index !== -1) {
    templates[index] = {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      variables: updated.variables,
      isDefault: updated.isDefault,
      projectId: updated.projectId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    await writeTemplatesJson(templates);
  }

  // Update content file
  await writeTemplateContent(templateId, updated.content);

  return updated;
}

/**
 * Delete a template
 * @param templateId - Template UUID
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  // Remove from templates.json
  const templates = await readTemplatesJson();
  const filteredTemplates = templates.filter(t => t.id !== templateId);
  await writeTemplatesJson(filteredTemplates);

  // Delete content file
  await deleteTemplateContent(templateId);
}

/**
 * Check if template name already exists in same category
 * @param name - Template name to check
 * @param category - Template category
 * @param excludeId - Optional ID to exclude from check (for updates)
 * @returns true if duplicate exists
 */
export async function isTemplateNameDuplicate(
  name: string,
  category: TemplateCategory,
  excludeId?: string
): Promise<boolean> {
  const templates = await readTemplatesJson();
  return templates.some(t =>
    t.name.toLowerCase() === name.toLowerCase() &&
    t.category === category &&
    t.id !== excludeId
  );
}

/**
 * Check if a template is a default template
 * @param templateId - Template UUID
 * @returns true if template is default
 */
export async function isDefaultTemplate(templateId: string): Promise<boolean> {
  const template = await getTemplateById(templateId);
  return template?.isDefault ?? false;
}

/**
 * Apply variable values to template content
 * @param content - Template content with {{variable}} placeholders
 * @param variables - Template variable definitions
 * @param values - Variable values to apply
 * @returns Applied content
 */
export function applyTemplateVariables(
  content: string,
  variables: TemplateVariable[],
  values: Record<string, string>
): string {
  let result = content;

  for (const variable of variables) {
    const value = values[variable.name] ?? variable.defaultValue ?? '';
    const pattern = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
    result = result.replace(pattern, value);
  }

  return result;
}

/**
 * Validate that all required variables have values
 * @param variables - Template variable definitions
 * @param values - Variable values to validate
 * @returns Array of missing required variable names
 */
export function getMissingRequiredVariables(
  variables: TemplateVariable[],
  values: Record<string, string>
): string[] {
  const missing: string[] = [];

  for (const variable of variables) {
    if (variable.required) {
      const value = values[variable.name];
      if (value === undefined || value === null || value === '') {
        // Check if there's a default value
        if (!variable.defaultValue) {
          missing.push(variable.name);
        }
      }
    }
  }

  return missing;
}

/**
 * Generate preview content using default values
 * @param content - Template content
 * @param variables - Template variable definitions
 * @returns Preview content with default values applied
 */
export function generatePreview(
  content: string,
  variables: TemplateVariable[]
): string {
  const defaultValues: Record<string, string> = {};

  for (const variable of variables) {
    defaultValues[variable.name] = variable.defaultValue ?? `[${variable.name}]`;
  }

  return applyTemplateVariables(content, variables, defaultValues);
}
