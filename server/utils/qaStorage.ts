/**
<<<<<<< HEAD
 * QA Storage Utilities
 * File system operations for Q&A persistence
 */
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Question, QASession, QACategory, QuestionTemplate } from '../../src/types/qa.ts';

// Paths
export const WORKSPACE_PATH = path.join(process.cwd(), 'workspace');
export const TEMPLATES_PATH = path.join(WORKSPACE_PATH, 'templates/questions');
export const SESSIONS_PATH = path.join(WORKSPACE_PATH, 'qa-sessions');

/**
 * Ensure QA directories exist
 */
export async function ensureQADirectoriesExist(): Promise<void> {
  await fs.mkdir(TEMPLATES_PATH, { recursive: true });
  await fs.mkdir(SESSIONS_PATH, { recursive: true });
}

/**
 * Load question templates from JSON files
 * @returns Array of all questions from templates
 */
export async function loadQuestionTemplates(): Promise<Question[]> {
  const questions: Question[] = [];

  try {
    await ensureQADirectoriesExist();
    const files = await fs.readdir(TEMPLATES_PATH);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(TEMPLATES_PATH, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const template = JSON.parse(content) as QuestionTemplate;

          // Add categoryId to each question from template
          const templateQuestions = template.questions.map((q, index) => ({
            ...q,
            categoryId: template.categoryId,
            id: q.id || `${template.categoryId}-q-${index + 1}`,
          }));

          questions.push(...templateQuestions);
        } catch {
          // Skip invalid JSON files
        }
      }
    }
  } catch {
    // Return empty array if templates don't exist
  }

  return questions.sort((a, b) => a.order - b.order);
}

/**
 * Load categories from question templates
 * @returns Array of categories
 */
export async function loadCategories(): Promise<QACategory[]> {
  const categories: QACategory[] = [];

  try {
    await ensureQADirectoriesExist();
    const files = await fs.readdir(TEMPLATES_PATH);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(TEMPLATES_PATH, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const template = JSON.parse(content) as QuestionTemplate;

          // Determine order based on filename or template
          const order = getTemplateOrder(file);

          categories.push({
            id: template.categoryId,
            name: template.categoryName,
            description: template.categoryDescription,
            order,
            questionCount: template.questions.length,
          });
        } catch {
          // Skip invalid JSON files
        }
      }
    }
  } catch {
    // Return empty array if templates don't exist
  }

  return categories.sort((a, b) => a.order - b.order);
}

/**
 * Get template order based on filename
 */
function getTemplateOrder(filename: string): number {
  const orderMap: Record<string, number> = {
    'game_mechanic.json': 1,
    'economy.json': 2,
    'growth.json': 3,
    'narrative.json': 4,
    'ux.json': 5,
  };
  return orderMap[filename] || 99;
}

/**
 * Get questions by category
 * @param categoryId - Category ID to filter
 * @returns Array of questions for the category
 */
export async function getQuestionsByCategory(categoryId: string): Promise<Question[]> {
  const allQuestions = await loadQuestionTemplates();
  return allQuestions.filter(q => q.categoryId === categoryId);
}

/**
 * Create a new QA session
 * @param taskId - Task ID
 * @param projectId - Project ID
 * @returns Created session
 */
