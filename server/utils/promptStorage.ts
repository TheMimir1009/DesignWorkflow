/**
 * Prompt Storage Utilities
 * File system operations for prompt template persistence
 *
 * Storage structure:
 * workspace/templates/prompts/
 * ├── prompts.json (metadata)
 * ├── versions/
 * │   └── {prompt-id}/
 * │       ├── v1.md
 * │       └── v2.md
 */
import fs from 'fs/promises';
import path from 'path';
import type {
  PromptTemplate,
  PromptVariable,
  PromptCategory,
  PromptVersion,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '../../src/types/index.ts';

/**
 * Base path for prompts storage
 */
export const PROMPTS_PATH = path.join(process.cwd(), 'workspace/templates/prompts');

/**
 * Get prompts.json path
 */
export function getPromptsJsonPath(): string {
  return path.join(PROMPTS_PATH, 'prompts.json');
}

/**
 * Get versions directory path for a prompt
 */
export function getVersionsDir(promptId: string): string {
  return path.join(PROMPTS_PATH, 'versions', promptId);
}

/**
 * Get version file path for a specific version
 */
export function getVersionFilePath(promptId: string, version: number): string {
  return path.join(getVersionsDir(promptId), `v${version}.md`);
}

/**
 * Ensure prompts directory structure exists
 */
async function ensurePromptsDir(): Promise<void> {
  await fs.mkdir(PROMPTS_PATH, { recursive: true });
  await fs.mkdir(path.join(PROMPTS_PATH, 'versions'), { recursive: true });
}

/**
 * Read prompts metadata from prompts.json
 */
async function readPromptsJson(): Promise<Omit<PromptTemplate, 'content'>[]> {
  try {
    await ensurePromptsDir();
    const content = await fs.readFile(getPromptsJsonPath(), 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Write prompts metadata to prompts.json
 */
async function writePromptsJson(prompts: Omit<PromptTemplate, 'content'>[]): Promise<void> {
  await ensurePromptsDir();
  await fs.writeFile(getPromptsJsonPath(), JSON.stringify(prompts, null, 2), 'utf-8');
}

/**
 * Get all prompts
 * @param category - Optional category filter
 * @returns Array of prompts sorted by createdAt descending
 */
export async function getAllPrompts(category?: PromptCategory): Promise<PromptTemplate[]> {
  const promptsMetadata = await readPromptsJson();

  let prompts: PromptTemplate[] = promptsMetadata.map(metadata => ({
    ...metadata,
    content: metadata.content || '',
  }));

  if (category) {
    prompts = prompts.filter(p => p.category === category);
  }

  return prompts.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single prompt by ID
 * @param promptId - Prompt UUID
 * @returns Prompt if found, null otherwise
 */
export async function getPromptById(promptId: string): Promise<PromptTemplate | null> {
  const promptsMetadata = await readPromptsJson();
  const metadata = promptsMetadata.find(p => p.id === promptId);

  if (!metadata) {
    return null;
  }

  return {
    ...metadata,
    content: metadata.content || '',
  };
}

/**
 * Create a new prompt
 * @param promptId - Generated UUID for the new prompt
 * @param data - Prompt creation data
 * @returns Created prompt
 */
export async function createPrompt(
  promptId: string,
  data: CreatePromptTemplateDto
): Promise<PromptTemplate> {
  const now = new Date().toISOString();

  const prompt: PromptTemplate = {
    id: promptId,
    name: data.name.trim(),
    category: data.category,
    description: data.description.trim(),
    content: data.content,
    variables: data.variables,
    isModified: false,
    version: 1,
    createdAt: now,
    updatedAt: now,
    defaultContent: data.content,
  };

  const prompts = await readPromptsJson();
  const metadataToStore = {
    id: prompt.id,
    name: prompt.name,
    category: prompt.category,
    description: prompt.description,
    content: prompt.content,
    variables: prompt.variables,
    isModified: prompt.isModified,
    version: prompt.version,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
    defaultContent: prompt.defaultContent,
  };
  prompts.push(metadataToStore);

  await writePromptsJson(prompts);

  return prompt;
}

/**
 * Update an existing prompt
 * @param promptId - Prompt UUID
 * @param data - Prompt update data
 * @returns Updated prompt
 */
export async function updatePrompt(
  promptId: string,
  data: UpdatePromptTemplateDto
): Promise<PromptTemplate> {
  const existing = await getPromptById(promptId);

  if (!existing) {
    throw new Error('Prompt not found');
  }

  // Save version before updating if content is changing
  if (data.content !== undefined && data.content !== existing.content) {
    await savePromptVersion(promptId, existing.version, existing.content);
  }

  const now = new Date().toISOString();
  const updated: PromptTemplate = {
    ...existing,
    name: data.name !== undefined ? data.name.trim() : existing.name,
    category: data.category ?? existing.category,
    description: data.description !== undefined ? data.description.trim() : existing.description,
    content: data.content ?? existing.content,
    variables: data.variables ?? existing.variables,
    isModified: true,
    version: existing.version + 1,
    updatedAt: now,
  };

  const prompts = await readPromptsJson();
  const index = prompts.findIndex(p => p.id === promptId);

  if (index !== -1) {
    prompts[index] = {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      content: updated.content,
      variables: updated.variables,
      isModified: updated.isModified,
      version: updated.version,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      defaultContent: updated.defaultContent,
    };
    await writePromptsJson(prompts);
  }

  return updated;
}

/**
 * Save a version snapshot of prompt content
 */
async function savePromptVersion(promptId: string, version: number, content: string): Promise<void> {
  const versionsDir = getVersionsDir(promptId);
  await fs.mkdir(versionsDir, { recursive: true });
  await fs.writeFile(getVersionFilePath(promptId, version), content, 'utf-8');
}

/**
 * Reset prompt to default content
 * @param promptId - Prompt UUID
 * @returns Reset prompt
 */
export async function resetPrompt(promptId: string): Promise<PromptTemplate> {
  const existing = await getPromptById(promptId);

  if (!existing) {
    throw new Error('Prompt not found');
  }

  // Save current version before resetting
  if (existing.content !== existing.defaultContent) {
    await savePromptVersion(promptId, existing.version, existing.content);
  }

  const now = new Date().toISOString();
  const reset: PromptTemplate = {
    ...existing,
    content: existing.defaultContent,
    isModified: false,
    version: existing.version + 1,
    updatedAt: now,
  };

  const prompts = await readPromptsJson();
  const index = prompts.findIndex(p => p.id === promptId);

  if (index !== -1) {
    prompts[index] = {
      id: reset.id,
      name: reset.name,
      category: reset.category,
      description: reset.description,
      content: reset.content,
      variables: reset.variables,
      isModified: reset.isModified,
      version: reset.version,
      createdAt: reset.createdAt,
      updatedAt: reset.updatedAt,
      defaultContent: reset.defaultContent,
    };
    await writePromptsJson(prompts);
  }

  return reset;
}

/**
 * Delete a prompt
 * @param promptId - Prompt UUID
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const prompts = await readPromptsJson();
  const filteredPrompts = prompts.filter(p => p.id !== promptId);
  await writePromptsJson(filteredPrompts);

  // Delete versions directory
  try {
    await fs.rm(getVersionsDir(promptId), { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
}

/**
 * Get version history for a prompt
 * @param promptId - Prompt UUID
 * @returns Array of prompt versions
 */
export async function getPromptVersions(promptId: string): Promise<PromptVersion[]> {
  const versionsDir = getVersionsDir(promptId);

  try {
    await fs.mkdir(versionsDir, { recursive: true });
    const files = await fs.readdir(versionsDir);

    const versions: PromptVersion[] = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const match = file.match(/^v(\d+)\.md$/);
        if (match) {
          const version = parseInt(match[1], 10);
          const content = await fs.readFile(path.join(versionsDir, file), 'utf-8');
          const stats = await fs.stat(path.join(versionsDir, file));

          versions.push({
            id: `${promptId}-v${version}`,
            promptId,
            version,
            content,
            createdAt: stats.mtime.toISOString(),
          });
        }
      }
    }

    return versions.sort((a, b) => a.version - b.version);
  } catch {
    return [];
  }
}

/**
 * Validate prompt variables
 * @param variables - Prompt variable definitions
 * @param values - Variable values to validate
 * @returns Validation result
 */
export interface VariableValidationResult {
  isValid: boolean;
  missingVariables: string[];
  invalidVariables: Array<{ name: string; reason: string }>;
}

export function validatePromptVariables(
  variables: PromptVariable[],
  values: Record<string, string>
): VariableValidationResult {
  const missingVariables: string[] = [];
  const invalidVariables: Array<{ name: string; reason: string }> = [];

  for (const variable of variables) {
    const value = values[variable.name];

    // Check if required variable is missing
    if (variable.required) {
      if (value === undefined || value === null || value === '') {
        missingVariables.push(variable.name);
        continue;
      }
    }

    // Skip type validation if value is empty and not required
    if (!value && !variable.required) {
      continue;
    }

    // Validate type-specific formats
    if (value) {
      if (variable.type === 'array') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            invalidVariables.push({
              name: variable.name,
              reason: 'Value must be a valid JSON array',
            });
          }
        } catch {
          invalidVariables.push({
            name: variable.name,
            reason: 'Invalid JSON array format',
          });
        }
      } else if (variable.type === 'object') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            invalidVariables.push({
              name: variable.name,
              reason: 'Value must be a valid JSON object',
            });
          }
        } catch {
          invalidVariables.push({
            name: variable.name,
            reason: 'Invalid JSON object format',
          });
        }
      }
    }
  }

  return {
    isValid: missingVariables.length === 0 && invalidVariables.length === 0,
    missingVariables,
    invalidVariables,
  };
}
