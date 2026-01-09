/**
 * Completed Document Storage Utilities
 * File system operations for completed documents (SPEC-DOCREF-001)
 *
 * Completed documents include:
 * - Tasks in 'prototype' status (active but complete)
 * - Archived tasks (stored in archives)
 */
import type {
  Task,
  Archive,
  CompletedDocumentSummary,
  CompletedDocumentDetail,
  CompletedDocumentsQueryOptions,
} from '../../src/types/index.ts';
import { getTasksByProject } from './taskStorage.ts';
import { getArchivesByProject } from './archiveStorage.ts';

/**
 * Default pagination limit
 */
const DEFAULT_LIMIT = 50;

/**
 * Helper: Case-insensitive search in text
 * @param text - Text to search in (can be null)
 * @param keyword - Keyword to search for
 * @returns true if keyword found in text
 */
export function searchInContent(text: string | null | undefined, keyword: string): boolean {
  if (!text || !keyword) {
    return false;
  }
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Convert a Task to CompletedDocumentSummary
 * @param task - Task to convert
 * @param isArchived - Whether this task is archived
 * @param archivedAt - Archive timestamp (if archived)
 */
function taskToSummary(
  task: Task,
  isArchived: boolean,
  archivedAt?: string
): CompletedDocumentSummary {
  return {
    taskId: task.id,
    title: task.title,
    status: isArchived ? 'archived' : 'prototype',
    references: task.references,
    hasDesignDoc: task.designDocument !== null && task.designDocument !== '',
    hasPrd: task.prd !== null && task.prd !== '',
    hasPrototype: task.prototype !== null && task.prototype !== '',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    ...(archivedAt && { archivedAt }),
  };
}

/**
 * Convert a Task to CompletedDocumentDetail
 * @param task - Task to convert
 * @param isArchived - Whether this task is archived
 * @param archivedAt - Archive timestamp (if archived)
 */
function taskToDetail(
  task: Task,
  isArchived: boolean,
  archivedAt?: string
): CompletedDocumentDetail {
  return {
    taskId: task.id,
    title: task.title,
    status: isArchived ? 'archived' : 'prototype',
    references: task.references,
    featureList: task.featureList,
    designDocument: task.designDocument,
    prd: task.prd,
    prototype: task.prototype,
    qaAnswers: task.qaAnswers,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    ...(archivedAt && { archivedAt }),
  };
}

/**
 * Filter document by search keyword
 * Searches in: title, featureList, designDocument
 */
function matchesSearch(task: Task, keyword: string): boolean {
  if (!keyword) {
    return true;
  }
  return (
    searchInContent(task.title, keyword) ||
    searchInContent(task.featureList, keyword) ||
    searchInContent(task.designDocument, keyword)
  );
}

/**
 * Filter document by document types
 * @param task - Task to check
 * @param types - Document types to filter by (design, prd, prototype)
 * @returns true if task has any of the specified document types
 */
export function filterByDocumentType(task: Task, types: string[]): boolean {
  if (!types || types.length === 0) {
    return true;
  }

  const hasDesignDoc = task.designDocument !== null && task.designDocument !== '';
  const hasPrd = task.prd !== null && task.prd !== '';
  const hasPrototype = task.prototype !== null && task.prototype !== '';

  return types.some((type) => {
    switch (type.toLowerCase()) {
      case 'design':
        return hasDesignDoc;
      case 'prd':
        return hasPrd;
      case 'prototype':
        return hasPrototype;
      default:
        return false;
    }
  });
}

/**
 * Filter document by references
 * @param task - Task to check
 * @param referenceIds - Reference IDs to filter by
 * @returns true if task has any of the specified references
 */
export function filterByReference(task: Task, referenceIds: string[]): boolean {
  if (!referenceIds || referenceIds.length === 0) {
    return true;
  }

  return referenceIds.some((refId) => task.references.includes(refId));
}

/**
 * Get all completed documents for a project
 * Combines prototype tasks and archived tasks
 *
 * @param projectId - Project ID
 * @param options - Query options for filtering
 * @returns Array of completed document summaries
 */
export async function getCompletedDocuments(
  projectId: string,
  options: CompletedDocumentsQueryOptions = {}
): Promise<CompletedDocumentSummary[]> {
  const {
    search,
    documentType,
    reference,
    limit = DEFAULT_LIMIT,
    offset = 0,
  } = options;

  // Get prototype tasks from tasks.json
  const allTasks = await getTasksByProject(projectId);
  const prototypeTasks = allTasks.filter((task) => task.status === 'prototype');

  // Get archived tasks from archives.json
  const archives = await getArchivesByProject(projectId);

  // Convert to summaries
  const prototypeSummaries = prototypeTasks.map((task) =>
    taskToSummary(task, false)
  );
  const archivedSummaries = archives.map((archive) =>
    taskToSummary(archive.task, true, archive.archivedAt)
  );

  // Combine all summaries
  let results = [...prototypeSummaries, ...archivedSummaries];

  // Apply search filter
  if (search) {
    const allTasksForSearch = [
      ...prototypeTasks,
      ...archives.map((a) => a.task),
    ];
    const matchingTaskIds = new Set(
      allTasksForSearch
        .filter((task) => matchesSearch(task, search))
        .map((task) => task.id)
    );
    results = results.filter((summary) => matchingTaskIds.has(summary.taskId));
  }

  // Apply document type filter
  if (documentType && documentType.length > 0) {
    const allTasksForFilter = [
      ...prototypeTasks,
      ...archives.map((a) => a.task),
    ];
    const taskMap = new Map(allTasksForFilter.map((t) => [t.id, t]));
    results = results.filter((summary) => {
      const task = taskMap.get(summary.taskId);
      return task && filterByDocumentType(task, documentType);
    });
  }

  // Apply reference filter
  if (reference && reference.length > 0) {
    const allTasksForFilter = [
      ...prototypeTasks,
      ...archives.map((a) => a.task),
    ];
    const taskMap = new Map(allTasksForFilter.map((t) => [t.id, t]));
    results = results.filter((summary) => {
      const task = taskMap.get(summary.taskId);
      return task && filterByReference(task, reference);
    });
  }

  // Apply pagination
  return results.slice(offset, offset + limit);
}

/**
 * Get a single completed document by task ID
 *
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @returns Completed document detail or null if not found
 */
export async function getCompletedDocumentById(
  projectId: string,
  taskId: string
): Promise<CompletedDocumentDetail | null> {
  // Check prototype tasks first
  const allTasks = await getTasksByProject(projectId);
  const prototypeTask = allTasks.find(
    (task) => task.id === taskId && task.status === 'prototype'
  );

  if (prototypeTask) {
    return taskToDetail(prototypeTask, false);
  }

  // Check archived tasks
  const archives = await getArchivesByProject(projectId);
  const archive = archives.find((a) => a.task.id === taskId);

  if (archive) {
    return taskToDetail(archive.task, true, archive.archivedAt);
  }

  return null;
}