export async function createSession(taskId: string, projectId: string): Promise<QASession> {
  await ensureQADirectoriesExist();

  const session: QASession = {
    id: uuidv4(),
    taskId,
    projectId,
    answers: {},
    completedCategories: [],
    isComplete: false,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveSession(session);
  return session;
}

/**
 * Save a session to disk
 * @param session - Session to save
 */
export async function saveSession(session: QASession): Promise<void> {
  await ensureQADirectoriesExist();
  const sessionPath = path.join(SESSIONS_PATH, `${session.id}.json`);
  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
}

/**
 * Get a session by ID
 * @param sessionId - Session ID
 * @returns Session if found, null otherwise
 */
export async function getSessionById(sessionId: string): Promise<QASession | null> {
  const sessionPath = path.join(SESSIONS_PATH, `${sessionId}.json`);

  try {
    const content = await fs.readFile(sessionPath, 'utf-8');
=======
 * Q&A Storage Utility
 * Handles reading and writing Q&A session data to workspace/qa-sessions/
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { QASession, QACategory } from '../../src/types/qa';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to Q&A sessions directory
 */
export const QA_SESSIONS_DIR = path.resolve(__dirname, '../../workspace/qa-sessions');

/**
 * Ensure Q&A sessions directory exists
 */
async function ensureDirectory(): Promise<void> {
  try {
    await fs.mkdir(QA_SESSIONS_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get session file path for a task
 */
function getSessionFilePath(taskId: string): string {
  return path.join(QA_SESSIONS_DIR, `${taskId}.json`);
}

/**
 * Get Q&A session by task ID
 */
export async function getQASessionByTaskId(taskId: string): Promise<QASession | null> {
  const filePath = getSessionFilePath(taskId);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
>>>>>>> main
    return JSON.parse(content) as QASession;
  } catch {
    return null;
  }
}

/**
<<<<<<< HEAD
 * Update a session
 * @param sessionId - Session ID
 * @param updates - Partial session updates
 * @returns Updated session or null if not found
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<QASession>
): Promise<QASession | null> {
=======
 * Create a new Q&A session for a task
 */
export async function createQASession(
  taskId: string,
  category: QACategory
): Promise<QASession> {
  await ensureDirectory();

  const session: QASession = {
    id: uuidv4(),
    taskId,
    category,
    status: 'in_progress',
    currentStep: 0,
    answers: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  await saveQASession(session);
  return session;
}

/**
 * Save Q&A session to file
 */
export async function saveQASession(session: QASession): Promise<QASession> {
  await ensureDirectory();

  const filePath = getSessionFilePath(session.taskId);
  await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');

  return session;
}

/**
 * Delete Q&A session
 */
export async function deleteQASession(taskId: string): Promise<boolean> {
  const filePath = getSessionFilePath(taskId);

  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * List all Q&A sessions
 */
export async function listQASessions(): Promise<QASession[]> {
  await ensureDirectory();

  try {
    const files = await fs.readdir(QA_SESSIONS_DIR);
    const sessions: QASession[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(
            path.join(QA_SESSIONS_DIR, file),
            'utf-8'
          );
          sessions.push(JSON.parse(content) as QASession);
        } catch {
          // Skip invalid files
        }
      }
    }

    return sessions;
  } catch {
    return [];
  }
}

// ============================================================================
// Project QA Session Functions
// Used by qa-sessions.ts routes for project/task-scoped Q&A progress tracking
// ============================================================================

/**
 * Project QA Session interface for tracking Q&A progress per task
 */
export interface ProjectQASession {
  id: string;
  taskId: string;
  projectId: string;
  answers: Record<string, string>;
  isComplete: boolean;
  progress: number;
  completedCategories: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get file path for a project QA session by its ID
 */
function getProjectSessionFilePath(sessionId: string): string {
  return path.join(QA_SESSIONS_DIR, `${sessionId}.json`);
}

/**
 * Create a new project QA session
 */
export async function createSession(
  taskId: string,
  projectId: string
): Promise<ProjectQASession> {
  await ensureDirectory();

  const now = new Date().toISOString();
  const session: ProjectQASession = {
    id: uuidv4(),
    taskId,
    projectId,
    answers: {},
    isComplete: false,
    progress: 0,
    completedCategories: [],
    createdAt: now,
    updatedAt: now,
  };

  const filePath = getProjectSessionFilePath(session.id);
  await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');

  return session;
}

/**
 * Get a project QA session by ID
 */
export async function getSessionById(sessionId: string): Promise<ProjectQASession | null> {
  const filePath = getProjectSessionFilePath(sessionId);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ProjectQASession;
  } catch {
    return null;
  }
}

/**
 * Update a project QA session
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<ProjectQASession, 'answers' | 'completedCategories' | 'progress'>>
): Promise<ProjectQASession | null> {
>>>>>>> main
  const session = await getSessionById(sessionId);

  if (!session) {
    return null;
  }

<<<<<<< HEAD
  const updatedSession: QASession = {
    ...session,
    ...updates,
    id: session.id, // Ensure ID cannot be changed
    updatedAt: new Date().toISOString(),
  };

  await saveSession(updatedSession);
=======
  const updatedSession: ProjectQASession = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate progress if answers were updated
  if (updates.answers) {
    const answerCount = Object.keys(updatedSession.answers).length;
    // Simple progress calculation - can be enhanced based on total questions
    updatedSession.progress = Math.min(answerCount * 10, 100);
  }

  const filePath = getProjectSessionFilePath(sessionId);
  await fs.writeFile(filePath, JSON.stringify(updatedSession, null, 2), 'utf-8');

>>>>>>> main
  return updatedSession;
}

/**
<<<<<<< HEAD
 * Complete a session
 * @param sessionId - Session ID
 * @returns Completed session or null if not found
 */
export async function completeSession(sessionId: string): Promise<QASession | null> {
=======
 * Mark a project QA session as complete
 */
export async function completeSession(sessionId: string): Promise<ProjectQASession | null> {
>>>>>>> main
  const session = await getSessionById(sessionId);

  if (!session) {
    return null;
  }

<<<<<<< HEAD
  const completedSession: QASession = {
=======
  const completedSession: ProjectQASession = {
>>>>>>> main
    ...session,
    isComplete: true,
    progress: 100,
    updatedAt: new Date().toISOString(),
  };

<<<<<<< HEAD
  await saveSession(completedSession);
=======
  const filePath = getProjectSessionFilePath(sessionId);
  await fs.writeFile(filePath, JSON.stringify(completedSession, null, 2), 'utf-8');

>>>>>>> main
  return completedSession;
}

/**
<<<<<<< HEAD
 * Get all sessions for a task
 * @param taskId - Task ID
 * @returns Array of sessions for the task
 */
export async function getSessionsByTask(taskId: string): Promise<QASession[]> {
  const sessions: QASession[] = [];

  try {
    await ensureQADirectoriesExist();
    const files = await fs.readdir(SESSIONS_PATH);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const sessionPath = path.join(SESSIONS_PATH, file);
        try {
          const content = await fs.readFile(sessionPath, 'utf-8');
          const session = JSON.parse(content) as QASession;
          if (session.taskId === taskId) {
            sessions.push(session);
          }
        } catch {
          // Skip invalid JSON files
        }
      }
    }
  } catch {
    // Return empty array if sessions don't exist
  }

  return sessions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Delete a session
 * @param sessionId - Session ID
 * @returns true if deleted, false if not found
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  const sessionPath = path.join(SESSIONS_PATH, `${sessionId}.json`);

  try {
    await fs.unlink(sessionPath);
    return true;
  } catch {
    return false;
=======
 * Get all project QA sessions for a task
 */
export async function getSessionsByTask(taskId: string): Promise<ProjectQASession[]> {
  await ensureDirectory();

  try {
    const files = await fs.readdir(QA_SESSIONS_DIR);
    const sessions: ProjectQASession[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(
            path.join(QA_SESSIONS_DIR, file),
            'utf-8'
          );
          const session = JSON.parse(content) as ProjectQASession;
          // Check if this is a ProjectQASession (has projectId) and matches taskId
          if (session.projectId && session.taskId === taskId) {
            sessions.push(session);
          }
        } catch {
          // Skip invalid files
        }
      }
    }

    return sessions;
  } catch {
    return [];
>>>>>>> main
  }
}
